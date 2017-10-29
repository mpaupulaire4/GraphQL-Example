import mongoose from 'mongoose'
const Schema = mongoose.Schema

export const LocationSchema = new Schema({
    type: {
        $type: String,
        default: 'Point',
        enum: ['Point']
    },
    coordinates: {
        $type: [{
            $type: Number,
            min: -180,
            max: 180
        }],
        required: true,
        // validate: {
        //     validator: (value) => {

        //     }
        // }
    },
    address: String,
    city: String,
    state: String,
    zip: Number
}, {
    typeKey: '$type',
    _id: false,
    id: false
})

//region STATICS



//endregion

//region VIRTUALS

LocationSchema.virtual('longitude').get(function(){
    return this.coordinates[0]
})
LocationSchema.virtual('longitude').set(function(value){
    return this.coordinates[0] = value
})
LocationSchema.virtual('latitude').get(function(){
    return this.coordinates[1]
})
LocationSchema.virtual('latitude').set(function(value){
    return this.coordinates[1] = value
})
LocationSchema.virtual('city_state').get(function(){
    return `${this.city||''}, ${this.state||''}`
})

//endregion

//region METHODS

//endregion
