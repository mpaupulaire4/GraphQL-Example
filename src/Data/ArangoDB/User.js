/// @flow

import { Model, Node } from './'
import { aql } from 'arangojs'
import DataLoader from 'dataloader'
/*::
  import type { iUserModel } from '../models';
  export type UserType = {
    id: string,
    first_name: string,
    last_name: string,
    email: string,
    photo_url: string,
    facebook: FacebookInfo,
    friends: Array<string>,
  };

  type FacebookInfo = {
    id: string,
    link: 'string'
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

