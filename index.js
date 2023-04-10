// set up Express
var express = require('express');
var app = express();

// set up BodyParser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// set up MongoDB and Mongoose
var mongoose = require('mongoose');
mongoose.connect(
	'mongodb+srv://jshand:SoftTeam@fundcollections.7fyo0g4.mongodb.net/?retryWrites=true&w=majority', 
	{
	  useNewUrlParser: true,
	  useUnifiedTopology: true
	}
  ); 

  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error: "));
  db.once("open", function () {
	console.log("Connected successfully");
});

// import the Fund class from Fund.js
var Fund = require('./Fund.js');
// import the contributor class from contributor.js
var Contributor = require('./Contributor.js');
//import fundOwner from fundOwner.js
var FundOwner = require('./FundOwner.js');
// value to hold name of Fund to edit
var fundID;
// value to hold name of contributor to edit 
var contributorID;
var FundForm = require('./FundForm.js');

/**
 * Gets the fund with the exact entered name.
 * Possible future modifications: 
 *  	- search all bodies of all funds for anything that matches 
 * 		- have option for "advanced" search (specific fields, etc.)
 * author @vagorsol 
 */
// search: check all bodies of all funds if contains, then return all w "funds with '[entry]' in them"
app.use('/view', (req, res)=> {
	var filter = req.body.name;
	console.log(filter);
	Fund.findOne({name: filter}).then((fund, err) => {
		res.type('html').status(200);
		//console.log(fund);
		if (err) {
			console.log('Error: ' + err);
			res.write(err);
		} else if (!filter || fund == null) {
			res.write('No fund with that ID exists!');
			res.write(" <a href=\"/request\">[Back to Search]</a>");
		} else {
			res.write('Name: ' + fund.name + "; Goal: " + fund.goal + "; Progress: " + fund.progress);
			res.write(" <a href=\"/edit?name=" + fund.name + "\">[Edit]</a>");
		}
		res.write("<p> <a href=\"/\">[Return Home]</a>");
		res.end();
	});
});

/**
 * used to create a new form so that when people ask to be a fund owner they 
 * can be accepted or denied
 * author @aburgess
 */
app.use('/newFundForm', (req,res)=>{
	// construct the Person from the form data which is in the request body
	var newFundForm = new FundForm ({
		name: req.query.name,
		user: req.query.user,
		});
	
		// save the person to the database
		newFundForm.save( (err) => { 
			if (err) {
				console.log(err);
				res.json({ "status" : "error" });
			}
			else {
				// display the "successfull created" message
				res.json({ "status" : "success" });
			}
		} ); 
	}
	);

/**
 * This is where the admin can go to check through funds
 * and accept or delete forms
 * author @aburgess
 */
app.use('/allFundForms', (req, res) => {
	// find all the Fund objects in the database
	FundForm.find( {}, (err, fundForms) => {
		if (err) {
		    res.type('html').status(200);
		    console.log('uh oh' + err);
		    res.write(err);
		}
		else {
		    if (fundForms.length == 0) {
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
			fundForms.forEach( (fund) => {
			    res.write('<li>');
			    res.write('Name: ' + fundForms.name + '; user: ' + fundForms.user);
			    // this creates a link to the /delete endpoint
			    res.write(" <a href=\"/addFundOwner?owner=" + fundForms.user +"&fund=" + fundForms.name + "\">[addFundOwner]</a>");
				res.write(" <a href=\"/delete?name=" + fundForms.name + "\">[delete]</a>");
			    res.write('</li>');
					 
			});
			res.write('</ul>');
			res.end();
		    }
		}
	    }).sort({ 'user': 'asc' }); // this sorts them BEFORE rendering the results
});
/*
this adds the fund to the fund owner collection
*/
app.use('/addFundOwner', (req, res) => {
	var newFundOwner = new FundOwner ({
		owner: req.query.owner,
		fund: req.query.fund,
		});
	
		// save the person to the database
		newFundOwner.save( (err) => { 
			if (err) {
				console.log(err);
				res.json({ "status" : "error" });
			}
			else {
				// display the "successfull created" message
				res.json({ "status" : "success" });
			}
		} );
	
});

//this deletes the fund form if the person is not accepted.
app.use('/delete', (req, res) => {
    var filter = {'name' : req.query.name};
	Fund.findOneAndDelete( filter, (err, fund) =>{
		if(err) {
			console.log({'status':err});
		}
		else if(!fund){
			console.log({'status': 'no person'});
		}
		else{
			console.log({'status':'success'});
		}
	});
    res.redirect('/all');
});

	// endpoint for showing all the people
	app.use('/allFundOwners', (req, res) => {
    
		// find all the Fund objects in the database
		FundOwner.find( {}, (err, fundowners) => {
			if (err) {
				res.type('html').status(200);
				console.log('uh oh' + err);
				res.write(err);
			}
			else {
				if (fundowners.length == 0) {
				res.type('html').status(200);
				res.write('There are no funds');
				res.end();
				return;
				}
				else {
				res.type('html').status(200);
				res.write('Here are the fundOwners in the database:');
				res.write('<ul>');
				// show all the people
				fundowners.forEach( (fundOwner) => {
					res.write('<li>');
					res.write('Owner: ' + fundOwner.owner + '; fund: ' + fundOwner.fund);
					res.write('</li>');
						 
				});
				res.write('</ul>');
				res.end();
				}
			}
			}).sort({ 'user': 'asc' }); // this sorts them BEFORE rendering the results
	});

/**
 * Modifies a Fund given its name. It gets values from form data and
 * updates and place back in database. Once done, it sends the contributor back to the 
 * view page
 * author @vagorsol
*/
app.use('/modify', (req, res)=> {
	var filter = fundID;  // Bandaid solution for not being able to pass query
	console.log("Filter: " + filter);
	// res.redirect('/public/editfund.html');
	Fund.findOne({name: filter}).then((fund, err) =>{
		// console.log("Fund: " + fund);
		if (err) {
			res.send('Unexpected Error!');
		} else if (!fund || fund == null) {
			console.log(fund);
			// send message that there is no such fund
			res.type('html').status(200);

			res.write('No such fund exists!');
			res.write(" <a href=\"/allFunds\">[View All Funds]</a>");
			res.write(" <a href=\"/request\">[Search for a Fund]</a>");
			res.write("<p> <a href=\"/\">[Return Home]</a>");
		} else {
			// if the submitted body isn't empty, update the value
			if (req.body.goal){
				fund.goal = req.body.goal;
				Fund.findByIdAndUpdate({_id: fund.id}, {goal: fund.goal}).then((err, doc) => {
					if(err){
						res.write('Unexpected Error!');
					} else{
						console.log("Updated Goal! " + fund.goal);
						res.write("<p>Updated + " + fund.name + "'s Goal: " + fund.goal + "!");
					}
				});
			}
			if (req.body.progress){
				fund.progress = req.body.progress; 
				Fund.findByIdAndUpdate({_id: fund.id}, {progress: fund.progress}).then((err, doc) => {
					if(err){
						res.write('Unexpected Error!');
					} else{
						console.log("Updated Goal! " + fund.goal);
						res.write("<p>Updated + " + fund.name + "'s Progress: " + fund.progress + "!");
					}
				});
			}

			res.type('html').status(200);
			res.write('<p>Changes successfully made to ' + fund.name + '!');
			res.write("<p> <a href=\"/allFunds\">[View All Funds]</a>");
			res.write(" <a href=\"/request\">[Search for a Fund]</a>");
			res.write("<p> <a href=\"/\">[Return Home]</a>");
		}
		res.end();
	});

});

/**
 * Modifies a Contributor given its contributorname. It gets values from form data and
 * updates and place back in database. Once done, it sends the contributor back to the 
 * view page
 * author @jshand18
*/
app.use('/modifycontributor', (req, res)=>{
	var filter = contributorID;  // Bandaid solution for not being able to pass query
	console.log("contributor ID (to edit): " + filter);
	contributor.findOne({contributorname: filter}).then((contributor, err) =>{
		if (err) {
			res.send('Unexpected Error!');
		} else if (!contributor || contributor == null) {
			console.log(contributor);
			// send message that there is no such fund
			res.type('html').status(200);

			res.write('No such contributor exists!');
			res.write(" <a href=\"/allFunds\">[View All Funds]</a>");
			res.write(" <a href=\"/request\">[Search for a Fund]</a>");
			res.write("<p> <a href=\"/\">[Return Home]</a>");
			res.end();
		} else {
			// if the submitted body isn't empty, update the value
			if (req.body.name){
				contributor.name = req.body.name;
				contributor.findByIdAndUpdate({_id: contributor.id}, {name: contributor.name}).then((err) => {
					if(err){
						res.write('Unexpected Error!');
					} else{
						console.log("Updated Name! " + contributor.name);
						res.write("<p>Updated + " + contributor.contributorname + "'s Name: " + contributor.name + "!");
					}
				});
			}
			if (req.body.password){
				contributor.password = req.body.password; 
				contributor.findByIdAndUpdate({_id: contributor.id}, {password: contributor.progress}).then((err) => {
					if(err){
						res.write('Unexpected Error!');
					} else{
						console.log("Updated Password! " + contributor.password);
						res.write("<p>Updated + " + contributor.contributorname + "'s Password: " + contributor.password + "!");
					}
				});
			}

			res.type('html').status(200);
			res.write('<p>Changes successfully made to ' + contributor.contributorname + '!');
			res.write("<p> <a href=\"/allcontributors\">[View All contributors]</a>");
			res.write(" <a href=\"/request\">[Search for a Fund]</a>");
			res.write("<p> <a href=\"/\">[Return Home]</a>");
			res.end();
		}
	});

});


/**
 * Creates a new contributor
*/ 
app.use('/add', (req, res) => {
	// construct the Person from the form data which is in the request body
	var newFund = new Fund ({
		name: req.body.name,
		description: req.body.desscription,
		goal: req.body.goal,
		progress: 0,
		owners: [],
		contributor_log: [],
		location: req.body.location,
		creationDate: new Date()
	    });
	console.log("fund created");
	// save the person to the database
	newFund.save().then( (err) => { 
		res.type('html').status(200);
		if (!err) {
		    res.write('uh oh: ' + err);
		    console.log(err);
		}
		else {
		    // display the "successfull created" message
		    res.write('Successfully added ' + newFund.name + ' to the database');
			res.write(" <a href=\"/create\">[Add Another Fund]</a>");
			res.write(" <a href=\"/request\">[Search for a Fund]</a>");
		}
		res.write("<p> <a href=\"/\">[Return Home]</a>");
		res.end(); 
	    } ); 
    }
    );

// endpoint for showing all the Funds
app.use('/allFunds', (req, res) => {
    
	// find all the Person objects in the database
	Fund.find().then((funds, err) => {
		if (err) {
		    res.type('html').status(200);
		    console.log('uh oh' + err);
		    res.send(err);
		}
		else {
			console.log(funds);
		    if (!funds || funds == null || funds.length == 0) {
			res.type('html').status(200);
			res.write('There are no funds');
			res.write("<p> <a href=\"/\">Return Home </a>");
			res.end();
			return;
		    }
		    else {
			res.type('html').status(200);
			res.write('Here are the Funds in the database:');
			res.write('<ul>');
			// show all the people
			funds.sort(); // this sorts them BEFORE rendering the results
			funds.forEach( (fund) => {
			    res.write('<li>');
			    res.write('Name: ' + fund.name + '; Goal: ' + fund.goal + '; Progress: ' + fund.progress);
			    res.write(" <a href=\"/edit?name=" + fund.name + "\">[Edit]</a>");
				res.write(" <a href=\"/deleteFund?name=" + fund.name + "\">[Delete]</a>");
			    res.write('</li>');
					 
			});
			res.write('</ul>');
			res.write("<p> <a href=\"/\">[Return Home]</a>");
			res.end();
		    }
		}
	    }) 
});

// endpoint for deleting a fund
app.use('/deleteFund', (req, res) => {
	var filter = req.query.name;
	Fund.deleteOne({name: filter}).then((err) => {
		if(err){
			res.write('Unexpected Error!');
		} 
	});
	res.redirect('/allFunds');
});

// endpoint for showing all the Contributors
app.use('/allcontributors', (req, res) => {
    
	// find all the Person objects in the database
	contributor.find().then((contributors, err) => {
		if (err) {
		    res.type('html').status(200);
		    console.log('uh oh' + err);
		    res.send(err);
		}
		else {
		    if (!contributors || contributors == null || contributors.length == 0) {
			res.type('html').status(200);
			res.write('There are no contributors');
			res.write("<p> <a href=\"/\">Return Home </a>");
			res.end();
			return;
		    }
		    else {
			res.type('html').status(200);
			res.write('Here are the people in the database:');
			res.write('<ul>');
			// show all the people
			contributors.sort(); // this sorts them BEFORE rendering the results
			contributors.forEach( (contributor) => {
			    res.write('<li>');
			    res.write('Name: ' + contributor.name + '; contributorname: ' + contributor.contributorname);
			    // this creates a link to the /delete endpoint
				console.log("contributorname: " + contributor.contributorname);
			    res.write(" <a href=\"/editcontributor?contributorname=" + contributor.contributorname + "\">[Edit]</a>");
				res.write(" <a href=\"/deletecontributor?contributorname=" + contributor.contributorname + "\">[Delete]</a>");
			    res.write('</li>');
					 
			});
			res.write('</ul>');
			res.write("<p> <a href=\"/\">[Return Home]</a>");
			res.end();
		    }
		}
	    }) 
});

// endpoint for deleting a contributor
app.use('/deletecontributor', (req, res) => {
	var filter = req.query.contributorname;
	contributor.deleteOne({contributorname: filter}).then((err) => {
		if(err){
			res.write('Unexpected Error!');
		} 
	});
	res.redirect('/allcontributors');
});

app.use('/createFund', (req, res) => {
	// construct the Fund from the form data which is in the request body
	var newFund = new Fund ({
		name: req.query.name,
		user: req.query.user,
	    });

	// save the fund to the database
	newFund.save( (err) => { 
		if (err) {
		    res.type('html').status(200);
		    res.write('uh oh: ' + err);
		    console.log(err);
		    res.end();
		}
		else {
		    // display the "successfull created" message
		    res.send('successfully added ' + newFund.name + ' to the database');
		}
	    } ); 
    }
    );

// endpoint for adding a new Contributor
app.use('/newcontributor', (req, res) => {
	// construct the Person from the form data which is in the request body
	var newcontributor = new contributor({
		contributorname: req.body.contributorname,
		password: req.body.password,
		name: req.body.name,
	    });
	console.log("contributor created");
	// save the person to the database
	newcontributor.save().then( (err) => { 
		res.type('html').status(200);
		if (!err) {
		    res.write('uh oh: ' + err);
		    console.log(err);
		}
		else {
		    // display the "successfull created" message
		    res.write('Successfully added ' + newcontributor.name + ' to the database');
			res.write(" <a href=\"/create\">[Add Fund]</a>");
			res.write(" <a href=\"/request\">[Search for a Fund]</a>");
		}
		res.write("<p> <a href=\"/\">Return Home </a>");
		res.end(); 
	    } ); 
    }


);

/***************************************/
// This is the '/test' endpoint that you can use to check that this works
app.use('/test', (req, res) => {
	// create a JSON object
	var data = { 'message' : 'It works!' };
      	// send it back
	res.json(data);
    });

// This starts the web server on port 3000. 
app.listen(3000, () => {
	console.log('Listening on port 3000');
    });

app.use('/public', express.static('public'));

/***************************************/
// Directory for linking through html files
app.get('/', (req, res)=> { res.redirect('/public/index.html'); } );
app.get('/request', (req, res) => { res.redirect('/public/viewFund.html'); } );
app.get('/create', (req, res) => {res.redirect('/public/addFund.html'); } );
app.get('/edit', (req, res) => {
	fundID = req.query.name; 
	console.log("Fund ID (to Edit): " + fundID);
	res.redirect('/public/editFund.html'); })
app.get('/editcontributor', (req, res) => {
	contributorID = req.query.contributorname;
	res.redirect('/public/editcontributor.html'); })
app.get('/createcontributor', (req, res) => {res.redirect('/public/newcontributor.html'); })