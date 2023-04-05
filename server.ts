import 'zone.js/dist/zone-node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import express from 'express';
import { join } from 'path';

import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';

import { PaginatedProductsList, Product } from 'src/app/models/product.model';
import { AxiosError } from 'axios';

import { get } from 'env-var';

import { v4 as uuidv4 } from 'uuid';
import { LogLevel } from 'angular-auth-oidc-client';

import { Category } from 'src/app/models/category.model';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  console.log("Express server side setup is complete....")
  const server = express();

  const distFolder = join(process.cwd(), 'dist/globex-mobile/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

  // HTTP and WebSocket traffic both use this port
  const NODE_ENV = get('NODE_ENV').default('dev').asEnum(['dev', 'prod']);
  const LOG_LEVEL = get('LOG_LEVEL').asString();

  const  PORT = get('PORT').default(4200).asPortNumber();

  //setup pathways
  //client UI to SSR calls
  const ANGULR_API_GETPAGINATEDPRODUCTS =  '/api/getPaginatedProducts';
  const ANGULR_HEALTH = '/health';
  const ANGULR_API_LOGIN = '/api/login';
  const ANGULAR_API_AUTHCONFIG = '/api/getAuthConfig';
  const ANGULR_API_GETCATEGORIES = '/api/getCategories';
  const ANGULR_API_GETPRODUCTSBYCATEGORY = '/api/prodByCategoryUrl';

  
  
  // external micro services typically running on OpenShift
  const API_MANAGEMENT_FLAG = get('API_MANAGEMENT_FLAG').default("NO").asString();
  const API_GET_PAGINATED_PRODUCTS = get('API_GET_PAGINATED_PRODUCTS').default('http://3ea8ea3c-2bc9-45ae-9dc9-73aad7d8eafb.mock.pstmn.io/services/products').asString();
  const API_CUSTOMER_SERVICE = get('API_CUSTOMER_SERVICE').default('').asString();
  const GLOBEX_MOBILE_GATEWAY = get('GLOBEX_MOBILE_GATEWAY').asString();

  //setup keycloak auth settings
  const API_CLIENT_ID = get('API_CLIENT_ID').default('').asString();
  const SSO_AUTHORITY = get('SSO_AUTHORITY').default('').asString();
  const SSO_REDIRECT_LOGOUT_URI = get('SSO_REDIRECT_LOGOUT_URI').default('').asString();
  const SSO_LOG_LEVEL = get('SSO_LOG_LEVEL').default(LogLevel.Error).asString();
  
  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  

  // Example Express Rest API endpoints
  //const http = require('http');
  const bodyParser = require('body-parser');
  const cookieParser = require('cookie-parser')
  const axios = require('axios');

  server.use(bodyParser.json());
  server.use(cookieParser())
  server.use(bodyParser.urlencoded({extended: true}) );

  // Session handling
  const sessions = new Map<string, Session>();
  const accessTokenSessions = new Map<string, Session>();

  //Access Token parsing
  var Buffer = require('buffer').Buffer;


  //API Setup START
  server.get(ANGULAR_API_AUTHCONFIG, (req, res) => {
    res.send(
      {
        "API_CLIENT_ID" : API_CLIENT_ID,
        "SSO_AUTHORITY_KEY": SSO_AUTHORITY,
        "SSO_REDIRECT_LOGOUT_URI_KEY": SSO_REDIRECT_LOGOUT_URI,
        "SSO_LOG_LEVEL_KEY": SSO_LOG_LEVEL
      }
      
      );
  });

  server.get(ANGULR_API_GETPAGINATEDPRODUCTS, (req, res) => {
    var getProducts:PaginatedProductsList;
    var myTimestamp = new Date().getTime().toString();
    var url = API_GET_PAGINATED_PRODUCTS.toString();
    var limit = req.query['limit'];
    var page = req.query['page'];

    axios.get(url, {params: { limit: limit, timestamp:myTimestamp , page: page } })
      .then(response => {
        getProducts =  response.data;;
        res.send(getProducts);
      })
      .catch(error => {
        console.log("ANGULR_API_GETPAGINATEDPRODUCTS", error);
      });
  });


  // POST LOGIN API Call
  server.post(ANGULR_API_LOGIN, (req, res) => {
    const accessToken: string = req.body.accessToken;
    const accessTokenPart: string = accessToken.split('.')[1];
    const decoded: any = JSON.parse(Buffer.from(accessTokenPart, 'base64').toString());
    const sessionToken: string = decoded.sid;
    const sessionExpiresAt: number = decoded.exp * 1000;
    sessions.set(sessionToken, new Session(decoded.preferred_username, sessionExpiresAt, accessToken));
    accessTokenSessions.set(sessionToken, req.body.accessToken);
    res.cookie("globex_session_token", sessionToken, { expires: new Date(sessionExpiresAt), sameSite: 'lax' });
    res.status(200).send({"success": true});
  });

  // DELETE LOGIN API Call
  server.delete(ANGULR_API_LOGIN, (req, res) => {
    if (!req.cookies) {
      res.status(401).send();
      return;
    }
    const sessionToken = req.cookies['globex_session_token']
    if (!sessionToken) {
        res.status(401).send();
        return;
    }
    sessions.delete(sessionToken);
    accessTokenSessions.delete(sessionToken);
    res.status(204).send();
  });

  
  server.get(ANGULR_API_GETCATEGORIES, async (req, res) => {
    const sessionToken = req.cookies['globex_session_token']
    const tokenStr = accessTokenSessions.get(sessionToken);
    var categories: Category[];
    var url = GLOBEX_MOBILE_GATEWAY + "/mobile/services/category/list";
    
    axios.get(url, { headers: {"Authorization" : `Bearer ${tokenStr}`} })
      .then(response => {
        categories = response.data;;
        res.send(categories);
      })
      .catch(error => {
        console.log("ANGULR_API_GETCATEGORIES", error);
      }); 
  });

  server.get(ANGULR_API_GETPRODUCTSBYCATEGORY + '/:categoryName', async (req, res) => {
    let categoryName = req.params.categoryName;
    const sessionToken = req.cookies['globex_session_token']
    const tokenStr = accessTokenSessions.get(sessionToken);
    
    var productsList: Product[];
    var url = GLOBEX_MOBILE_GATEWAY + "/mobile/services/product/category/" + categoryName;
    
    axios.get(url, { headers: {"Authorization" : `Bearer ${tokenStr}`} })
      .then(response => {
        productsList = response.data;;
        res.send(productsList);
      })
      .catch(error => {
        console.log("ANGULR_API_GETCATEGORIES", error);
      });
  });


  

//API Setup END

//Health check
  server.get(ANGULR_HEALTH, (req, res) => {
    var healthcheck = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: Date.now()
    };
    res.send(healthcheck);
  });


  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
  });


  return server;
}

function validateSession(sessions: Map<string, Session>, token: string, user: string): boolean {
  if (!sessions.get(token)) {
    console.log('No session found for ', token);
    return false;
  }
  let active = sessions.get(token);
  if (active.isExpired()) {
    console.log('Session ' + token + ' is expired');
    sessions.delete(token);
    return false;
  }
  if (!active.isOwnedBy(user)) {
    console.log('Session ' + token + ' is not owned by ' + user);
    return false;
  }
  return true;
}


function run(): void {
  const port = process.env['PORT'] || 4200;
  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });


  ['log', 'warn', 'error'].forEach((methodName) => {
    const originalMethod = console[methodName];
    console[methodName] = (...args) => {
      let initiator = 'unknown place';
      try {
        throw new Error();
      } catch (e) {
        if (typeof e.stack === 'string') {
          let isFirst = true;
          for (const line of e.stack.split('\n')) {
            const matches = line.match(/^\s+at\s+(.*)/);
            if (matches) {
              if (!isFirst) { // first line - current function
                              // second line - caller (what we are looking for)
                initiator = matches[1];
                break;
              }
              isFirst = false;
            }
          }
        }
      }
      originalMethod.apply(console, [...args, '\n', `  at ${initiator}`]);
    };
  });
}

class Session {

  private username: String;
  private expiresAt: number;
  private accessToken: String;

  constructor(username: String, expiresAt: number, accessToken: any) {
    this.username = username;
    this.expiresAt = expiresAt;
    this.accessToken = accessToken;
}

  isExpired(): boolean {
    return this.expiresAt < Date.now();
  }

  isOwnedBy(user: String) {
    return this.username == user;
  }

  getAccessToken(): String {
    return this.accessToken;
  }
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';





