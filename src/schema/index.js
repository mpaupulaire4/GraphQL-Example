import { merge } from 'lodash';
import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';

// TYPE DEFS
import { EventSchema, EventResolvers } from './Event'
import { UserSchema, UserResolvers } from './User'
import { ConversationSchema, ConversationResolvers } from './Conversation'

// END TYPE DEFS

// TEMPORARY
import { PubSub } from 'graphql-subscriptions';
const messages = [];
const pubsub = new PubSub();
// END TEMPORARY

const RootSchema = `

type Query {
    hello: String

    # Get the currently logged in user (null if none)
    currentUser: User
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

`;

const MESSAGE_ADDED_TOPIC = 'message-added';

const RootResolvers = {
  Query: {
    hello: () => Math.random() < 0.5 ? 'Take it easy' : 'Salvation lies within',
    currentUser: (_, args, {user}) => user
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
    RootSchema,
    EventSchema,
    UserSchema,
    ConversationSchema
];

const resolvers = merge(
    RootResolvers,
    EventResolvers,
    UserResolvers,
    ConversationResolvers
);

const executableSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers,
});

// FOR TESTING SCHEMA
addMockFunctionsToSchema({schema: executableSchema})

export default executableSchema;