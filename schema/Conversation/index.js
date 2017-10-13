
const Conversation = `
    type Conversation {
        id: ID!
        title: String!
        messages: [Message!]!
        participants: [Participant!]!
    }

    extend type Query {
        conversations: [Conversation!]!
        conversation(id: ID!): Conversation
    }
`
const Message = `
    type Message {
        text: String!
        owner: ID!
        timestamp: String!
    }
`

const Participant = `
    type Participant {
        id: ID!
        display_name: String!
        photo_url: String!
        last_viewed: String!
    }
`

export const ConversationResolvers = {
    Query: {
        conversation: (_, args, context) => {
            return null
        },
        conversations: (_, args, context) => {
            return []
        }
    },
    Conversation: {
        messages: (convo, args, context) => {
            return []
        },
        participants: (convo, args, context) => {
            return []
        }
    }
}

export const ConversationSchema = () => [Conversation, Participant, Message]