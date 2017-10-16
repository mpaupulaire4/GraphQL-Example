import { EventSchema } from '../Event'


const User =`
    # Type for users of the app
    type User {
        # the User's Unique ID
        id: ID!

        # User's first name
        first_name: String!

        # User's last name
        last_name: String

        # User's full name
        name: String

        # User's email
        email: String

        # User's name for use in being displayed. May be different based on relationship to the User
        display_name: String!

        # URL for a User's phto
        photo_url: String

        # User's email
        email: String

        # List of events
        events: [Event!]

        # List of the User's friends
        friends: [User!]!
    }

    extend type Query {
        # Get a list of all User's
        users: [User!]!

        # Get a specific user by ID
        user(
            # ID of the user you are looking for
            id: ID!
        ): User
    }
`

export const UserResolvers = {
    Query: {
        users: (_, args, context) => {
            return []
        },
        user: (_, args, context) => {
            return null
        },
    },
    User: {
        name: (user) => user.name || `${user.first_name} ${user.last_name}`,
        display_name: (user) => `${user.first_name}`,
        events: (user) => {
            return []
        }
    }
}


export const UserSchema = ()=> [ User, EventSchema]