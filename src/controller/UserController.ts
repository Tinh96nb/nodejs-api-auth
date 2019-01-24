import { UserRepository } from '../repositories/UserRepository';

export class UserController<T> {

  private userRepository : UserRepository;

  constructor (Repo: UserRepository){
    this.userRepository = Repo;
  }

  public async profile(req: any, res: any, next: any) {
    const userCurrent = req.get('user');
    const result = await this.userRepository.findBy('username', userCurrent.username);
    if (!result) res.send(400, { message: 'Not found user.'});
    res.send(result);
  }

  public async changePassword(req: any, res: any, next: any) {
    if (!req.body || !req.body.password) {
      res.send(400, { message: 'Please enter new password.' });
      return next();
    }
    const { password } = req.body;
    const userCurrent = req.get('user');
    const result = await this.userRepository.changePassword({
      username: userCurrent.username,
      password: password
    });
    if (!result) {
      res.send(400, { message: 'errors'});
    }
    res.send('change password success');
  }
}