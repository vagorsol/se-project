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
funds.set(1234, 'Care Fund', 'For the kids!', 123, 0, [kids, inprogress], 'Kids for Care', 'kidsforcare@gmail.com', 'Ireland');


// This is the '/test' endpoint that you can use to check that this works
app.use('/test', (req, res) => {
	// create a JSON object
	var data = { 'message' : 'It works!' };
    // send it back
	res.json(data);
    });


// Helps create a fund
app.use('/create', (req, res) => {
	var newFund = new Fund ({
		id : req.body.id,
		name : req.body.name,
		description : req.body.description,
		goal : req.body.goal,
		progress : 0,
		tags : req.body.tags,
		ownerName : req.body.ownerName,
		ownerAddress : req.body.ownerAddress,
		location : req.body.location,
		// fundLog : req.body.fundLog,
	});

	var newFund = req.query.newFund;
	console.log("The name does not exist.");
	res.redirect('/all');
	// save the person to the database
	newFund.save( (err) => { 
		if (err) {
			res.type('html').status(200);
			res.write('uh oh: ' + err);
			console.log(err);
			res.end();
		}
		else {
			// display the "successfull created" message
			res.send('Successfully added ' + newFund.name + ' to the database');
		}
	}); 
});

// Deletes a fund from the database
app.use('/delete', (req, res) => {
	var name = req.query.name;
	// Finds specific fund
	Fund.find( queryObject, (err, funds) => {
		console.log(funds);
		if (err) {
			console.log('uh oh' + err);
			res.json({});
		}
		else if (funds.length == 0) {
			// no objects found, so send back empty json
			res.json({});
		}
		else {
			// "Delete" person
			funds.forEach( (fund) => {
				if (fund.equals(fund.name)) {
					fund == null;
				}
			});
		}
		console.log("The fund does not exist.");
		res.redirect('/all');
	});

// endpoint for showing all the funds
app.use('/all', (req, res) => {
    
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
			    res.write('Name: ' + fund.name + '; Description: ' + fund.description + '; Goal: ' + fund.goal + '; Owner: '
				+ fund.ownerName + '; Email: ' +  fund.ownerAddress + '; Tags: ' + fund.tags +
				'; Location: ' + fund.location);
			    // this creates a link to the /delete endpoint
			    res.write(" <a href=\"/delete?name=" + person.name + "\">[Delete]</a>");
			    res.write('</li>');
					 
			});
			res.write('</ul>');
			res.end();
		    }
		}
	}).sort({ 'name': 'asc' }); // this sorts them BEFORE rendering the results
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
});
