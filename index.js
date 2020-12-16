const express = require("express");
const app = express();
const bodyParser = require("body-parser");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("view engine", "ejs");

const cookieParser = require("cookie-parser");
app.use(cookieParser());
require("./passportConfig");

app.use(require("./router"));

app.listen(process.env.PORT, () => {
  console.log("listen on port " + process.env.PORT);
});
