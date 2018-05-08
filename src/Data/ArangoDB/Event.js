/// @flow

import { Model, Node } from './'
import { aql } from 'arangojs'
import DataLoader from 'dataloader'
/*::
  import type { iJoinable } from '../models';
  export type EventType = {
    id: string,
    host: string,
    title: string,
    description: string,
    time: string,
    location: Location,
    participants: ParticipantsMap,
    visibility: Visibility,
  };

  type Location = {
    address?: string,
    city?: string,
    state?: string,
    zip:? string,
    latitude: number,
    longitude: number,
  }

  type ParticipantsMap = {
    [user_id: string]: string,
  }

  type Visibility = 'PUBLIC' | 'PRIVATE' | 'NONE'
*/

export default class Event extends Model/* :: <EventType> implements iJoinable <EventType>*/{
  getCollectionName() {
    return 'events'
  }

  async join(
    event_id /* : string */,
    user_id/* : string */,
  ) /* : Promise<EventType> */ {
    return this._db.query(aql`
      LET doc = DOCUMENT(${event_id})
      UPDATE doc WITH {
        participants: { ${user_id}: DATE_ISO8601( DATE_NOW() ) }
      } IN ${this._collection} RETURN NEW
    `).then(({_result}) => new Node(_result[0]));
  }

  async leave(
    event_id /* : string */,
    user_id/* : string */,
  ) /* : Promise<EventType> */ {
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
  ) /* : Promise<EventType> */ {
    return this._db.query(aql`
      LET doc = DOCUMENT(${event_id})
      doc.host == ${user_id} ? (
        UPDATE doc WITH {
          participants: UNSET(
            doc.participants,
            ${participant_id}
          )
        } IN ${this._collection} OPTIONS { mergeObjects: false } RETURN NEW
      ) : RETURN doc
    `).then(({_result}) => new Node(_result[0]));
  }
}