var express = require('express');
var app = express();

// This is the definition of the Fund class
class Fund {
    constructor(id, name, description, goal, progress, tags, ownerName, ownerAddress, location) {
		// Randomly generated hashcode for id
		this.id;
		// Name of the fund
		this.name = name;
		// Description for the fund
		this.description = description;
		// Goal for the fund
		this.goal = goal;
		// Progress made towards the goal for the fund
		this.progress = progress;
		// Stats for progress made towards the goal for the fund
		this.completion = completion;
		// Tags for searching the fund
		this.tags = tags;
		// Name of the fund creator
		this.ownerName = ownerName;
		// Email address of fund owner
		this.ownerAddress = ownerAddress;
		// Where the fund was made
		this.location = location;
		// this.fundLog = fundLog;
    }
}

// This is the map of IDs to Fund objects
var funds = new Map();
funds.set(new Fund(1234, 'Care Fund', 'For the kids!', 123, 0, [kids, inprogress], 'Kids for Care', 'kidsforcare@gmail.com', 'Ireland'));

// This is the '/test' endpoint that you can use to check that this works
app.use('/test', (req, res) => {
	// create a JSON object
	var data = { 'message' : 'It works!' };
    // send it back
	res.json(data);
    });

// endpoint for sorting funds by progress
app.use('/allprogress', (req, res) => {
    
	// find all the Fund objects in the database
	Person.find( {}, (err, funds) => {
		if (err) {
		    res.type('html').status(200);
		    console.log('uh oh' + err);
		    res.write(err);
		}
		else {
		    if (persons.length == 0) {
			res.type('html').status(200);
			res.write('There are no funds');
			res.end();
			return;
		    }
		    else {
			res.type('html').status(200);
			res.write('Here are the funds in the database:');
			res.write('<ul>');
			// show all the people
			persons.forEach( (fund) => {
			    res.write('<li>');
			    // res.write('Name: ' + fund.name + '; Description: ' + fund.description + '; Goal: ' + fund.goal + '; Owner: '
				// + fund.ownerName + '; Email: ' +  fund.ownerAddress + '; Tags: ' + fund.tags +
				// '; Location: ' + fund.location);
				res.write('Name: ' + fund.name + '; Goal: ' + fund.goal + '; Progress: ' + fund.progress +
				'; Completion: ' + fund.completion + '% ; Owners: ' + fund.ownerName);
			    // // this creates a link to the /delete endpoint
			    res.write(" <a href=\"/delete?name=" + person.name + "\">[Delete]</a>");
			    res.write('</li>');
					 
			});
			res.write('</ul>');
			res.end();
		    }
		}
	}).sort(function (x, y) { 
		return x.completion - y.completion; // completion = fund.progress / (fund.goal * 1.0) * 100
        // return x.(fund.progress / (fund.goal * 1.0) * 100) - y.(fund.progress / (fund.goal * 1.0) * 100)
	});
	// }).sort({ 'progress': 'asc'}); // this sorts them BEFORE rendering the results
});

// This is the '/test' endpoint that you can use to check that this works
app.use('/donatefund', (req, res) => {
	// create a JSON object
	var data = { 'message' : 'It works!' };
    // send it back
	res.json(data);
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
