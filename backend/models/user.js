const {Schema, Mongoose, default: mongoose} = require('mongoose');
const bcrypt = require('bcrypt');

const user = new Schema({
    username:{
        type:String,
        require:[true,"user name required"],
        unique:true,
    },
    email:{
        type:String,
        require:[true,"email required"],
        unique:true,
    },
    password:{
        type:String,
        require:[true,"password required"]
    },
    streak:{
        curr_streak:{type:Number,default:0},
        longest_streak:{type:Number,default:0},
        lastActivityDate:{type:Date,default:null}
    }
});

user.pre("save",async function(){
    this.password = await bcrypt.hash(this.password,12);
});

module.exports = mongoose.model("User",user);