const Smurf = require('../models/smurf_model');
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const smurf = await Smurf.findOne({ _id: decoded._id, 'tokens.token': token });

    if (!smurf) {
      throw new Error();
    };

    req.token = token;
    req.smurf = smurf;
    next();
  } catch (err) {
    res.status(401).send({ error: 'Please authenticate.' });
  };
};

module.exports = auth;
