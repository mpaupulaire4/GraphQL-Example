import { BaseModel } from './BaseModel'

export default class Convo extends BaseModel {
    get _collection_path(){
        return 'conversations'
    }
}