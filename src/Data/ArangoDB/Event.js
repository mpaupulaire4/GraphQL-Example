/// @flow

import { Model, Node } from './'
import DataLoader from 'dataloader'
/*::
  export type EventType = {
    id: string,
    convo_id: string,
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
    coordinates: [number, number],
  }

  type ParticipantsMap = {
    [user_id: string]: number,
  }

  type Visibility = 'PUBLIC' | 'PRIVATE' | 'NONE'
*/

export default class Event extends Model/* :: <EventType> */{
  getCollectionName() {
    return 'events'
  }
}