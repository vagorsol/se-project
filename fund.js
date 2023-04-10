const { ObjectId} = require('mongodb');
var mongoose = require('mongoose');

// the host:port must match the location where you are running MongoDB
// the "myDatabase" part can be anything you like

var Schema = mongoose.Schema;

// commented out stuff is for the MonetaryFund - not relevant to current set up
// will implement editing those values later - currently aiming for a very basic setup
var fundSchema = new Schema({
	name: {type: String, required: true, unique: true},
    description: String,
    goal: Number,
    progress: Number,
    owners: [ObjectId],
    contributor_log: [{
        contributor_id: ObjectId,
        contribution: Number,
        date : Date
    }],
    location: String,
    creationDate: Date
    // tags : [String]
    });

// export fundSchema as a class called Fund
module.exports = mongoose.model('Fund',fundSchema);

// unclear if we want it to be case sensitive
fundSchema.methods.standardizeName = function() {
    this.name = this.name.toLowerCase();
    return this.name;
}