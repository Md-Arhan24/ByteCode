//so a a basic user authentication requires singup, login and logout.

const route = require('express').Router();
const {userVerfication} = require('../middlewares/AuthMiddleware');
const {signup,login,logout} = require('../controllers/userControllers');


route.post('/signup',signup);
route.post('/login',login);
route.post('/logout',logout);
route.get('/', userVerfication);

module.exports = route;


