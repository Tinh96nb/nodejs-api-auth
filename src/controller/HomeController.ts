
export class HomeController<T> {

  public async index(req: any, res: any, next: any) {
    res.send('home page');
  }
}