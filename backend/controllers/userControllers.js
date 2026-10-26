// const user = require('../models/user');
// const createSecretToken = require('../utils/createSecretToken');
// const bcrypt = require('bcrypt');

// module.exports.signup = async (req,res,next) => {
//    try{
//      //first get the data
//     const {username,email,password} = req.body;

//     //check does user exists
//     const userExists = await user.findOne({email});

//     if(userExists){
//         return res.json({message:"user alredy exists"});
//     }

//     //create a user
//     // const newUser = await user.create({username:username,email:email,password:password}); or
//     const newUser = await user.create({username,email,password});

//     //create a token
//     const token = createSecretToken(newUser.id,newUser.username);

//     //create a cookie and store it
//     res.cookie("token",token,{
//         httpOnly:true,
//         sameSite:"none",//we should access from others site as well
//         secure:true,
//         maxAge: 3 * 24 * 60 * 60 * 1000,//3 days 
//     });

//     res.status(201).json({message:"user sign up successfully",success:true,newUser});
    

//    }catch(e){
//     res.status(501).json({message:"error occured",e});
//    }
// }

// module.exports.login = async (req,res,next) => {
//     try{
//         //get the email and passowrd
//         const {email,password} = req.body;

//         if(!email || !password){
//             return res.json({message : "email or passowrd is required"});
//         }

//         const currUser = await user.findOne({email});

//         if(!currUser){
//             return res.json({message:"incorrect email or password"});
//         }

//         const matchedPass = await bcrypt.compare(password,currUser.password);
//         if(!matchedPass){
//              return res.json({message:"incorrect email or password"});
//         }

//         //create a token
//         const token = createSecretToken(currUser.id,currUser.username);
//         res.cookie("token",token,{
//             httpOnly:true,
//             sameSite:"none",
//             secure:true,
//             maxAge: 3 * 24 * 60 * 60 * 1000,
//         });

//     return res.status(201).json({message:"user login successfully",success:true});


//     }catch(e){
//         return res.status(501).json({message : "authentication failed",e});
//     }
// }
// module.exports.logout = async (req, res,next) => {
//   try {
//     const cookie = req.cookies.token;
//     if (!cookie) {
//       return res.json({ message: "no active session found", status: false });
//     }
//     res.cookie("token", "", {
//       httpOnly: true,
//       expires: new Date(0),
//       secure: true,
//       sameSite: "none", // must match login cookie
//     });
//     return res.json({ message: "user logout successfully", status: true });
//   } catch (e) {
//     console.log(e);
//     return res.json({ message: "error in logout", status: false });
//   }
// };

const User = require('../models/user');
const {createSecretToken} = require('../utils/createSecretToken');

// const isProd = process.env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none' // use 'lax' in prod too if frontend is same-site
};
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (![username, email, password].every(isNonEmptyString)) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({ success: false, message: 'Password must be 8-72 characters' });
    }

    const newUser = await User.create({ username, email, password });
    const token = createSecretToken(newUser.id, newUser.username);

    res.cookie('token', token, { ...cookieOptions, maxAge: THREE_DAYS_MS });
    return res.status(201).json({
      success: true,
      message: 'Signed up successfully',
      user: { id: newUser.id, username: newUser.username, email: newUser.email },
    });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ success: false, message: 'Username or email already in use' });
    }
    if (e.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: e.message });
    }
    next(e);
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const currUser = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    const isMatch = currUser && (await currUser.comparePassword(password));

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect email or password' });
    }

    const token = createSecretToken(currUser.id, currUser.username);
    res.cookie('token', token, { ...cookieOptions, maxAge: THREE_DAYS_MS });
    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: { id: currUser.id, username: currUser.username, email: currUser.email },
    });
  } catch (e) {
    next(e);
  }
};

module.exports.logout = (req, res) => {
  res.clearCookie('token', cookieOptions);
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};