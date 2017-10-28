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



//endregion

//region VIRTUALS



//endregion

//region METHODS



//endregion

export default mongoose.model('Event', EventSchema);
