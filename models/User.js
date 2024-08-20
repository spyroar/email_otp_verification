const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String,required: true,},
  lastName:  { type: String,required: true,},
  email: { type: String, required: true, unique: true },
  password: { type: String,required: true, unique: true},
  retype_password: { type: String,required: true,},
  mobile:{type:Number,required: true,},
  otp: { type: String },
   isVerified: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);
