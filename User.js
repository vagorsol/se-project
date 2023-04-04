var mongoose = require('mongoose');

// the host:port must match the location where you are running MongoDB
// the "myDatabase" part can be anything you like

var Schema = mongoose.Schema;

// commented out stuff is for the MonetaryFund - not relevant to current set up
// will implement editing those values later - currently aiming for a very basic setup
var userSchema = new Schema({
    // description: String,
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    name: String
    });

// export fundSchema as a class called Fund
module.exports = mongoose.model('User',userSchema);

// unclear if we want it to be case sensitive
userSchema.methods.standardizeName = function() {
    this.username = this.username.toLowerCase();
    return this.username;
}