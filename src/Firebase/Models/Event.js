import { BaseModel } from './BaseModel'
import * as firebase from 'firebase-admin'

export default class Event extends BaseModel {
    get _collection_path(){
        return 'events'
    }

    async create({...event} = {}){
        event.host = this._current_user_id
        event.participants = {}
        event.location = {...event.location}
        const Event = this.DataInstance
        const new_event = new Event(event)
        await new_event.save()
        return new_event
    }

    async join(id){
        const event = await this.findById(id).then((event) => {
            if (!event){
                throw new Error('No Such Event')
            }
            return event
        })
        await event.update({
            participants: {
                [this._current_user_id]: firebase.firestore.FieldValue.serverTimestamp()
            }
        })
        return event
    }

    async leave(id, user_id = this._current_user_id) {
        const event = await this.findById(id).then((event) => {
            if (!event){
                throw new Error('No Such Event')
            }
            return event
        })
        if (!event.participants[user_id]){
            throw new Error(`This user (${user_id}) is not a part of this event (${event.id})`)
        }
        await event.update({
            participants: {
                [user_id]: firebase.firestore.FieldValue.delete()
            }
        })
        delete event._data.participants[user_id]
        return event;
    }

    async update({id, ...event}){
        if (event.location){
            event.location = {...event.location}
        }
        return this.findById(id).then((event) => {
            if (!event){
                throw new Error("No Such Event")
            }
            return event.update(event).then(() => {
                return event
            })
        })
    }

    async kick(event_id, user_id){
        return this.findById(event_id).then((event) => {
            if (!event){
                throw new Error('No Such Event')
            }
            if (this._current_user_id === event.host){
                return this.leave(event_id, user_id)
            }
            return event
        })
    }

    get DataInstance() {
        const Parent = this;
        class DataInstance extends super.DataInstance {
            get host() {
                return this._data.host;
            }
            get title() {
                return this._data.title;
            }
            get description() {
                return this._data.description;
            }
            get location() {
                return this._data.location;
            }
            get time() {
                return this._data.time;
            }
            get participants() {
                return this._data.participants;
            }
            get visibility() {
                return this._data.visibility;
            }
        }
        return DataInstance;
    }
}
