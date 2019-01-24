import * as jwt from '../helps/jwt';
import { getKey } from '../helps/redis';

export class CheckAuth {
  private readonly UserRepo: any;
  constructor(UserRepo: any) {
    this.UserRepo = UserRepo
  }
  async handle(req: any, res: any, next: any) {
    if (!req.headers || !req.headers.authorization) {
      res.send(401, {message: 'Token is required!'});
      return false;
    }
    const token: any = jwt.verify(req.headers.authorization.split(' ')[1]);
    // check valid token
    if (!token) {
      res.send(401, {message: 'Token invalid!'});
      return false;
    }
    const dataToken = token.data;
    // check in redis
    const key = `${dataToken.username}-${dataToken.suffix}`;
    const hashTokenRedis = await getKey(key);
    if (hashTokenRedis !== token.hash) {
      res.send(401, {message: 'Token invalid!'});
      return false;
    }
    // check in database
    try {
      const user = await this.UserRepo.findBy('username', dataToken.username);
      if (!user) {
        res.send(401, {message:'User not found in database!'});
        return false;
      }
      req.set('user', user);
    } catch (error) {
      res.send(500, {message: '500 internal server error'});
      console.log(error);
    }
    return next();
  }
}