const passport = require('passport');
const AuthService = require('./authservice');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
require('dotenv').config();

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const authService = new AuthService();
    authService.getExistingPayload(payload)
      .then((value) => {
        console.log(value);
        if (value) {
          return done(null, value);
        } else {
          return done(null, false);
        }
      })
      .catch((error) => {
        console.log(error);
        return done(error, false);
      });
  } catch (error) {
    return done(error, false);
  }
}));

module.exports = passport;
