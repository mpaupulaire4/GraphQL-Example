import { BaseModel } from './BaseModel'

export default class Event extends BaseModel {
    get _collection_path(){
        return 'events'
    }

    get DataInstance() {
        const Parent = this;
        class DataInstance {

        }
        return DataInstance;
    }
}
