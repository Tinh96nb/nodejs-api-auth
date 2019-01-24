export interface Read<T> {
  find(item: T): any;
  findOne(id: string): any;
}