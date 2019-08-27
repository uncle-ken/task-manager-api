const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        //Get Token from header
        const token = req.header('Authorization').replace('Bearer ', '')
        //Check if token is valid
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        //Find user using _id in token and make sure token is still stored in mongo
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        //Check if user can be found
        if (!user) {
            throw new Error()
        }

        //Add token to req Object so it can be used by router later
        req.token = token
        
        //Add user to req Object so it can be used by router later
        req.user = user

        //Allow router to run
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate'})
    }
}

module.exports = auth