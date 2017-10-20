import { FirebaseRef } from '../'
import DataLoader from 'dataloader'
import { merge } from 'lodash'

export const database = FirebaseRef.firestore()

export class BaseModel {
    constructor(){
        this.loaderById = new DataLoader(this._findByIds)
    }

    _prime(instance = {}){
        if (instance.id){
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

    async find({id, ...data} = {}){
        if (id){
            return this.findById(id)
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
                }
                this._data = data;
                this._doc = null
            }

            get id() {
                return this._doc && this._doc.id
            }

            _create(){
                if (!this._doc){
                    this._doc = Parent._collection.doc();
                    this._doc.set({})
                }
            }

            save() {
                this._create()
                return this._doc.update(this._data)
            }

            set(data) {
                this._data = data
                if (this._doc){
                    this._doc.set(data)
                }
            }

            update(data){
                this._data = merge(this._data, data)
                if (this._doc){
                    this.save()
                }
            }

            json(){
                return {...this._data, id: this.id}
            }
        }
        return DataInstance;
    }
}
