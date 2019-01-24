import { sha256 } from '../helps/crypto'
import { BaseRepository } from "./base/BaseRepository";
import { User } from "../entities/User"

interface auth {
  username: string;
  password: string;
}
export class UserRepository extends BaseRepository<User>{
  async auth({ username, password }: auth): Promise<any> {

    const passwordHash = this.generatePassword(password);
    return await this._connect(this._table).where('username', username).andWhere('password', passwordHash).first();
  }

  async changePassword({ username, password }: auth): Promise<any> {
    const passwordHash = this.generatePassword(password);
    return await this._connect(this._table).where('username', username).update('password', passwordHash);
  }
  private generatePassword(password: string) {
    const passwordHash = sha256(password);
    return passwordHash;
  }
}