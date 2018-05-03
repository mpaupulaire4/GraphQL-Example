/// @flow

import { Model, Node } from './'
import DataLoader from 'dataloader'
/*::
  export type ConvoType = {
    id: string,
  };
*/

export default class Convo extends Model/* :: <ConvoType> */{
  getCollectionName() {
    return 'conversations'
  }
}