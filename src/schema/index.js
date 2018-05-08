import { merge } from 'lodash';
import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';

// DATE TYPES
import {
  GraphQLDate,
  GraphQLTime,
  GraphQLDateTime
} from 'graphql-iso-date';

// TYPE DEFS
import { EventSchema, EventResolvers } from './Event'
import { UserSchema, UserResolvers } from './User'
import { ConversationSchema, ConversationResolvers } from './Conversation'

// END TYPE DEFS

// TEMPORARY
import { pubsub } from '../subscriptions';
const messages = [];
const MESSAGE_ADDED_TOPIC = 'message_added';
// END TEMPORARY

const DateTypes = `
  scalar DateTime
  scalar Date
  scalar Time
`
const RootSchema = `
  type Query {
    # Get the currently logged in user (null if none)
    current_user: User
  }

  type Subscription {
    messageAdded: Temp
  }

  type Temp {
    text: String
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


const RootResolvers = {
  Query: {
    current_user: (_, args, {current_user}) => current_user
  },
  Mutation: {
    addMessage: (_, { text }, context) => {
      messages.push(text)
      pubsub.publish(MESSAGE_ADDED_TOPIC, { messageAdded:{ text} });
      return messages
    }
  },
  Subscription: {
    messageAdded: {
      subscribe: () => pubsub.asyncIterator(MESSAGE_ADDED_TOPIC),
    },
  },
  Date: GraphQLDate,
  Time: GraphQLTime,
  DateTime: GraphQLDateTime
};

// Put schema together into one array of schema strings
// and one map of resolvers, like makeExecutableSchema expects
const schema = [
  RootSchema,
  DateTypes,
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
// addMockFunctionsToSchema({schema: executableSchema})

export default executableSchema;