import { BaseModel } from './BaseModel'

export default class User extends BaseModel {
    get _collection_path(){
        return 'users'
    }

    getUserFriendsById(id){

    }

    get DataInstance(){
        const Parent = this;
        class DataInstance extends super.DataInstance {
            get name(){
                return this._data.name
            }
            get first_name() {
                return this._data.first_name
            }
            get last_name() {
                return this._data.last_name
            }
            get display_name() {
                return `${this._data.first_name || ''} ${this._data.last_name || ''}`
            }
            get email() {
                return this._data.email
            }
            get facebook() {
                return this._data.facebook
            }
            get photo_url() {
                return this._data.photo_url
            }
        }
        return DataInstance
    }
}
