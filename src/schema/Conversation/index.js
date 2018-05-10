import { UserSchema } from '../User'
import { pubsub } from '../../subscriptions'
import { NodeSchema } from '../Node'

const Conversation = `
  type Conversation implements Node {
    id: ID!
    title: String!
    messages: [Message!]!
    participants: [ParticipantInfo!]!
  }
`

const Queries = `
  extend type Query {
    conversations(
      search: ConvoSearch = {}
    ): [Conversation!]!
    conversation(
      id: ID!
    ): Conversation
  }
`

const Mutations = `
  extend type Mutation {
    # Post a message to a conversation
    post_message(message: MessagePost!): Message
  }
`

const InputTypes = `
  input ConvoSearch {
    id: ID
    title: String
    text: String
    limit: Int = 1000
    offset: Int = 0
  }

  input MessagePost {
    conversation_id: ID!
    text: String!
  }
`

const Message = `
  type Message implements Node {
    id: ID!
    text: String!
    owner: ID!
    timestamp: DateTime!
  }
`

const Participant = `
  type ParticipantInfo {
    # The user id
    id: ID!

    # A timestamp for when this user last viewed the conversation
    last_viewed: DateTime!
  }
`

const Subscriptions = `
extend type Subscription {
  new_message(
    # Conversation ID
    id: ID!
  ): Message
}
`

const TOPICS = Object.freeze({
  CONVERSATION_NEW_MESSAGE: 'CONVERSATION_NEW_MESSAGE'
});

export const ConversationResolvers = {
  Query: {
    conversation: (_, {id}, {Convo}) => {
      return Convo.findById(id)
    },
    conversations: (_, {search: {limit, offset, ...search}}, {Convo}) => {
      return Convo.find(search)
    }
  },
  Mutation: {
    post_message: async (_, {message}, {Message, current_user}) => {
      message.owner = current_user.id
      message.timestamp = (new Date()).toISOString();
      const newMessage = await Message.create(message)
      pubsub.publish(`${TOPICS.CONVERSATION_NEW_MESSAGE}_${newMessage.conversation_id}`, {id: newMessage.id})
      return newMessage
    }
  },
  Subscription: {
    new_message: {
      resolve: ({id}, args, {Message}) => {
        return Message.findById(id)
      },
      subscribe: (_, {id}, context, info) => {
        return pubsub.asyncIterator(`${TOPICS.CONVERSATION_NEW_MESSAGE}_${id}`)
      }
    }
  },
  Conversation: {
    participants: (convo) => {
      return Object.keys(convo.participants).map((key) => {
        return {
          id: key,
          ...convo.participants[key]
        }
      })
    },
    messages: (convo, args, {Message}) => {
      return Message.find({
        'conversation_id': convo.id
      });
    }
  },
}

export const ConversationSchema = () => [
  Conversation,
  Participant,
  Queries,
  Mutations,
  Subscriptions,
  InputTypes,
  Message,
  UserSchema,
  NodeSchema,
]