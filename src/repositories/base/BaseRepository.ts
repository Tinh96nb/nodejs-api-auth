import { Write } from '../interfaces/Write';
import { Read } from '../interfaces/Read';

export abstract class BaseRepository<T> implements Write<T>, Read<T> {

  public readonly _table: any;
  public readonly _connect: any;
  constructor(connector: any, tableName: string) {
    this._connect = connector;
    this._table = tableName;
  }

  async create(item: T): Promise<boolean> {
    const result = await this._connect(this._table).insert(item);
    return !!result.result.ok;
  }

  update(id: string, item: T): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  delete(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  async find(item?: any): Promise<any> {
    return await this._connect(this._table).select()
  }

  async findBy(field: string, val: string): Promise<any> {
    return await this._connect(this._table).where(field, val).first();
  }

  findOne(id: string): Promise<T> {
    throw new Error('Method not implemented.');
  }
}