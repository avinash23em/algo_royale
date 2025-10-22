const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:5000/api/auth/google/callback',
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // Update last active and avatar in case it changed
          user.lastActive = Date.now();
          user.avatar = profile.photos[0]?.value || user.avatar;
          await user.save();
          return done(null, user);
        }

        // Create a new user
        const email = profile.emails[0]?.value;
        const displayName = profile.displayName;
        
        // Generate a unique username from email or displayName
        let username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Check if username exists and make it unique
        let usernameExists = await User.findOne({ username });
        let counter = 1;
        while (usernameExists) {
          username = `${email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')}${counter}`;
          usernameExists = await User.findOne({ username });
          counter++;
        }

        user = await User.create({
          googleId: profile.id,
          email,
          username,
          displayName,
          avatar: profile.photos[0]?.value,
          lastActive: Date.now()
        });

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

module.exports = passport;
