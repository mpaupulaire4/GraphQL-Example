import * as admin from 'firebase-admin';
const cert = require('./service-account.json')

export const FirebaseRef = admin.initializeApp({
    credential: admin.credential.cert({
        ...cert,
    }),
    databaseURL: "https://whos-down-5ed2d.firebaseio.com"
});