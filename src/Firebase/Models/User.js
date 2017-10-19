import { BaseModel } from './BaseModel'

export default class User extends BaseModel {
    get _collection_path(){
        return 'users'
    }
}
