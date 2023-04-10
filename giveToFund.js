var express = require('express');
var app = express();

// This is the definition of the Contributor class
class Contributor {
    constructor(id, name, contribution) {
		// Randomly generated hashcode for id
		this.id = id;
		// Name of the fund
		this.name = name;
		// Contribution for the fund
		this.contribution = contribution;
    }
}

// This is the array list of IDs of Contributor objects
var fundLog = [];
fundLog.push(new Contributor(1234, 'Morris Pine', 25));

// This is the '/test' endpoint that you can use to check that this works
app.use('/test', (req, res) => {
	// create a JSON object
	var data = { 'message' : 'It works!' };
    // send it back
	res.json(data);
    });

// endpoint for giving a note to the fund
app.use('/give', (req, res) => {
	var newContribution = new Contributor ({
		id : req.body.id,
		name : req.body.name,
		contribution : req.body.contribution,
	});

	console.log("Contribution created.");
	// save the contribution to the database
	newContribution.save( (err) => { 
		if (err) {
			res.type('html').status(200);
			res.write('uh oh: ' + err);
			console.log(err);
			res.end();
		}
		else {
			// display the "successfull created" message
			res.send('Successfully added ' + newContribution.contribution + ' to a note');
			res.write(" <a href=\"/give\">[Add Another Contribution]</a>");
		}
		res.write("<p> <a href=\"/\">[Return Home]</a>");
		res.end();
	});

// -------------------------------------------------------------------------
// DO NOT CHANGE ANYTHING BELOW HERE!

// This just sends back a message for any URL path not covered above
app.use('/', (req, res) => {
	res.send('Default message.');
    });

// This starts the web server on port 3000. 
app.listen(3000, () => {
	console.log('Listening on port 3000');
    });
});