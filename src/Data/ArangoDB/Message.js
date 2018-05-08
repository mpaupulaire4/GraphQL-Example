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
    conversation_id: string,
  };
*/

export default class Message extends Model/* :: <MessageType>  */{
  getCollectionName() {
    return 'messages'
  }
}

