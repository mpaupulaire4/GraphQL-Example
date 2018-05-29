import path from 'path';
import express from 'express';
import cookie from 'cookie';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
// import { Engine } from 'apollo-engine';
import compression from 'compression';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';

import { initAuth } from './Auth'
import { User, Event, Convo, Message, Node } from './Data/models'
import schema, { FullSchemaDeff } from './schema';

const WS_GQL_PATH = '/subscriptions';

// Arguments usually come from env vars
export function run({ SESSION_STORE_SECRET, ENGINE_API_KEY, PORT: portFromEnv = 3100,} = {}) {

  let port = portFromEnv;
  if (typeof portFromEnv === 'string') {
    port = parseInt(portFromEnv, 10);
  }

  const wsGqlURL = process.env.NODE_ENV !== 'production'
    ? `ws://localhost:${port}${WS_GQL_PATH}`
    : `ws://PROD_URL${WS_GQL_PATH}`;

  const app = express();

  // if (ENGINE_API_KEY) {
  //   const fullEngineConfig = {
  //     apiKey: ENGINE_API_KEY,
  //     logcfg: {
  //       level: 'DEBUG',
  //     },
  //   };
  //   const engine = new Engine({
  //     engineConfig: fullEngineConfig,
  //     endpoint: '/graphql',
  //     graphqlPort: port,
  //   });
  //   // engine.start();
  //   // app.use(engine.expressMiddleware());
  // }
  app.use(compression());

  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  const sessionStore = initAuth(app);
  app.use(cookieParser(SESSION_STORE_SECRET));

  app.get('/schema', (req, res) => {
    res.send(FullSchemaDeff)
  })

  app.use('/graphql', graphqlExpress((req) => {
    // Prime the data Loader in the user model with the current signed in user
    // UserModel._prime(req.user)
    const UserModel = new User();
    UserModel._prime(req.user);
    const EventModel = new Event();
    const ConvoModel = new Convo();
    const MessageModel = new Message();

    return {
      schema,
      // tracing: true,
      context: {
        // User should be set to null or properly deserialized
        current_user: req.user,
        Node: new Node([
          UserModel,
          EventModel,
          ConvoModel,
          MessageModel,
        ]),
        User: UserModel,
        Event: EventModel,
        Convo: ConvoModel,
        Message: MessageModel,
      },
    };
  }));

  app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
    subscriptionsEndpoint:wsGqlURL
  }));

  // Serve our helpful static landing page. Not used in production.
  // app.get('/', (req, res) => {
  //   res.sendFile(path.join(__dirname, 'index.html'));
  // });

  const server = createServer(app);

  server.listen(port, () => {
    console.log(`API Server is now running on http://localhost:${port}`); // eslint-disable-line no-console
    console.log(`API Server over web socket with subscriptions is now running on ws://localhost:${port}${WS_GQL_PATH}`); // eslint-disable-line no-console
  });


  // eslint-disable-next-line
  new SubscriptionServer(
    {
      schema,
      execute,
      subscribe,
      // the onOperation function is called for every new operation
      // and we use it to set the GraphQL context for this operation
      //region

      onOperation: (msg, params, socket) => {
        return new Promise((resolve) => {
          // Get the query, the same way express-graphql does it
          // https://github.com/graphql/express-graphql/blob/3fa6e68582d6d933d37fa9e841da5d2aa39261cd/src/index.js#L257
          // const query = params.query;
          // if (query && query.length > 2000) {
          //   // None of our app's queries are this long
          //   // Probably indicates someone trying to send an overly expensive query
          //   throw new Error('Query too large.');
          // }

          if (socket.upgradeReq) {
            const cookies = cookie.parse(socket.upgradeReq.headers.cookie);
            const sessionID = cookieParser.signedCookie(cookies['connect.sid'], SESSION_STORE_SECRET);
            const defaultContext = {
              ...params,
              context: {
                current_user: null,
                User: new User(),
                Event: new Event(),
                Convo: new Convo(),
                Message: new Message(),
              }
            }
            if (!sessionID) {
              resolve(defaultContext);
              return;
            }

            // get the session object
            sessionStore.get(sessionID, (err, session) => {
              if (err) {
                throw new Error('Failed retrieving sessionID from the sessionStore.');
              }

              if (session && session.passport && session.passport.user) {
                const wsSessionUser = session.passport.user;
                // Set the id of the current signed in user in the user model for security use
                const UserModel = new User();
                // Prime the data Loader in the user model with the current signed in user
                UserModel._prime(wsSessionUser);
                resolve({
                  ...params,
                  context: {
                    current_user: wsSessionUser,
                    User: UserModel,
                    Event: new Event(),
                    Convo: new Convo(),
                    Message: new Message(),
                  },
                });
              }

              resolve(defaultContext);
            });
          }
        });
      },

      //endregion
    },
    {
      path: WS_GQL_PATH,
      server,
    },
  );

  return server;
}