/// @flow

import { Model, Node } from './'
import DataLoader from 'dataloader'
/*::
  export type EventType = {
    id: string
  };
*/

export default class Event extends Model/* :: <EventType> */{
  getCollectionName() {
    return 'events'
  }
}