/// @flow

import { Model, Node } from './'
import { aql } from 'arangojs'
import DataLoader from 'dataloader'
/*::
  import type { iJoinable, iEventModel } from '../models';
  export type EventType = {
    id: string,
    host: string,
    title: string,
    description: string,
    time: string,
    location: Location,
    participants: ParticipantsMap,
    visibility: Visibility,
    invites: InviteMap,
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
    [user_id: string]: boolean,
  }

  type InviteMap = {
    [invitee_id: string]: string // inviter_id
  }

  type Visibility = 'PUBLIC' | 'PRIVATE' | 'NONE'
*/

export default class Event extends Model/* :: <EventType> implements iJoinable <EventType>, iEventModel<EventType> */{
  getCollectionName() {
    return 'events'
  }

  async find(
    examp/* :: ?: $Subtype<EventType> */,
  )/* : Promise<EventType[]> */  {
    let newExamp = examp
    if (examp && examp.participants) {
      newExamp = {
        ...examp,
        ...examp.participants.reduce((obj, id) => {
          obj[`participants.${id}`] = true
          return obj
        }, {})
      }
      delete newExamp['participants']
    }
    return super.find(newExamp)
  }

  async join(
    event_id /* : string */,
    user_id/* : string */,
  ) /* : Promise<EventType> */ {
    return this._db.query(aql`
      LET doc = DOCUMENT(${event_id})
      UPDATE doc WITH {
        participants: { ${user_id}: true }
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

  async findByLocation(
    {
      latitude,
      longitude,
    }/* : {
      latitude: number,
      longitude: number
    } */,
    radius /* : number */,
    limit /* :: ?: number */,
  ) /* : Promise<Array<EventType>> */ {
    return this._db.query(aql`
      FOR doc IN WITHIN(
        ${this._collection},
        ${latitude},
        ${longitude},
        ${radius},
        'distance'
      )
        return doc
    `).then(({_result}) => {
      return _result.map((res) => {
        return new Node(res);
      })
    });
  }
}