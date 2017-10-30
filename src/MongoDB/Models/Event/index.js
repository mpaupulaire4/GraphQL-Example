import mongoose from 'mongoose'
import { LocationSchema } from './Location'
import { isArray } from 'lodash'
const Schema = mongoose.Schema

export const EventSchema = new Schema({
    host: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: String,
    description: String,
    time: Date,
    location: {
        type: LocationSchema,
        required: true
    },
    participants:[{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    visibility: {
        type: String,
        enum: [
            'PUBLIC',
            'PRIVATE',
            'NONE'
        ],
        default: 'NONE',
        uppercase: true
    },
})

//region STATICS

EventSchema.query.byLocation = function({latitude, longitude}, distance){
    return this.find({
        location: {
            $nearSphere: {
                $geometry: {
                    type : "Point",
                    coordinates : [ longitude, latitude ]
                },
                $maxDistance: distance
            }
        }
    })
}

EventSchema.statics.visibilityFilter = function(user){
    return {
        $or: [
            {visibility: 'PUBLIC'},
            {host: user.id},
            {participants: user.id},
            {
                visibility: 'PRIVATE',
                $or: [
                    {host: {$in: user.friends}},
                    {participants: {$in: user.friends}}
                ]
            }
        ]
    }
}

EventSchema.statics.findWithFilter = function({limit, offset, ...query = {}}, user) {
    return this.find(this.visibilityFilter(user)).find(query);
}

EventSchema.statics.join = function(event_id, user_id) {
    return this.findByIdAndUpdate(event_id,{
        $addToSet: {
            participants: user_id
        }
    },{
        new: true
    })
}

EventSchema.statics.leave = function(event_id, user_id) {
    return this.findByIdAndUpdate(event_id,{
        $pull: {
            participants: user_id
        }
    },{
        new: true
    })
}

//endregion

//region VIRTUALS



//endregion

//region METHODS

EventSchema.methods.is_host = function(user) {

}

EventSchema.methods.is_participant = function(user) {

}

//endregion

export default mongoose.model('Event', EventSchema);
