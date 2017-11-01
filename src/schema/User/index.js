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

        # User's Facebook Info
        facebook: FacebookProviderInfo!

        # List of the User's friends
        friends: [User!]
    }
`

const Queries = `
    extend type Query {
        # Get a list of all User's
        users: [User!]!

        # Get a specific user by ID
        user(
            # User ID
            id: ID!
        ): User
    }
`

const Mutations = `
    extend type Mutation {

    }
`

const FacebookProviderInfo = `
    # Various Facebook Specific info
    type FacebookProviderInfo {
        # User's facebook id
        id: ID!

        # Link to user's Facebook profile
        link: String
    }
`

export const UserResolvers = {
    Query: {
        users: (_, args, { User, ...context}) => {
            return User.find()
        },
        user: (_, {id}, { User, ...context}) => {
            return User.findById(id);
        },
    },
    User: {
        name: (user, args, {current_user}) => user.can_view(current_user, user.name),
        display_name: (user, args, {current_user}) => user.can_view(current_user, user.name, user.first_name),
        email: (user, args, {current_user}) => user.can_view(current_user, user.email),
        friends: (user, args, {current_user, User}) => {
            if (user.is_me(current_user)){
                return User.findByIds(user.friends)
            }
        },
    }
}


export const UserSchema = ()=> [ User, FacebookProviderInfo, Queries, Mutations, EventSchema]