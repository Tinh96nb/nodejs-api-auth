import * as restify from 'restify';
import * as dotenv from 'dotenv';
dotenv.config();

// connection database
import { Connection } from './src/db';

// import Repository
import { UserRepository } from './src/repositories/UserRepository';

// import controller
import { HomeController } from './src/controller/HomeController';
import { UserController} from './src/controller/UserController';
import { AuthController } from './src/controller/AuthController';

// import middleware
import { CheckAuth } from './src/middleware/CheckAuth';

const server = restify.createServer();
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser({ mapParams: false }));
server.pre(restify.plugins.pre.context());
server.use(restify.plugins.bodyParser({
  maxBodySize: 0,
  mapParams: true,
  mapFiles: false,
  overrideParams: false
}))

const connection = new Connection().knex()
// repository
const userRepository = new UserRepository(connection, 'user');
// controller
const userController = new UserController(userRepository);
const authController = new AuthController(userRepository);
const homeController = new HomeController();
// middleware
const checkAuth = new CheckAuth(userRepository);

// public router
server.get('/', (req, res, next) => homeController.index(req, res, next))
server.post('/login', (req, res, next) => authController.login(req, res, next))
server.get('/google-auth', (req, res, next) => authController.getGoogleLoginPageURI(req, res, next))
server.get('/google-auth/callback', (req, res, next) => authController.getDataFromLoginRedirect(req, res, next))
// private router
server.get('/profile',
  (req, res, next) => checkAuth.handle(req, res, next),
  (req, res, next) => userController.profile(req, res, next)
)
server.post('/change-password',
  (req, res, next) => checkAuth.handle(req, res, next),
  (req, res, next) => userController.changePassword(req, res, next)
)
server.get('/logout',
  (req, res, next) => checkAuth.handle(req, res, next),
  (req, res, next) => authController.logout(req, res, next)
)

server.listen(80);