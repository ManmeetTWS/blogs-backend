const jwt = require('jsonwebtoken')
const User = require('../models/userModel');

const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET, { expiresIn:'30d' })
}

const signup = async (req,res) => {
    const data = req.body;
    try {
        const user = await User.signup(data.email, data.username,data.password)

        // create a token
        const token = createToken(user._id)
        res.status(200).json({user,token})
    }
    catch(error) {
        res.status(400).json({error:error.message})
    }
}

const login = async (req,res) => {
    const {email, password} = req.body;
    try {
        const user = await User.login(email, password)

        // create a token
        const token = createToken(user._id)
        res.status(200).json({user,token})
    }
    catch(error) {
        res.status(400).json({error:error.message})
    }
}


module.exports = {
    login,
    signup
}