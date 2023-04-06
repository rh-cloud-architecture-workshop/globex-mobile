import 'zone.js/dist/zone-node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import express from 'express';
import { join } from 'path';

import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';

import { PaginatedProductsList } from 'src/app/models/product.model';
import { AxiosError } from 'axios';

import { get } from 'env-var';

import { v4 as uuidv4 } from 'uuid';
import { LogLevel } from 'angular-auth-oidc-client';



// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  console.log("Express server side setup is complete....")
  const server = express();

  const distFolder = join(process.cwd(), 'dist/globex-mobile/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';


  //setup pathways
  //client UI to SSR calls
  const ANGULR_HEALTH = '/health';
  const ANGULR_API_LOGIN = '/api/login';
  const ANGULR_API_CUSTOMER = '/api/customer';
  const ANGULAR_API_AUTHCONFIG = '/api/getAuthConfig';

  const GLOBEX_MOBILE_GATEWAY = get('GLOBEX_MOBILE_GATEWAY').asString();

  const NODE_ENV = get('NODE_ENV').default('dev').asEnum(['dev', 'prod']);
  const LOG_LEVEL = get('LOG_LEVEL').asString();


  // HTTP and WebSocket traffic both use this port
  const  PORT = get('PORT').default(4200).asPortNumber();

  // external micro services typically running on OpenShift
  const API_MANAGEMENT_FLAG = get('API_MANAGEMENT_FLAG').default("NO").asString();
  const API_CUSTOMER_SERVICE = get('API_CUSTOMER_SERVICE').default('').asString();
  const ANGULR_API_GETCATEGORIES = '/api/getCategories';
  const ANGULR_API_GETPRODUCTSBYCATEGORY = '/api/prodByCategoryUrl';

  //setup keycloak auth settings
  const API_CLIENT_ID = get('API_CLIENT_ID').default('').asString();
  const SSO_AUTHORITY = get('SSO_AUTHORITY').default('').asString();
  const SSO_REDIRECT_LOGOUT_URI = get('SSO_REDIRECT_LOGOUT_URI').default('').asString();
  const SSO_LOG_LEVEL = get('SSO_LOG_LEVEL').default(LogLevel.Error).asString();
  
  
  
  //3SCALE INTEGRATION FOR AUTH KEY BASED AUTHENTICATION
  const API_USER_KEY_NAME = get('USER_KEY').default('api_key').asString();
  const API_USER_KEY_VALUE = get('API_USER_KEY_VALUE').default('8efad5cc78ecbbb7dbb8d06b04596aeb').asString();

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

  if(API_MANAGEMENT_FLAG && API_MANAGEMENT_FLAG =='YES') {
    axios.defaults.headers.common[API_USER_KEY_NAME] = API_USER_KEY_VALUE // for all requests
  }

  server.use(bodyParser.json());
  server.use(cookieParser())
  server.use(bodyParser.urlencoded({extended: true}) );

  // Session handling
  const sessions = new Map<string, Session>();
  const accessTokenSessions = new Map<string, Session>();


  //API Setup START
  //Get Paginated Products
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

 

  // POST LOGIN API Call
  server.post(ANGULR_API_LOGIN, (req, res) => {
    
        const sessionToken = uuidv4();
        const now = new Date()
        const sessionExpiresAt = new Date(+now + 3600 * 1000)
        const userExpiresAt = new Date(+now + 3600 * 48 * 1000)
        sessions.set(sessionToken, new Session(req.body.username, sessionExpiresAt));
        res.cookie("globex_session_token", sessionToken, { expires: sessionExpiresAt, sameSite: 'lax' });
        res.cookie("globex_user_id", req.body.username, {expires: userExpiresAt, sameSite: 'lax'});
        accessTokenSessions.set(sessionToken, req.body.accessToken);
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

  // GET CUSTOMER INFO API CALL
  server.get(ANGULR_API_CUSTOMER + '/:custId', (req, res) => {
    const sessionToken = req.cookies['globex_session_token']
    const custId = req.params.custId;
    
    if (!validateSession(sessions, sessionToken, custId)) {
      res.status(401).send();
      return;
    }
    axios.get(API_CUSTOMER_SERVICE.replace(':custId', custId))
      .then(response => res.status(200).send(response.data))
      .catch(error => {
        if (error.response && error.response.status == 404) {
          res.status(error.response.status).send()
        } else {
          console.log("ANGULR_API_CUSTOMER", error);
          res.status(500).send();
        }
      });

  });

  // GET CATEGORIES LIST
  server.get(ANGULR_API_GETCATEGORIES + '/:custId', (req, res) => {
    const sessionToken = req.cookies['globex_session_token']
    const configHeader = {
      headers: { Authorization: `Bearer ${accessTokenSessions.get(sessionToken)}` }
    };
    const custId = req.params.custId;
    if (!validateSession(sessions, sessionToken, custId)) {
      res.status(401).send();
      return;
    }
    var url = GLOBEX_MOBILE_GATEWAY + "/mobile/services/category/list";
    axios.get(url, configHeader)
      .then(response => {
        res.status(200).send(response.data)
      })
      .catch(error => {
        console.log("ANGULR_API_GETCATEGORIES", error);
        res.status(500).send();
      })
  });

  // GET PRODUCTS FOR CATEGORY
  server.get(ANGULR_API_GETPRODUCTSBYCATEGORY + '/:categoryName/:custId', (req, res) => {
    const sessionToken = req.cookies['globex_session_token']
    const configHeader = {
      headers: { Authorization: `Bearer ${accessTokenSessions.get(sessionToken)}` }
    };
    let custId = req.params.custId;
    let categoryName = req.params.categoryName;

    if (!validateSession(sessions, sessionToken, custId)) {
      res.status(401).send();
      return;
    }
    var url = GLOBEX_MOBILE_GATEWAY + "/mobile/services/product/category/" + categoryName;
    axios.get(url, configHeader)
      .then(response => {
        res.status(200).send(response.data)
      })
      .catch(error => {
        console.log("ANGULR_API_GETCATEGORIES", error);
        res.status(500).send();
      })
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
  private expiresAt: Date;

  constructor(username, expiresAt) {
    this.username = username
    this.expiresAt = expiresAt
}

  isExpired(): boolean {
    return this.expiresAt < (new Date())
  }

  isOwnedBy(user: String) {
    return this.username == user;
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





