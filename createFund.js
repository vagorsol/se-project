var express = require('express');
var app = express();

// This is the definition of the Product class -- DO NOT CHANGE IT!
class Fund {
    constructor(name, description, goal, progress, tags, owner, location, fundLog) {
			this.name = name;
			this.description = description;
			this.goal = goal;
			this.progress = progress;
			this.tags = tags;
			this.owner = owner;
			this.location = location;
			this.fundLog = fundLog;
    }
}

// This is the map of IDs to Fund objects
var funds = new Map();
funds.set('Care Fund', 'For the kids!', 123, 32, [kids, inprogress], new Owner('1234', 'available'), 'Ireland', new fundLog());


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
		name : req.body.name,
		description : req.body.description,
		goal : req.body.goal,
		progress : req.body.progress,
		tags : req.body.tags,
		owner : req.body.owner,
		location : req.body.location,
		fundLog : req.body.fundLog,
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

app.use('/delete', (req, res) => {
	var name = req.query.name;
	
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
			    res.write('Name: ' + fund.name + '; Description: ' + fund.description + '; Goal');
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
