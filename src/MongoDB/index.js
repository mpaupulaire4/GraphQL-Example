import session from 'express-session'
import MongoDBStoreCreator from 'connect-mongodb-session'
const MongoDBStore = MongoDBStoreCreator(session)

export function setUpSessionStore(app, {SESSION_STORE_SECRET, MONGODB_URL} = {}) {
    const store = null
    // const store = new MongoDBStore({
    //     uri: MONGODB_URL,
    //     collection: 'UserSessions'
    // }, (error) => {
    //     // do something if it can't connect?
    // })

    app.use(session({
        secret: SESSION_STORE_SECRET,
        store,
        resave: true,
        saveUninitialized: true
    }))
    return store
}