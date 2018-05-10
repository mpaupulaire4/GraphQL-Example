// @flow

/* ::
  import type { iNodeModel, iNode } from '../models';
  import type { Model } from './'
*/




export default class Node /* :: implements iNodeModel */{
  /* :: modelMap: { [collection: string]: Model<iNode>}; */
  constructor(
    modelMap /* : Array<Model<iNode>> */,
  ) {
    this.modelMap = modelMap.reduce((obj, model) => ({
      ...obj,
      [model.getCollectionName()]: model
    }), {});
  }
  async findById(
    id/* : string */
  )/* : Promise<?iNode> */ {
    const match = id.match(/([a-z]+)\/\d+/i);
    if (match) {
      const model = this.modelMap[match[1]]
      if (model) {
        return model.findById(id).then((data) => {
          return {
            ...data,
            SchemaType: model.constructor.name
          }
        });
      }
    }
  }
}