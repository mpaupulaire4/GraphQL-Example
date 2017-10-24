import { BaseModel } from '../BaseModel'
import {firestore} from 'firebase-admin'


export default class Messages extends BaseModel {
    get _collection_path(){
        return 'messages'
    }

    async byConvoID(id){
        const query = this._collection.where("conversation_id", "==", id).orderBy("timestamp", 'asc')
        return query.get().then((snap) => {
            return snap.docs.map((doc) => {
                return this._doc_to_instance(doc)
            })
        })
    }

    async post(message){
        const new_message = new this.DataInstance({
            ...message,
            owner: this._current_user_id,
            timestamp: firestore.FieldValue.serverTimestamp(),
        })
        await new_message.save()
        await new_message._doc.get().then((snap) => {
            new_message._data = snap.data()
        })
        return new_message
    }

    get DataInstance() {
        const Parent = this;
        class DataInstance extends super.DataInstance{
            get conversation_id(){
                return this._data.conversation_id
            }
            get text(){
                return this._data.text
            }
            get owner(){
                return this._data.owner
            }
            get timestamp(){
                return this._data.timestamp
            }
        }
        return DataInstance;
    }
}