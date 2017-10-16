import passport from 'passport'
import PassportFacebook from 'passport-facebook'

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
        // console.log(JSON.stringify(profile._json, null, 2));
        const user = FBProfileToUser(profile._json)
        ProcessFriendsList(profile._json.friends)
        done(null, {id: profile._json.id, ...user})
    }))

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
        done(null, {id});
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


function FBProfileToUser({id, last_name, first_name, name, email, picture, link, friends, ...profile}){
    return {
        name,
        first_name,
        last_name,
        email,
        photo_url: picture.data.url,
    }
}

async function ProcessFriendsList(friends) {
    console.log('FRIEND DATA:', JSON.stringify(friends, null, 2))
    // Go through the list and process this user's friends list
}