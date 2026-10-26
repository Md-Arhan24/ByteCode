// const {Schema, Mongoose, default: mongoose} = require('mongoose');
// const bcrypt = require('bcrypt');

// const user = new Schema({
//     username:{
//         type:String,
//         require:[true,"user name required"],
//         unique:true,
//     },
//     email:{
//         type:String,
//         require:[true,"email required"],
//         unique:true,
//     },
//     password:{
//         type:String,
//         require:[true,"password required"]
//     },
//     streak:{
//         curr_streak:{type:Number,default:0},
//         longest_streak:{type:Number,default:0},
//         lastActivityDate:{type:Date,default:null}
//     }
// });

// user.pre("save",async function(){
//     this.password = await bcrypt.hash(this.password,12);
// });

// module.exports = mongoose.model("User",user);

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // never returned unless explicitly requested
    },
    streak: {
      curr_streak: { type: Number, default: 0 },
      longest_streak: { type: Number, default: 0 },
      lastActivityDate: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
