const express = require('express');
require('dotenv').config();
const app = express();
const mongoose = require('mongoose');
const PORT = process.env.PORT || 8080;


//code
app.get('/',(req,res) => {
    res.send('started');
})

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