import { UserSchema } from '../User'
import { pubsub } from '../../subscriptions'

const Conversation = `
  type Conversation {
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
  type Message {
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

const TOPICS = {
  get CONVERSATION_NEW_MESSAGE(){
    return 'CONVERSATION_NEW_MESSAGE'
  }
}

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
    post_message: (_, {message: {conversation_id, ...message}}, {Convo, current_user}) => {
      message.owner = current_user.id
      return Convo.post_message(conversation_id, message).then((message) => {
        pubsub.publish(`${TOPICS.CONVERSATION_NEW_MESSAGE}_${message.conversation_id}`, {id: message.id})
        return message
      })
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
        'convo_id': convo.id
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
  UserSchema
]