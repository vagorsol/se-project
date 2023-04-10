// export fundSchema as a class called Fund
//module.exports = mongoose.model('Fund',fundSchema);
const { ObjectId} = require('mongodb');
var mongoose = require('mongoose');

// the host:port must match the location where you are running MongoDB
// the "myDatabase" part can be anything you like
//mongoose.connect('mongodb://127.0.0.1:27017/myDatabase');

var Schema = mongoose.Schema;

var fundOwnerSchema = new Schema({
	owner: String, 
        //required: true, unique: true},
    fund: String
    });

// export fundSchema as a class called Fund
module.exports = mongoose.model('FundOwner', fundOwnerSchema);

fundOwnerSchema.methods.standardizeName = function() {
    this.owner = this.owner.toLowerCase();
    return this.owner;
}