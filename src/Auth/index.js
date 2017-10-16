import { setUpSessionStore } from '../MongoDB'
import { setUpAuth } from './Facebook'

export function initAuth(app) {
    const store = setUpSessionStore(app, process.env)
    setUpAuth(app, process.env)
    return store;
}