import { merge } from 'lodash';
import { makeExecutableSchema } from 'graphql-tools';
import { PubSub } from 'graphql-subscriptions';

// import { schema as gitHubSchema, resolvers as gitHubResolvers } from './github/schema';
// import { schema as sqlSchema, resolvers as sqlResolvers } from './sql/schema';
// import { pubsub } from './subscriptions';
const messages = [];
const pubsub = new PubSub();

const rootSchema = [`
type Query {
    hello: String
    add: [String]
}
type Subscription {
  messageAdded(ID: Int): String
}
type Mutation {
  addMessage(text: String!): [String]
}

schema {
  query: Query
  subscription: Subscription
  mutation: Mutation
}
`];

const MESSAGE_ADDED_TOPIC = 'message-added';

const rootResolvers = {
  Query: {
    hello: () => {
        return Math.random() < 0.5 ? 'Take it easy' : 'Salvation lies within';
    },
    add: () => {
      messages.push('text')
      pubsub.publish(MESSAGE_ADDED_TOPIC, {messageAdded: 'text'} );
      return messages
    }
  },
  Mutation: {
    addMessage: (_, { text }, context) => {
      messages.push(text)
      pubsub.publish(MESSAGE_ADDED_TOPIC, {messageAdded: text} );
      return messages
    }
  },
  Subscription: {
    messageAdded: {
      subscribe: () => pubsub.asyncIterator(MESSAGE_ADDED_TOPIC),
    },
  },
};

// Put schema together into one array of schema strings
// and one map of resolvers, like makeExecutableSchema expects
const schema = [
    ...rootSchema,
    // ...gitHubSchema,
    // ...sqlSchema
];
const resolvers = merge(
    rootResolvers,
    // gitHubResolvers,
    // sqlResolvers,
);

const executableSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers,
});

export default executableSchema;