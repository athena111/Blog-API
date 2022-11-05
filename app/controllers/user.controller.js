const bcrypt = require("bcrypt");
const db = require("../models");
const jwtConfig = require("../config/jwt.config")

const User = db.users;

exports.create = async (req, res) => {
    const body = req.body;

    if (!(body.email && body.password && body.first_name && body.last_name)) {
      return res.status(400).send({ error: "Data not formatted properly" });
    }

    // creating a new mongoose doc from user data
    const user = new User(body);
    // generate salt to hash password
    const salt = await bcrypt.genSalt(10);
    // now we set user password to hashed password
    user.password = await bcrypt.hash(user.password, salt);
    user.save().then((doc) => res.status(201).send(doc));
}

exports.login = async (req, res) => {
    const body = req.body;
    const user = await User.findOne({ email: body.email });
    if (user) {
      // check user password with hashed password stored in the database
      const validPassword = await bcrypt.compare(body.password, user.password);
      if (validPassword) {
        const token = jwtConfig.generateAccessToken({userId: user.id})   

        res.status(200).json({ 
            token,
            email: user.email,
            fullname: `${user.first_name} ${user.last_name}`,
            message: "login succcessful" 
        });
      } else {
        res.status(400).json({ error: "Invalid Password" });
      }
    } else {
      res.status(401).json({ error: "User does not exist" });
    }
}