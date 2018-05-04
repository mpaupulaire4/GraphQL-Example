/// @flow

import { Model, Node } from './'
import DataLoader from 'dataloader'
/*::
  export type ConvoType = {
    id: string,
    title: string,
    participants: ParticipantsMap,
  };

  type ParticipantsMap = {
    [user_id: string]: ParticipantInfo,
  }

  type ParticipantInfo = {
    timestamp: string,
  }
*/

export default class Convo extends Model/* :: <ConvoType> */{
  getCollectionName() {
    return 'conversations'
  }
}