import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import dotenv from 'dotenv'; 
dotenv.config(); 

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET
const CALLBACK_URL = process.env.NODE_ENV === 'production' 
    ? 'https://hostwebproject.onrender.com/auth/facebook/callback'
    : 'http://localhost:3000/auth/facebook/callback';
passport.use(
  new FacebookStrategy(
    {
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      callbackURL: CALLBACK_URL,
      profileFields: ['id', 'displayName', 'email'],
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

export default passport;
