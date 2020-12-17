const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const fs = require("fs");

router.get("/google", (req, res) => {
  passport.authenticate("google", {
    session: false,
    scope: ["profile"],
    state: req.query.origin,
  })(req, res);
});

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    let origin = req.query.state;
    // generate a JWT token
    let privateKey = fs.readFileSync("./keys/pri.key");

    let token = jwt.sign(
      {
        data: req.user,
      },
      privateKey,
      { expiresIn: 604800, algorithm: "RS256" }
    );
    res.cookie("jwt", token, { domain: process.env.COOKIE_DOMAIN });
    res.redirect(origin);
  }
);

router.get("/logout", (req, res) => {
  res.clearCookie("jwt", { domain: process.env.COOKIE_DOMAIN });
  res.redirect("/");
});

router.get("/", (req, res) => {
  let origin = req.query.origin;
  if (!origin) res.send("Origin Unauthorized!");
  else res.render("index", { origin: origin });
});

router.get(
  "/user",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.status(200).send(req.user);
  }
);

module.exports = router;
