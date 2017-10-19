import { BaseModel } from './BaseModel'

export default class Event extends BaseModel {
    get _collection_path(){
        return 'events'
    }
}
