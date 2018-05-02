/// @flow

import { Model, Node } from './'
import { aql } from 'arangojs'
import DataLoader from 'dataloader'
/*::
  import type { iUserModel } from '../models';
  export type UserType = {
    id: string
  };
*/

export default class User extends Model/* :: <UserType> implements iUserModel<UserType> */{
  getCollectionName() {
    return 'users'
  }

  async proccessUserFBFriends(
    user /* : { id: $PropertyType<UserType, 'id'> } */,
    fbFriendIDs/* : Array <string> */,
  ) {
    user = new Node(user);
    this._db.query(aql`
      UPDATE ${user} WITH {
        friends: (
          FOR doc IN users
            FILTER doc.facebook.id IN ${fbFriendIDs}
            RETURN doc._id
        )
      } IN users
    `)
  }
}

