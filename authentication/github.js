import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const CALLBACK_URL = process.env.NODE_ENV === 'production' 
    ? 'https://hostwebproject.onrender.com/auth/github/callback'
    : 'http://localhost:3000/auth/github/callback';
if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
  throw new Error('Missing GitHub Client ID or Secret in environment variables');
}

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: CALLBACK_URL
      
    },
    (accessToken, refreshToken, profile, done) => {
      // Xử lý profile người dùng tại đây
      return done(null, profile);
    }
  )
);

export default passport;
