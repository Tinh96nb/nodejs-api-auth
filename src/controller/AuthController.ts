import { google } from 'googleapis';
import * as jwt from '../helps/jwt';
import { md5 } from '../helps/crypto';
import { setKey, deleteKey } from '../helps/redis';
import { typeDeviceConnect } from '../const/typeDeviceConnect';
import { getBrowser } from '../helps/getBrowser';

interface Payload {
  username: string;
  email: string;
  browser?: string;
}
export class AuthController<T>
{
  private oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  private readonly UserRepo: any;
  constructor(UserRepo: any) {
    this.UserRepo = UserRepo;
  }

  public getGoogleLoginPageURI(req: any, res: any, next: any) {
    const scope = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'openid',
      'profile'
    ];
    if (!req.query || !req.query.callback) {
      res.send(401, { message: 'Callback is required!.' });
      return next();
    }

    const callbackUrl = Buffer.from(JSON.stringify(req.query.callback)).toString('base64');
    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scope,
      include_granted_scopes: true,
      response_type: 'code',
      state: callbackUrl
    });
    res.redirect(url, next);
  }

  public async getDataFromLoginRedirect(req: any, res: any, next: any) {
    const { code, state } = req.query;
    const callbackUrl = JSON.parse(Buffer.from(state, 'base64').toString('ascii'));
    const { tokens } = await this.oauth2Client.getToken(code);
    const idToken = tokens.id_token ? tokens.id_token : '';
    const getInfo = idToken.split('.');
    const profile: any = JSON.parse(this.oauth2Client.decodeBase64(getInfo[1]));
    // check user in db
    const user = await this.UserRepo.findBy('email', profile.email);
    if (!user) {
      res.send(401, { message: 'Not found user' });
      return next();
    }
    const browser = getBrowser(req);
    const payload = {
      id: user.id,
      email: profile.email,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      department_id: user.department_id,
      browser
    }
    const jwtToken = await this.createJWT(payload);
    const linkRedirect = `${callbackUrl}?token=${jwtToken}`;
    res.redirect(linkRedirect, next);
  }

  public async login(req: any, res: any, next: any) {
    if (!req.body) {
      res.send(400, { message: 'Username and password is required.' });
      return next();
    }
    const { username, password } = req.body;
    if (!username || !password) {
      res.send(400, { message: 'Username and password is required.' });
      return next();
    }

    const user = await this.UserRepo.auth({ username, password });
    if (!user) {
      res.send(400, { message: 'Invalid username and password.' });
      return next();
    }
    let browser = getBrowser(req);
    browser = browser ? browser : 'unknown';

    const payload = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      department_id: user.department_id,
      browser
    }

    const jwtToken = await this.createJWT(payload);
    res.send({ token: jwtToken });
  }

  private async createJWT(payload: Payload) {
    // create data token
    const nonce = Math.floor((Math.random() * 100) + 1);
    const suffix = `${payload.browser}-${nonce}`;
    const dataToken = { ...payload, suffix };
    delete dataToken.browser;
    const hashDataToken = md5(JSON.stringify(dataToken));
    // save on redis
    setKey(dataToken.username, hashDataToken, suffix);
    // create token
    const jwtToken = jwt.sign({ data: dataToken, hash: hashDataToken });
    return jwtToken;
  }

  public async logout(req: any, res: any, next: any) {
    const userCurrent = req.get('user');
    let browser = getBrowser(req);
    let suffix;
    if (typeDeviceConnect[browser]) {
      suffix = `${typeDeviceConnect[browser]}`;
    } else {
      suffix = 'all';
    }
    try {
      const result = await deleteKey(userCurrent.username, suffix);
      if (result) return res.send('logout success');
    } catch (error) {
      res.send(500, {message: '500 internal server error'});
      console.log(error);
    }
    res.send(400, 'errors');
  }
}