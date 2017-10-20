import { BaseModel } from './BaseModel'

export default class User extends BaseModel {
    get _collection_path() {
        return 'users'
    }

    constructor(current_user_id) {
        super()
        this.current_user_id = current_user_id;
    }

    async getUserFriendsById(id){
        this.findById(id).then((user) => {
            return user.friends
        })
    }

    async ProccessFBFriendsForUser(id, friends = []){
        return this.findById(id).then((user) => {
            const promises = [];
            friends.forEach((friend) => {
                !user.json().friends && user.update({friends: {}})
                if (user.json().friends[friend.id]){
                    return
                }
                promises.push(this.findOne({'facebook.id': friend.id}).then((friend_instance) => {
                    if (friend_instance){
                        user.update({
                            facebook: {
                                [friend_instance.id]: true
                            }
                        }).catch((error) => console.log(error))
                    }
                }))
            })
            return Promise.all(promises)
        })
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
            get friends() {
                return Parent.findByIds(Object.keys(this._data.friends || {}))
            }
        }
        return DataInstance
    }
}
