

const Node = `
  interface Node {
    id: ID!
  }
`

const Queries = `
  extend type Query {
    # Return a Node
    node(id: String!): Node
  }
`

export const NodeResolvers = {
  Query: {
    node: (_, {id}, {Node}) => {
      return Node.findById(id);
    }
  },
  Node: {
    __resolveType: (data, context, info) => {
      return info.schema.getType(data.SchemaType);
    },
  },
}

export const NodeSchema = () => [
  Node,
  Queries
]