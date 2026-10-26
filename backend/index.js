const express = require('express');
require('dotenv').config();
const app = express();
const mongoose = require('mongoose');
const PORT = process.env.PORT || 8080;
const cookie_parser = require('cookie-parser');
const AuthRoute = require('./routes/userRoute');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');


//three default lines, to prase the data to json, cookie parser , can encode the url data
// app.use(express.json());
// app.use(cookie_parser());
// app.use(express.urlencoded({extended:true}));
app.use(helmet());//for more sercurity to http request
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookie_parser());

//code
// app.use('/',userVerfication,AuthRoute); - a userVerification wont be here as a middleware, becuase it execute on every req, and wont allow user to login or signup
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/user', AuthRoute);
app.use('/user/login', authLimiter);
app.use('/user/signup', authLimiter);

app.get('/',(req,res) => {
    res.send('server started');
})


// central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Something went wrong' });
});

async function  connect(){
    await mongoose.connect(process.env.MONGO_URL);
}

connect().then((msg) => {
    console.log('database connected successfully');
}).catch((e) => {
    console.log(`error occured ${e}`);
})

app.listen(PORT,() => {
    console.log(`server started at port ${PORT}`);
})