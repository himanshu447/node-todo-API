const jwt = require('jsonwebtoken');
const User = require('../models/user');


const authTokenVerification = async (req, res, next) => {

    try {
        const userProviderToken = req.header('Authorization').replace('Bearer ', '');
        const decoder = await jwt.verify(userProviderToken, process.env.JWT_SECRET_KEY)

        const user = await User.findOne({ _id: decoder._id, 'tokens.token': userProviderToken });

        if (!user) {
            throw new Error();
        }
    
        req.token = userProviderToken;
        req.user = user;
        next();

    } catch (e) {
        res.status(401).send({ Error: 'Please Authenticate.' });
    }
}

module.exports = authTokenVerification;