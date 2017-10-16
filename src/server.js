import path from 'path';
import express from 'express';
import cookie from 'cookie';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { Engine } from 'apollo-engine';
import compression from 'compression';
import bodyParser from 'body-parser';
import { invert, isString } from 'lodash';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';

import { initAuth } from './Auth'
// import { GitHubConnector } from './github/connector';
// import { Repositories, Users } from './github/models';
// import { Entries, Comments } from './sql/models';
import schema from './schema';
// import queryMap from '../extracted_queries.json';
// import engineConfig from './engineConfig';

// const WS_GQL_PATH = '/subscriptions';

// Arguments usually come from env vars
export function run({ SESSION_STORE_SECRET, ENGINE_API_KEY, PORT: portFromEnv = 3100,} = {}) {

  let port = portFromEnv;
  if (isString(portFromEnv)) {
    port = parseInt(portFromEnv, 10);
  }

  // const wsGqlURL = process.env.NODE_ENV !== 'production'
  //   ? `ws://localhost:${port}${WS_GQL_PATH}`
  //   : `ws://PROD_URL${WS_GQL_PATH}`;

  const app = express();

  if (ENGINE_API_KEY) {
    const fullEngineConfig = Object.assign({}, {
      apiKey: ENGINE_API_KEY,
      logcfg: {
        level: 'DEBUG',
      },
    });
    const engine = new Engine({
      engineConfig: fullEngineConfig,
      endpoint: '/graphql',
      graphqlPort: port,
    });
    engine.start();
    app.use(engine.expressMiddleware());
  }
  app.use(compression());

  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  const sessionStore = initAuth(app);
  app.use(cookieParser(SESSION_STORE_SECRET));

  app.use('/graphql', graphqlExpress((req) => {

    // Get the query, the same way express-graphql does it
    // https://github.com/graphql/express-graphql/blob/3fa6e68582d6d933d37fa9e841da5d2aa39261cd/src/index.js#L257
    // const query = req.query.query || req.body.query;
    // if (query && query.length > 2000) {
    //   // None of our app's queries are this long
    //   // Probably indicates someone trying to send an overly expensive query
    //   throw new Error('Query too large.');
    // }

    if (!req.user) {
      req.logout()
    }

    // Initialize a new GitHub connector instance for every GraphQL request, so that API fetches
    // are deduplicated per-request only.
    // const gitHubConnector = new GitHubConnector({
    //   clientId: GITHUB_CLIENT_ID,
    //   clientSecret: GITHUB_CLIENT_SECRET,
    // });

    return {
      schema,
      tracing: true,
      context: {
      // User should be set to null or properly deserialized
      user: req.user,
        // Repositories: new Repositories({ connector: gitHubConnector }),
        // Users: new Users({ connector: gitHubConnector }),
        // Entries: new Entries(),
        // Comments: new Comments(),
        // opticsContext,
      },
    };
  }));

  app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
    // subscriptionsEndpoint: wsGqlURL,
    // query: `{
    //   feed (type: NEW, limit: 5) {
    //     repository {
    //       owner { login }
    //       name
    //     }
    //     postedBy { login }
    //   }
    // }
    // `,
  }));

  // Serve our helpful static landing page. Not used in production.
  // app.get('/', (req, res) => {
  //   res.sendFile(path.join(__dirname, 'index.html'));
  // });

  const server = createServer(app);

  server.listen(port, () => {
    console.log(`API Server is now running on http://localhost:${port}`); // eslint-disable-line no-console
    // console.log(`API Server over web socket with subscriptions is now running on ws://localhost:${port}${WS_GQL_PATH}`); // eslint-disable-line no-console
    // eslint-disable-next-line
    // new SubscriptionServer(
    //   {
    //     schema,
    //     execute,
    //     subscribe,
    //     // the onOperation function is called for every new operation
    //     // and we use it to set the GraphQL context for this operation
    //     onOperation: (msg, params, socket) => {
    //       return new Promise((resolve) => {
    //         // if (!config.persistedQueries) {
    //           // Get the query, the same way express-graphql does it
    //           // https://github.com/graphql/express-graphql/blob/3fa6e68582d6d933d37fa9e841da5d2aa39261cd/src/index.js#L257
    //           // const query = params.query;
    //           // if (query && query.length > 2000) {
    //           //   // None of our app's queries are this long
    //           //   // Probably indicates someone trying to send an overly expensive query
    //           //   throw new Error('Query too large.');
    //           // }
    //         // }

    //         // const gitHubConnector = new GitHubConnector({
    //         //   clientId: GITHUB_CLIENT_ID,
    //         //   clientSecret: GITHUB_CLIENT_SECRET,
    //         // });

    //         // // Support for persistedQueries
    //         // if (config.persistedQueries) {
    //         //   // eslint-disable-next-line no-param-reassign
    //         //   params.query = invertedMap[msg.payload.id];
    //         // }

    //         let wsSessionUser = null;
    //         // console.log(socket.upgradeReq)
    //         if (socket.upgradeReq) {
    //           // const cookies = cookie.parse(socket.upgradeReq.headers.cookie);
    //           // const sessionID = cookieParser.signedCookie(cookies['connect.sid'], config.sessionStoreSecret);
    //           const cookies = null;
    //           const sessionID = null;

    //           const baseContext = {
    //             context: {
    //               // Repositories: new Repositories({ connector: gitHubConnector }),
    //               // Users: new Users({ connector: gitHubConnector }),
    //               // Entries: new Entries(),
    //               // Comments: new Comments(),
    //               // opticsContext,
    //             },
    //           };

    //           const paramsWithFulfilledBaseContext = Object.assign({}, params, baseContext);

    //           if (!sessionID) {
    //             resolve(paramsWithFulfilledBaseContext);
    //             return;
    //           }

    //           // get the session object
    //           // sessionStore.get(sessionID, (err, session) => {
    //           //   if (err) {
    //           //     throw new Error('Failed retrieving sessionID from the sessionStore.');
    //           //   }

    //           //   if (session && session.passport && session.passport.user) {
    //           //     const sessionUser = session.passport.user;
    //           //     wsSessionUser = {
    //           //       login: sessionUser.username,
    //           //       html_url: sessionUser.profileUrl,
    //           //       avatar_url: sessionUser.photos[0].value,
    //           //     };

    //           //     resolve(Object.assign(paramsWithFulfilledBaseContext, {
    //           //       context: Object.assign(paramsWithFulfilledBaseContext.context, {
    //           //         user: wsSessionUser,
    //           //       }),
    //           //     }));
    //           //   }

    //           //   resolve(paramsWithFulfilledBaseContext);
    //           // });
    //         }
    //       });
    //     },
    //   },
    //   {
    //     path: WS_GQL_PATH,
    //     server,
    //   },
    // );
  });

  return server;
}