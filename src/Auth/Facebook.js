import passport from 'passport'
import PassportFacebook from 'passport-facebook'
import { User } from '../Firebase/Models'

export function setUpAuth(app, { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET } = {}) {
    if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
        console.warn('\n\Facebook App ID or Secret not passed; login won\'t work.\n\n'); // eslint-disable-line no-console
        return null;
    }

    passport.use(new PassportFacebook.Strategy({
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: process.env.NODE_ENV !== 'production' ? 'http://localhost:3100/auth/facebook/callback' : 'http://PROD_URL/login/github/callback',
        profileFields: ['id', 'displayName', 'email', 'name', 'profileUrl', 'photos', 'friends']
    }, (accessToken, refreshToken, profile, done) => {
        const profileObj = profile._json
        const UserModel = new User();
        FBProfileToUser(profileObj, UserModel).then((user) => {
            done(null, user)
            UserModel.ProccessFBFriendsForUser(user.id, profileObj.friends.data).catch((error) => {
                console.log(error)
            })
        }).catch((error) => {
            console.log(error)
            done(null, false, error)
        })
    }))

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
        new User({id}).findById(id).then((user) => {
            done(null, user);
        })
    });

    app.use(passport.initialize());
    app.use(passport.session());

    // Redirect the user to Facebook for authentication.  When complete,
    // Facebook will redirect the user back to the application at
    //     /auth/facebook/callback
    app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['public_profile', 'user_friends']}));

    // Facebook will redirect the user to this URL after approval.  Finish the
    // authentication process by attempting to obtain an access token.  If
    // access was granted, the user will be logged in.  Otherwise,
    // authentication has failed.
    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect: '/',
        // failureRedirect: '/login'
    }));

    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });
}


function FBProfileToUser({id, last_name, first_name, name, email, picture, link}, UserModel){
    const userInfo = {
        name,
        first_name,
        last_name,
        email,
        photo_url: picture.data.url,
        facebook: {
            id,
            link
        }
    }
    return UserModel.findOne({'facebook.id': id}).then((user) => {
        if (user){
            user.update(userInfo)
            return user
        }
        const newUser = new UserModel.DataInstance(userInfo);
        newUser.save().catch(error => console.log(error));
        return newUser
    })
}