import mongoose from 'mongoose'
const Schema = mongoose.Schema

const ParticipantSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    last_viewed: {
        type: Date,
        required: true,
        default: () => new Date()
    }
}, {
    id: false,
    _id: false
})

export const ConversationSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    messages: [{
        text: {
            type: String,
            required: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        timestamp: {
            type: Date,
            required: true,
            default: () => new Date()
        }
    }],
    participants: [ParticipantSchema]
})


//region STATICS

ConversationSchema.statics.post_message = function(convo_id, message) {
    return this.findById(convo_id).then((convo) => {
        convo.messages.push(message)
        return convo.save().then(new_conv=>{
            return new_conv.messages[new_conv.messages.length - 1]
        })
    })
}

//endregion

//region VIRTUALS



//endregion

//region METHODS



//endregion

export default mongoose.model('Conversation', ConversationSchema);