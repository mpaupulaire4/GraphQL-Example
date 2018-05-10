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

  export interface iNodeModel {
    findById(id: string): Promise<?iNode>,
  }

  export interface iUserModel<T: iNode> {
    proccessUserFBFriends(user: T, fbFriendIDs: Array <string>): Promise<void>,
  }

  export interface iEventModel<T: iNode> {
    findByLocation(
      location: {
        latitude: number,
        longitude: number
      },
      radius: number,
      limit?: number,
    ): Promise<Array<T>>,
  }

  export interface iJoinable<T: iNode> {
    join(event_id: string, user_id: string): Promise<T>,
    leave(event_id: string, user_id: string): Promise<T>,
    kick(
      event_id: string,
      user_id: string,
      participant_id: string,
    ): Promise<T>,
  }
*/


export { default as User } from './ArangoDB/User';
export { default as Event } from './ArangoDB/Event';
export { default as Convo } from './ArangoDB/Convo';
export { default as Message } from './ArangoDB/Message';
