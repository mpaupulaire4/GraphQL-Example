/// @flow

import { Model, Node } from './'
import { aql } from 'arangojs'
import DataLoader from 'dataloader'
/*::
  export type MessageType = {
    id: string,
    text: string,
    owner: string,
    timestamp: string,
    convo_id: string,
  };
*/

export default class Message extends Model/* :: <MessageType>  */{
  getCollectionName() {
    return 'messages'
  }

  find(
    examp/* :: ?: $Subtype<MessageType> */,
  )/* : Promise<MessageType[]> */ {
    if (examp && examp.convo_id) {
      return this._db.query(aql`
        FOR doc IN ${this._collection}
          FILTER doc.convo_id == ${examp.convo_id}
          FILTER MATCHES(doc, ${examp})
          SORT doc.timestamp DESC
          return doc
      `).then(({_result}) => {
        return _result.map((m) => new Node(m))
      });
    }
    return super.find(examp);
  }
}

