import session from 'express-session'
import StoreCreator from 'connect-arango'
const Store = StoreCreator(session)

export function setUpSessionStore(
    app,
    {
        SESSION_STORE_SECRET,
        ARANGODB_URI,
        DATABASE_NAME,
        DATABASE_USER,
        DATABASE_PASSWORD,
    } = {}
) {
    const store = new Store({
        uri: ARANGODB_URI,
        db: DATABASE_NAME,
        username: DATABASE_USER,
        password: DATABASE_PASSWORD,
        collection: 'user_sessions',
        clear_interal: 1000 * 60 * 60,
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