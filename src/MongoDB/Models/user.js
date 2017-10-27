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
    facebook: {
        type: {
            id: {
                type: String,
                required: true,
                unique: true
            },
            link: String
        },
        required: true
    }
})

export default mongoose.model('User', UserSchema);