import { BaseModel } from './BaseModel'

export default class Event extends BaseModel {
    get _collection_path(){
        return 'events'
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
