const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const crypto = require('crypto');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    console.log('--- Google OAuth Profile ---');
    console.log(profile);
    console.log('--------------------------');
    try {
      const email = profile.emails[0].value;
      console.log(`Google user email: ${email}`);
      let user = await User.findOne({ email });

      if (user) {
        console.log('Existing user found:', user);
        // User exists, log them in
        return done(null, user);
      } else {
        console.log('No existing user found. Creating new user and tenant.');
        // User doesn't exist, create a new user and a new tenant
        const uniqueSlug = `${profile.displayName.toLowerCase().replace(/\s+/g, '-')}-${crypto.randomBytes(4).toString('hex')}`;
        const newTenant = new Tenant({
          name: `${profile.displayName}'s Organization`,
          slug: uniqueSlug
        });
        await newTenant.save();

        const newUser = new User({
          name: profile.displayName,
          email: email,
          googleId: profile.id,
          tenant: newTenant._id,
          isVerified: true, // Google users are considered verified
          role: 'admin' // First user is admin
        });
        await newUser.save();
        
        return done(null, newUser);
      }
    } catch (error) {
      return done(error, false);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});
