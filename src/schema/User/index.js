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

        # List of events
        events: [Event!]

        # User's Facebook Info
        facebook: FacebookProviderInfo!

        # List of the User's friends
        friends: [User!]
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

const FacebookProviderInfo = `
    type FacebookProviderInfo {
        # User's facebook id
        id: ID!
        link: String
    }
`

export const UserResolvers = {
    Query: {
        users: (_, args, { User, ...context}) => {
            return User.find()
        },
        user: (_, args, { User, ...context}) => {
            return User.find({id: args.id});
        },
    },
    User: {
        events: (user, args, context) => {
            return []
        }
    }
}


export const UserSchema = ()=> [ User, FacebookProviderInfo, EventSchema]