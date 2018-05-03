// @flow

/* ::
  export interface iNode {
    id: string
  }

  export interface iModel<T: iNode> {
    findById(id: string): Promise<?T>,

    findByIds(ids: Array<string>): Promise< Array<?T> >,

    find(examp: $Subtype<T>): Promise<T[]>,

    create(examp: $Subtype<T>): Promise<T>,

    update(examp: { id: string } & $Subtype<T>): Promise<T>,

    _prime(data: $Supertype<T>): Promise < void >,
  }

  export interface iUserModel<T: iNode> {
    proccessUserFBFriends(user: T, fbFriendIDs: Array <string>): Promise<void>,
  }
*/


export { default as User } from './ArangoDB/User';
export { default as Event } from './ArangoDB/Event';
export { default as Convo } from './ArangoDB/Convo';
