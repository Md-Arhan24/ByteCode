require('dotenv').config();
const jwt = require('jsonwebtoken')

//this is a function not middleware.
module.exports.createSecretToken =  (id,username) => {
    return jwt.sign({id,username},process.env.TOKEN_KEY,{
        //expires in 3 ddays
        expiresIn: 3 * 24 * 60 * 60,
    });
}