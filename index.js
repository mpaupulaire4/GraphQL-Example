import { run } from './src/server';

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}

run(process.env);