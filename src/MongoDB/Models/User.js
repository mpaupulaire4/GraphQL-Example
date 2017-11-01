import mongoose from 'mongoose'
const Schema = mongoose.Schema

export const UserSchema = new Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: String,
    email: String,
    photo_url: String,
    friends: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    facebook: {
        type: {
            id: {
                type: String,
                required: true,
                index: true,
                unique: true
            },
            link: String
        },
        required: true
    }
})

//region STATICS

UserSchema.statics.ProcessUserFriendsById = function(id, friends = []) {
    return this.findById(id).then((user) => {
        user.ProcessFBFriends(friends)
    })
}
UserSchema.statics.findByIds = function(ids = []) {
    return Promise.all(ids.map((id) => this.findById(id)))
}

//endregion

//region VIRTUALS

UserSchema.virtual('name').get(function(){
    return `${this.first_name || ''} ${this.last_name}`
})

//endregion

//region METHODS

UserSchema.methods.ProcessFBFriends = function (friends = []) {
    const friendIDs = friends.map(({id}) => id)
    return this.model('User').find({
        'facebook.id': { $in: friendIDs }
    }).then((users) => {
        return users.map((user) => user.id)
    }).then((userIDs) => {
        return this.update({
            $addToSet: {
                friends:{
                    $each: userIDs
                }
            }
        })
    })
}

UserSchema.methods.is_friend = function (user, if_true = true, if_false = null) {
    return (this.friends.includes(user.id) || if_false) && if_true
}

UserSchema.methods.is_me = function (user, if_true = true, if_false = null) {
    return (this.id === user.id || if_false) && if_true
}

UserSchema.methods.can_view = function (user, if_true = true, if_false =  null) {
    if (this.is_me(user, true, false) || this.is_friend(user, true, false)){
        return if_true
    }
    return if_false
}

//endregion

export default mongoose.model('User', UserSchema);