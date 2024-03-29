const { ObjectId } = require('mongodb');
var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');


var Schema = mongoose.Schema;

// commented out stuff is for the MonetaryFund - not relevant to current set up
// will implement editing those values later - currently aiming for a very basic setup
var contributorSchema = new Schema({
    // description: String,
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    name: String,
    contribution_log : [{
        fundId : ObjectId,
        fundName : String,
        contribution : Number,
        date : Date
    }],
    notes : [{
        date: Date,
        note : String,
        fundName : String
    }]
    });


contributorSchema.plugin(passportLocalMongoose);
// export fundSchema as a class called Fund
module.exports = mongoose.model('Contributor', contributorSchema);



// unclear if we want it to be case sensitive
contributorSchema.methods.standardizeName = function() {
    this.username = this.username.toLowerCase();
    return this.username;
}