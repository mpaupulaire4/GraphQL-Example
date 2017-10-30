import { FirebaseRef } from '../'
import DataLoader from 'dataloader'
import { merge } from 'lodash'

export const database = FirebaseRef.firestore()

export class BaseModel {
    constructor(current_user){
        this.loaderById = new DataLoader(this._findByIds)
        if (current_user && current_user.id){
            this._current_user_id = current_user.id
        }
    }

    _prime(instance = {}){
        if (instance instanceof this.DataInstance){
            this.loaderById.prime(instance.id, instance)
        }
    }

    _findByIds = async (ids = []) => {
        return Promise.all(ids.map((id) => this._findById(id)))
    }

    _findById = async (id) => {
        return this._collection.doc(id).get().then((doc) => doc.exists ? this._doc_to_instance(doc) : null)
    }
    async findByIds(ids = []) {
        return this.loaderById.loadMany(ids)
    }
    async findById(id){
        return this.loaderById.load(id)
    }

    async find({id, offset, limit,  ...data} = {}){
        if (id){
            return Promise.all([ this.findById(id) ])
        }

        let query = this._collection
        Object.keys(data).forEach((key) => {
            query = query.where(key,'==', data[key])
        })

        return query.get().then((snap) => {
            return snap.docs.map((doc) => {
                return this._doc_to_instance(doc)
            })
        })
    }
    async findOne({id, ...data} = {}){
        if (id){
            return this.findById(id)
        }

        let query = this._collection
        Object.keys(data).forEach((key) => {
            query = query.where(key,'==', data[key])
        })

        return query.get().then((snap) => {
            const doc = snap.docs[0]
            if (!doc || !doc.exists){
                return null
            }
            return this._doc_to_instance(doc)
        })
    }

    _doc_to_instance(doc){
        const instance = new this.DataInstance(doc.data())
        instance._doc = doc.ref;
        this._prime(instance)
        return instance
    }

    get _collection() {
       return  database.collection(this._collection_path)
    }

    get _collection_path(){
        throw new Error('No Collection Path Specified')
    }

    get DataInstance() {
        const Parent = this;
        class DataInstance {
            constructor(data={}){
                if (data instanceof DataInstance){
                    this._data = data._data;
                    this._doc = data._doc;
                    return
                } else if (data instanceof Object){
                    this._data = data;
                    this._doc = null
                    return
                }
                throw new Error('Invalid Data object for Model Instance')
            }

            get id() {
                return this._doc && this._doc.id
            }

            async save(id = undefined) {
                if (!this._doc){
                    this._doc = await Parent._collection.doc(id);
                    return this._doc.set(this._data)
                }
                return this._doc.update(this._data)
            }

            async set(data={}) {
                this._data = data
                if (this._doc){
                    return this._doc.set(data)
                }
            }

            async update(data){
                this._data = merge({}, this._data, data)
                if (this._doc){
                    return this.save()
                }
            }

            json(){
                return {...this._data, id: this.id}
            }
        }
        return DataInstance;
    }
}
