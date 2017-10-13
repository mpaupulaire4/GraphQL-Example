import { UserSchema } from '../User'
import { ConversationSchema } from '../Conversation'


const Event = `
    type Event {
        id: ID!
        host: User!
        title: String!
        description: String
        loaction: Location!
        time: String!
        participants: [User!]!
    }

    extend type Query {
        events: [Event!]!
        event(id: ID!): Event
    }
`

const Location = `
    type Location {
        latitude: Float!
        longitude: Float!
        address: String
        city: String
        state: String
        city_state: String
        zip: String
    }
`

export const EventResolvers = {
    Query: {
        events: (_, args, context) => {
            return []
        },
        event: (_, args, context) => {
            return null
        }
    },
    Event: {

    },
    Location: {
        city_state: (location) => location.city_state || `${location.city}, ${location.state}`
    }
}


export const EventSchema = () => [
    Event,
    Location,
    UserSchema,
    ConversationSchema
]