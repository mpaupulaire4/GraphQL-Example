// @flow
import { Database } from 'arangojs';
import DataLoader from 'dataloader';

/* ::
import type { iModel, iNode } from '../models';

type ArangoNode = {
  _id: string
} | iNode
*/

export function initDB({
  ARANGODB_URI,
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
}/* : ENV */ = {}) /* :Database */ {
  return new Database({
    url: ARANGODB_URI,
  })
  .useBasicAuth(DATABASE_USER, DATABASE_PASSWORD)
  .useDatabase(DATABASE_NAME);
}

export class Node /* :: implements iNode*/{
  /* :: id: $PropertyType<iNode, 'id'>;  */
  /* :: _id: $PropertyType<ArangoNode, 'id'>;  */
  constructor(
    model/* : ArangoNode */,
  ) {
    Object.assign(this, model);
    if (typeof model._id === 'string' ) {
      this.id = model._id;
    } else if (typeof model.id === 'string') {
      this.id = model.id
    }
    this._id = this.id;
  }
}

export class Model/* :: <T: iNode> implements iModel<T> */{
  /* :: loader: DataLoader<string, ?T>; */
  /* :: _collection: $Call<Database.collection, string> */
  /* :: _db: Database */

  constructor(
    loader /* :: ?: DataLoader<string, ?T> */,
    sharedDB /* :: ?:Database */,
  ) {
    this._db = sharedDB || initDB(process.env);
    this._collection = this._db.collection(this.getCollectionName());
    this.loader = loader || new DataLoader(this._findByIds.bind(this));
  }

  _findByIds(
    ids/* : $ReadOnlyArray<string> */,
  ) /* : Promise < Array <?T> > */{
    return this._collection.lookupByKeys(ids).then(dats => {
      return dats.map(data => new Node(data))
    })
  }

  async _prime(
    data/* : $Supertype<T> */
  )/* : Promise < void > */ {
    this.loader.clear(data.id);
    this.loader.prime(data.id, data);
  }

  async _primeAll(
    datas/* : Array< ?$Supertype<T> > */
  )/* : Promise<void> */ {
    datas.forEach((data) => {
      if (data) {
        this._prime(data);
      }
    })
  }

  getCollectionName() {
    return '';
  }

  findById(
    id/* : string */,
  )/* : Promise<?T> */ {
    return this.loader.load(id);
  }

  findByIds(
    ids/* : Array<string> */,
  )/* : Promise< Array<?T> > */ {
    return this.loader.loadMany(ids);
  }

  find(
    examp/* : $Subtype<T> */,
  )/* : Promise<T[]> */ {
    if (examp.id) {
      return this.loader.load(examp.id).then((user) => {
        if (user) {
          return [user];
        }
        return []
      });
    }
    return this._collection.byExample(examp).then(cursor => {
      return cursor.all();
    }).then((data => {
      data = data.map(data => new Node(data));
      this._primeAll(data);
      return data;
    }));
  }

  create(
    examp/* : $Subtype<T> */,
  )/* : Promise<T> */ {
    return this._collection.save(examp, {
      returnNew: true,
    }).then(doc => {
      const node = new Node(doc.new)
      this._prime(node);
      return node;
    });
  }

  update(
    examp/* : { id: string } & $Subtype<T> */,
  )/* : Promise<T> */ {
    return this._collection.update(examp.id, examp, {
      returnNew: true,
    }).then((doc) => {
      const node = new Node(doc.new)
      this._prime(node);
      return node;
    });
  }
}
