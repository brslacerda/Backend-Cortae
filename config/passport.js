const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');

passport.use(new GoogleStrategy({
  clientID: '215121742500-3vncm248d4ajn2m3k8vp3gfn5blkcg7j.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: 'http://localhost:5000/auth/google/callback'
},
async (token, tokenSecret, profile, done) => {
  try {
    let user = await User.findOne({ where: { googleId: profile.id } });
    if (!user) {
      user = await User.create({ googleId: profile.id, email: profile.emails[0].value });
    }
    return done(null, user);
  } catch (err) {
    return done(err, false);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, false);
  }
});
