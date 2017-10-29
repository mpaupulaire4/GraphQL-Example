import mongoose from 'mongoose'
import { LocationSchema } from './Location'
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
        default: 'PRIVATE'
    },
})

//region STATICS

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
