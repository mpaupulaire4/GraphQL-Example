import session from 'express-session'
import MongoDBStoreCreator from 'connect-mongodb-session'
const MongoDBStore = MongoDBStoreCreator(session)

export function setUpSessionStore(app, {SESSION_STORE_SECRET, MONGODB_URI} = {}) {
    const store = new MongoDBStore({
        uri: MONGODB_URI,
        collection: 'user_sessions'
    }, (error) => {
        // do something if it can't connect?
        if (error){
            console.log(error)
        }
    })

    app.use(session({
        secret: SESSION_STORE_SECRET,
        store,
        resave: true,
        saveUninitialized: true
    }))
    return store
}