/// @flow

import { Model, Node } from './'
import { aql } from 'arangojs'
import DataLoader from 'dataloader'
/*::
  import type { iJoinable } from '../models';
  export type ConvoType = {
    id: string,
    title: string,
    participants: ParticipantsMap,
  };

  type ParticipantsMap = {
    [user_id: string]: ParticipantInfo,
  }

  type ParticipantInfo = {
    last_viewed: string,
  }
*/

export default class Convo extends Model/* :: <ConvoType> implements iJoinable<ConvoType>*/{
  getCollectionName() {
    return 'conversations'
  }

  async join(
    event_id /* : string */,
    user_id/* : string */,
  ) /* : Promise<ConvoType> */ {
    return this._db.query(aql`
      LET doc = DOCUMENT(${event_id})
      UPDATE doc WITH {
        participants: { ${user_id}: {
          last_viewed: DATE_ISO8601( DATE_NOW() )
        } }
      } IN ${this._collection} RETURN NEW
    `).then(({_result}) => new Node(_result[0]));
  }
  async leave(
    event_id /* : string */,
    user_id/* : string */,
  ) /* : Promise<ConvoType> */ {
    return this._db.query(aql`
      LET doc = DOCUMENT(${event_id})
      UPDATE doc WITH {
        participants: UNSET(
          doc.participants,
          ${user_id}
        )
      } IN ${this._collection} OPTIONS { mergeObjects: false } RETURN NEW
    `).then(({_result}) => new Node(_result[0]));
  }

  async kick(
    event_id /* : string */,
    user_id/* : string */,
    participant_id/* : string */,
  ) /* : Promise<ConvoType> */ {
    return this.leave(event_id, participant_id);
  }
}