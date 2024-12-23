import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import 'dotenv/config';


const GOOGLE_CLIENT_ID =  process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET =process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = process.env.NODE_ENV === 'production' 
    ? 'https://hostwebproject.onrender.com/auth/google/callback'
    : 'http://localhost:3000/auth/google/callback';
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL:CALLBACK_URL
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

export default passport;
