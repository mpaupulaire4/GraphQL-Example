import { BaseModel } from './BaseModel'
import * as firebase from 'firebase-admin'

export default class Convo extends BaseModel {
    get _collection_path(){
        return 'conversations'
    }

    async create({id, ...convo}){
        convo.participants = {
            [this._current_user_id]: firebase.firestore.FieldValue.serverTimestamp()
        }
        const new_convo = new this.DataInstance(convo)
        await new_convo.save(id)
        return new_convo
    }

    async join(id) {
        return this.findById(id).then((convo) => {
            if (!convo){
                throw new Error('No Such Conversation')
            }
            return convo.update({
                participants: {
                    [this._current_user_id]: firebase.firestore.FieldValue.serverTimestamp()
                }
            }).then(() => {
                return convo
            })
        })
    }

    async leave(id, user_id = this._current_user_id) {
        return this.findById(id).then((convo) => {
            if (!convo){
                throw new Error('No Such Conversation')
            }
            if (!convo.participants[user_id]){
                throw new Error(`This user (${user_id}) is not apart of this conversation (${convo.id})`)
            }
            return convo.update({
                participants: {
                    [this._current_user_id]: firebase.firestore.FieldValue.delete()
                }
            }).then(() => {
                delete convo._data.participants[this._current_user_id]
                return convo
            })
        })
    }

    get DataInstance() {
        const Parent = this;
        class DataInstance extends super.DataInstance{

        }
        return DataInstance;
    }
}
