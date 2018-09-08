import passport from 'passport'
import PassportFacebook from 'passport-facebook'
import PassportFacebookToken from 'passport-facebook-token'
import { User } from '../Data/models'

export function setUpAuth(app, { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, HOST_URL } = {}) {
	if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
		console.warn('\n\Facebook App ID or Secret not passed; login won\'t work.\n\n');
		return null;
	}

	passport.use(new PassportFacebook.Strategy({
		clientID: FACEBOOK_APP_ID,
		clientSecret: FACEBOOK_APP_SECRET,
		callbackURL: process.env.NODE_ENV !== 'production' ? 'http://localhost:3100/auth/facebook/callback' : `http://${HOST_URL}/auth/facebook/callback`,
		profileFields: ['id', 'displayName', 'email', 'name', 'profileUrl', 'photos', 'friends']
	}, facebookUserCallback))

	passport.use(new PassportFacebookToken({
    clientID: FACEBOOK_APP_ID,
		clientSecret: FACEBOOK_APP_SECRET,
		profileFields: ['id', 'displayName', 'email', 'name', 'profileUrl', 'photos', 'friends']
  }, facebookUserCallback));

	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
		(new User()).findById(id).then((user) => {
			done(null, user);
		}).catch(error => {
			console.log(error)
			done(error, false)
		})
	});

	app.use(passport.initialize());
	app.use(passport.session());
	app.use('/graphql', (req, res, next) => {
		if (!req.user) {
			return passport.authenticate('facebook-token')(req, res, next)
		}
		return next()
	})

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

function facebookUserCallback(accessToken, refreshToken, profile, done) {
	const profileObj = profile._json
	FBProfileToUser(profileObj).then((user) => {
		done(null, user)
	}).catch((error) => {
		console.log(error)
		done(null, false, error)
	})
}


async function FBProfileToUser({
	id,
	last_name,
	first_name,
	name,
	email,
	picture,
	link,
	friends
}){
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
	const UserModel = new User();
	return UserModel.find({"facebook.id": id }).then((users) => {
		let userPromise = null;
		if (users[0]){
			userPromise = UserModel.update({id: users[0].id, ...userInfo});
		} else {
			userPromise = UserModel.create(userInfo);
		}
		return userPromise.then((user) => {
			UserModel.proccessUserFBFriends(user, friends.data);
			return user;
		});
	})
}