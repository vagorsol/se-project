const { ObjectId} = require('mongodb');
var mongoose = require('mongoose');
//var mongoose = require('mongoose');

// the host:port must match the location where you are running MongoDB
// the "myDatabase" part can be anything you like
//mongoose.connect('mongodb://127.0.0.1:27017/myDatabase');

var Schema = mongoose.Schema;

var fundFormSchema = new Schema({
	name: {type: String, required: true, unique: true},
	user: String
    });

// export fundSchema as a class called Fund
module.exports = mongoose.model('FundForm', fundFormSchema);

fundFormSchema.methods.standardizeName = function() {
    this.name = this.name.toLowerCase();
    return this.name;
}
