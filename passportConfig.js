const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const User = require("./User");
const fs = require("fs");

const gStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleUserId: profile.id });
      if (user) {
        done(null, user);
      } else {
        // register
        let createdUser = await User.create({
          googleUserId: profile.id,
          name: profile._json.name,
          avatar: profile._json.picture,
        });
        done(null, createdUser);
      }
    } catch (error) {
      done(error);
    }
  }
);

// Set up proxy (only require in the servers base in China)
if (process.env.NODE_ENV === "development") {
  var HttpsProxyAgent = require("https-proxy-agent");
  const agent = new HttpsProxyAgent(
    process.env.HTTP_PROXY || "http://127.0.0.1:8001"
  );
  gStrategy._oauth2.setAgent(agent);
}

passport.use(gStrategy);

// JWT Strategy

var opts = {};
opts.jwtFromRequest = function (req) {
  var token = null;
  if (req && req.cookies) {
    token = req.cookies["jwt"];
  }
  return token;
};
let pubKey = fs.readFileSync("./keys/pub.key");
opts.secretOrKey = pubKey;

passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    done(null, jwt_payload.data);
  })
);
