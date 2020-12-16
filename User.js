const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  avatar: {
    type: String,
    default:
      "https://cityhope.cc/wp-content/uploads/2020/01/default-avatar.png",
  },
  googleUserId: String,
  facebookUserId: String,
  email: String,
  password: String,
});

module.exports = mongoose.model("User", userSchema);
