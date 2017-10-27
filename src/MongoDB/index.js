import mongoose from 'mongoose'

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}

mongoose.connect(process.env.MONGODB_URI, {
    useMongoClient: true
});

mongoose.Promise = global.Promise;

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('connection open')
});
