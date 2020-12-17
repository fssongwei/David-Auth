### Introduction

David-Auth is a SSO login system, which allow the apps under the domain `.wei.ai` to verify the user identity throw Json Web Token (JWT). The system currently support login ways through email / password, and Google / Facebook OAuth 2.0.

![David-Auth.png](https://i.loli.net/2020/12/17/K9ANYMU2mVeioSj.png)

[Demo](https://test.wei.ai/)

### Link To Login Panel

To utilize the David-Auth, the app can set their login link direct to the David-Auth login system on `https://auth.wei.ai`. A url query string with parameter `origin` is required (it tells the auth server to redirect back to your app after authorization process finished, otherwise the login panel will show a error message). For example, if your app is running on `https://myapp.wei.ai`，simply construct the following link:

```html
<a href="https://auth.wei.ai/?origin=https://myapp.wei.ai">Login</a>
```

### App Backend Configuration

After users finish their authorization process, the auth server will issue a JWT token stored in the cookie (which the domain has configured as `.wei.ai`). The JWT contains the following user data:

```schema
{
	name: String,
  avatar: String,
  googleUserId: String,
  facebookUserId: String,
	email: string
}
```

Detail user infomation data can also be accessed through `https://auth.wei.ai/user` (JWT Cookie Required)

The JWT cookie is now set to client browser and will be sent to the app backend server for every request. The app server can extract the JWT from the request cookie header and then verify.

The JWT issued by the auth server is signed and encrypt by the RSA key. The public key is provided below and can be used to verify if JWT is real:

```
-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC4Dppu06ECcPsnsr4/nnrRjscF
QuqdeFd2fwYzzvP4pQSt41p0/Dl0kSuqN56eGBKsW8/l3bWdAsLAVLPBSRvWjaor
A0ff0dteK9/RUGIKNLeq39LxV3p8wGnezA9mmY5I2o8HcQxR2jVPbzFGZYEMbmiB
gSDJp94pgfhExoyILQIDAQAB
-----END PUBLIC KEY-----
```

(You can save the public key into a `pub.key` file)

The following example shows the JWT authentication process of a Express App using Passport.js and `passport-jwt`

```javascript
// passportConfig.js
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const fs = require("fs");

var opts = {};
// Extract JWT from cookie
opts.jwtFromRequest = function (req) {
  var token = null;
  if (req && req.cookies) {
    token = req.cookies["jwt"];
  }
  return token;
};
// using the public key to verify JWT
let pubKey = fs.readFileSync("./keys/pub.key");
opts.secretOrKey = pubKey;

passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    // append the jwt payload data to req.user
    done(null, jwt_payload.data);
  })
);
```

```javascript
// index.js
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());
require("./passportConfig");

// ... other config & middlewares

router.get(
  "/someSerectRequest",
  // use passport.js JWT middlewares to process authentication
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // user is authenticated, process the request
  }
);
```
