import { BaseModel } from './BaseModel'

export default class User extends BaseModel {

    get _collection_path() {
        return 'users'
    }

    is_friends_with(user, other_user){
        let user1 = user
        if (user instanceof this.DataInstance){
            user1 = user._data;
        }
        return typeof user.friends[other_user.id] === 'boolean'
    }

    is_user(user, other_user){
        return user.id === other_user.id
    }

    async getUserFriendsById(id){
        return this.findById(id).then((user) => {
            return user.friends
        })
    }

    async ProccessFBFriendsForUser(id, friends = []){
        return this.findById(id).then((user) => {
            const promises = [];
            friends.forEach((friend) => {
                !user.json().friends && user.update({friends: {}})
                if (typeof user.json().friends[friend.id] === 'boolean'){
                    return
                }
                promises.push(this.findOne({'facebook.id': friend.id}).then((friend_instance) => {
                    if (friend_instance){
                        return user.update({
                            friends: {
                                [friend_instance.id]: true
                            }
                        })
                    }
                }))
            })
            return Promise.all(promises)
        })
    }

    get DataInstance(){
        const Parent = this;
        class DataInstance extends super.DataInstance {
            _is_user(value, otherwise = undefined){
                if (this.id === Parent._current_user_id){
                    return value
                }
                return otherwise
            }
            _is_friends_with(value, otherwise = undefined){
                if (typeof this._data.friends[Parent._current_user_id] === 'boolean'){
                    return value
                }
                return this._is_user(value, otherwise)
            }
            get name(){
                return this._is_friends_with(
                    this._data.name || `${this._data.first_name || ''} ${this._data.last_name || ''}`,
                    null
                )
            }
            get first_name() {
                return this._data.first_name
            }
            get last_name() {
                return this._is_friends_with(this._data.last_name, null)
            }
            get display_name() {
                return this._is_friends_with(this.name, this.first_name)
            }
            get email() {
                return this._is_friends_with(this._data.email, null)
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
