import { UserSchema } from '../User'
import { ConversationSchema } from '../Conversation'
import { NodeSchema } from '../Node'

const Event = `
  type Event implements Node {
    # Event ID
    id: ID!

    # ID of the conversation tied to this event
    convo_id: ID!

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

    # The Events distance from the user.
    # Will only be defined on queries by location
    distance: Float
  }
`
const Queries = `
  extend type Query {
    # Query all events
    events(
      filter: EventSearchInput = {}
    ): [Event!]!

    event(
      # Event ID
      id: ID!
    ): Event

    events_by_location(
      # represent the center point to look around
      location: LocationInput!

      # Visibility filter
      view: VIEW = PUBLIC

      # How far out from the center point to look in meters
      # defaults to 40000 (about 25 miles)
      distance: Int = 40000
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
    visibility: Visibility = PRIVATE
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
    # ID of the event host
    host: ID

    # Will search titles containing this string
    title: String

    # Will search descriptions containing this string
    description: String

    # Will search in between these 2 times.
    # Will only use first 2 positions
    # time: [DateTime!]

    # Searches for Events where all the listed users are participating
    participants: [ID!]

    # For pagination - where to begin search
    # offset: Int = 0

    # For pagination - page size
    # limit: Int = 1000
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

  enum VIEW {
    # All public events
    PUBLIC

    # All events hosted by your friends
    FRIENDS

    # All events you've been invited to
    INVITES
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
    events: (_, {filter}, {Event, current_user}) => {
      return Event.find(filter)
    },
    event: (_, {id}, {Event, current_user}) => {
      return Event.findById(id)
    },
    events_by_location: (
      _,
      {location, distance, view},
      {Event, current_user}
    ) => {
      return Event.findByLocation(location, distance).then((events) => {
        return events.filter((event) => {
          switch (view) {
            case 'INVITES':
              return !!event.invites[current_user.id]
            case 'FRIENDS':
              return friendsViewFilter(event, current_user.friends)
            case 'PUBLIC':
            default:
              return event.visibility === 'PUBLIC'
          }
        })
      })
    }
  },
  Mutation: {
    create_event: async (_, {event, invites}, {current_user, Event, Convo}) => {
      const convo = await Convo.create({
        title: event.title,
      })
      Convo.join(convo.id, current_user.id)
      const new_event = await Event.create({
        ...event,
        host: current_user.id,
        participants: {},
        convo_id: convo.id,
        invites: invites.reduce((obj, id) => ({
          ...obj,
          [id]: current_user.id
        }), {})
      });
      return new_event
    },
    join_event: async (_, {id}, {Event, Convo, current_user}) => {
      const event = await Event.join(id, current_user.id)
      Convo.join(event.convo_id, current_user.id)
      return event
    },
    leave_event: async (_, {id}, {Event, Convo, current_user}) => {
      const event = await Event.leave(id, current_user.id);
      Convo.leave(event.convo_id, current_user.id)
      return event;
    },
    kick_from_event: async (_, {event_id, participant_id}, {Event, Convo, current_user}) => {
      const event = await Event.kick(event_id, current_user.id, participant_id);
      if (!event.participants[participant_id]) {
        Convo.kick(event.convo_id, current_user.id, participant_id)
      }
      return event;
    },
    update_event: (_, {event}, {Event}) => {
      return Event.update(event)
    },
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

function friendsViewFilter(event = {}, friends= []) {
  for (let id of friends) {
    if (
      event.visibility !== 'NONE' &&
      event.host === id
    )
      return true
    if (
      event.visibility === 'PUBLIC' &&
      event.participants[id]
    )
      return true
  }
  return false
}

export const EventSchema = () => [
  Event,
  Location,
  Queries,
  Visibility,
  Mutations,
  EventInput,
  UserSchema,
  ConversationSchema,
  NodeSchema,
]