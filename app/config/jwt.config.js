const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.generateAccessToken = (user) => {
return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "60m"})
// return jwt.sign(user, "justasecret", {expiresIn: "60m"})

}
