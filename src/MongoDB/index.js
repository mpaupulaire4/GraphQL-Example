import mongoose from 'mongoose'

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}

mongoose.connect(process.env.MONGODB_URI, {
    config: {
        autoIndex: false
    },
    useMongoClient: true
});

mongoose.Promise = global.Promise;

const db = mongoose.connection
db.on('error', console.error.bind(console, 'MONGODB error:'));
db.once('open', () => {
    console.log('MONGODB: connection open')
});
