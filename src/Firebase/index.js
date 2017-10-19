import * as admin from 'firebase-admin';

export const FirebaseRef = admin.initializeApp({
    credential: admin.credential.cert(require('./service-account.json')),
    databaseURL: "https://whos-down-5ed2d.firebaseio.com"
});
