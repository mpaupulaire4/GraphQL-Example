import { UserSchema } from '../User'
import { ConversationSchema } from '../Conversation'


const Event = `
    type Event {
        # Event ID
        id: ID!

        # The Host (usually creator) of this Event
        host: User!

        # Event's Title
        title: String!

        # Brief Event description
        description: String

        # This events location info
        loaction: Location!

        # This Event's time/date
        time: String!

        # List of Users participating in the event
        participants: [User!]!

        # The event's visibility
        visibility: Visibility!
    }
`
const Queries = `
    extend type Query {
        # Query all events
        events(
            filter: EventSearchInput
        ): [Event!]!

        events_by_location(
            location: LocationInput!
        ): [Event!]!
    }
`

const Visibility = `
    enum Visibility {
        # Visible to only your friends
        PRIVATE

        # Visible to all in the community
        PUBLIC

        # Not visible in any feeds (Invite Only)
        NONE
    }
`

const Mutations = `
    extend type Mutation {
        # Create an event for the currently signed in user.
        # The current user becomes the host.
        create_event(
            # Info on the event to create
            event: EventCreateInput!

            # A List of User ID's to send invites to
            invites: [ID!] = []
        ): Event

        # Join an event by ID
        join_event(
            # Event ID
            id: ID!
        ): Event

        # leave an event by ID
        leave_event(
            # Event ID
            id: ID!
        ): Event

        # leave an event by ID
        update_event(
            # Event ID
            event: EventUpdateInput!
        ): Event

        # Kick someone out of an event (Reserved for Hosts)
        kick_from_event(
            event_id: ID!
            participant_id: ID!
        ): Event
    }
`

const EventInput = `
    input EventCreateInput {
        title: String!
        description: String = ""
        visibility: Visibility = PUBLIC
        time: String!
        location: LocationInput!
    }

    input EventUpdateInput {
        id: ID!
        title: String
        description: String
        visibility: Visibility
        time: String
        location: LocationInput
    }

    input EventSearchInput{
        # ID has the highest priority (all others will be ignored)
        id: ID

        # Will search titles containing this string
        title: String

        # Will search descriptions containing this string
        description: String

        # Will search in between these 2 times.
        # Will only use first 2 positions
        time: [String!]

        # For pagination - where to begin search
        offset: Int = 0

        # For pagination - page size
        limit: Int = 1000
    }

    # LatLng's take precedence
    input LocationInput {
        latitude: Float!
        longitude: Float!
        address: String
        city: String
        state: String
        zip: String
    }
`
const Location = `
    # Location Object holding Location information
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
        events: (_, {filter}, context) => {
            console.log(filter)
            return []
        },
    },
    Mutation: {
        create_event: (_, {event, invites}, context) => {
            console.log(event, 'invites:', invites)
        },
        join_event: (_, {id}, context) => {
            console.log(id)
        },
        leave_event: (_, {id}, context) => {
            console.log(id)
        },
        update_event: (_, {event}, context) => {
            console.log(event)
        },
        kick_from_event: (_, {event_id, participant_id}) => {
            console.log(event_id, participant_id)
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
    Queries,
    Visibility,
    Mutations,
    EventInput,
    UserSchema,
    ConversationSchema
]