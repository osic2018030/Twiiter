'use strict'
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = Schema({
    name: String,
    lastname: String,
    username: String,
    email: String,
    password:String,
    tweet: [{type: Schema.Types.ObjectId, ref:"tweet"}], 
    follow:[{type: Schema.Types.ObjectId, ref:"user"}]
});

module.exports = mongoose.model('user', UserSchema);