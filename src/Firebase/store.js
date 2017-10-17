import session from 'express-session'
import * as admin from 'firebase-admin';
import FirebaseStoreCreator from 'connect-session-firebase';
const FirebaseStore = FirebaseStoreCreator(session)
const ref = admin.initializeApp({
    credential: admin.credential.cert(require('./service-account.json')),
    databaseURL: "https://whos-down-5ed2d.firebaseio.com"
});
export function setUpSessionStore (app, {SESSION_STORE_SECRET} = {}) {
    const store = new FirebaseStore({
        database: ref.database()
    })

    app.use(session({
        secret: SESSION_STORE_SECRET,
        store,
        resave: true,
        saveUninitialized: true
    }))
    return store
}