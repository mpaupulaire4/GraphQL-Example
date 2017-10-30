import session from 'express-session'
import FirebaseStoreCreator from 'connect-session-firebase';
import { FirebaseRef } from './index'
const FirebaseStore = FirebaseStoreCreator(session)

export function setUpSessionStore (app, {SESSION_STORE_SECRET} = {}) {
    const store = new FirebaseStore({
        database: FirebaseRef.database()
    })

    app.use(session({
        secret: SESSION_STORE_SECRET,
        store,
        resave: true,
        saveUninitialized: true
    }))
    return store
}