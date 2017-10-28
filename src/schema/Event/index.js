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
        location: Location!

        # This Event's time/date
        time: DateTime!

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
            filter: EventSearchInput = {}
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

            # A List of User IDs to send invites to
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
        time: DateTime!
        location: LocationInput!
    }

    input EventUpdateInput {
        id: ID!
        title: String
        description: String
        visibility: Visibility
        time: DateTime
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
        time: [DateTime!]

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
        events: (_, {filter}, {Event}) => {
            return Event.find()
        },
    },
    Mutation: {
        create_event: async (_, {event, invites}, {current_user, Event, User, Convo}) => {
            return Event.create(event).then((new_event) => {
                Convo.create({
                    title: new_event.title,
                    id: new_event.id
                })
                return new_event
            })
        },
        join_event: (_, {id}, {Event, Convo}) => {
            return Event.join(id).then((event) => {
                Convo.join(event.id)
                return event
            })
        },
        leave_event: (_, {id}, {Event, Convo}) => {
            return Event.leave(id).then((event) => {
                Convo.leave(event.id)
                return event
            })
        },
        update_event: (_, {event}, {Event}) => {
            return Event.update(event)
        },
        kick_from_event: (_, {event_id, participant_id}, {Event, Convo}) => {
            return Event.kick(event_id, participant_id).then((event) => {
                Convo.kick(event.id, participant_id)
                return event;
            })
        }
    },
    Event: {
        host: (event, args,  {User}) => {
            return User.findById(event.host)
        },
        participants: (event, args, {User}) => {
            return User.findByIds(Object.keys(event.participants))
        },
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