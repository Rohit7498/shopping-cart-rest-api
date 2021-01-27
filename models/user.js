const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
    {
        userId: {type: String, required: true, unique:true},
        userName: {type: String, required: true},
        createdOn: {type:Date, default: Date.now}

    });
  
  module.exports = mongoose.model("User", UserSchema);
