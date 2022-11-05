const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'justasecret');
    const userId = decodedToken.userId;
    if (req.body.userId && req.body.userId !== userId) {
      throw 'Invalid user ID';
    } else {
      req.body.userId = userId;
      next();
    }
  } catch (error) {
    res.status(401).json({
      message: 'Unauthorized request!'
    });
  }
};