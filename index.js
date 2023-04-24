// set up Express
var express = require('express');
var app = express();

// set up BodyParser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// Set up Session for state persitance
var session = require('express-session');
app.use(session({
	secret: 'SoftTeamIsCoool',
	resave: false,
	saveUninitialized: true,
	cookie: {maxAge : 60 * 60 * 1000} // 1 Hour refresh rate for signing in

}));

// Set up Passport for authentication
var passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());
var connectEnsureLogin = require('connect-ensure-login');

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

// import classes
var Fund = require('./Fund.js');
// import the Contributor class from Contributor.js
var Contributor = require('./Contributor.js');
// Import the owner class from owner.js
var Owner = require('./Owner.js');
var FundForm = require("./FundForm.js");
var FundOwner = require("./FundOwner.js");

// value to hold name of Fund to edit
var fundID;
// value to hold name of Contributor to edit 
var ContributorID;
// value to hold name of Owner to edit 
var OwnerID;

passport.use(Contributor.createStrategy());
passport.serializeUser(Contributor.serializeUser());
passport.deserializeUser(Contributor.deserializeUser());

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
		if(req.user) {res.write("<p> <a href=\"/logout\">[Log Out]</a>");}
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
			//res.type('html').status(200);
			//res.write('There are no funds');
			res.redirect('/public/index.html');
			//res.end();
			return;
		    }
		    else {
			res.type('html').status(200);
			res.write('Here are the funds in the database:');
			res.write('<ul>');
			// show all the people
			fundForms.forEach( (fund) => {
			    res.write('<li>');
			    res.write('Name: ' + fund.name + '; user: ' + fund.user);
			    // this creates a link to the /delete endpoint
			    res.write(" <a href=\"/addFundOwner?owner=" + fund.user +"&fund=" + fund.name + "\">[addFundOwner]</a>");
				res.write(" <a href=\"/delete?name=" + fund.name + "\">[delete]</a>");
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
 * Modifies a Fund given its name. It gets values from form data and
 * updates and place back in database. Once done, it sends the Contributor back to the 
 * view page
 * author @vagorsol
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
				console.log(newFundOwner.owner);
				res.redirect('/delete?name=' + newFundOwner.fund);
			}
		} );
	
});
//this deletes the fund form if the person is not accepted.
app.use('/delete', (req, res) => {
    var filter = {'name' : req.query.name};
	FundForm.findOneAndDelete( filter, (err, fundForm) =>{
		if(err) {
			console.log({'status':err});
		}
		else if(!fundForm){
			console.log({'status': 'no person'});
		}
		else{
			console.log({'status':'success'});
		}
	});
    res.redirect('/allFundForms');
});
// endpoint for showing all the people
app.use('/allFundOwners', (req, res) => {
    
	// find all the Fund objects in the database
	FundOwner.find( {}, (err, fundowners) => {
		if (err) {
			res.type('html').status(200);
			console.log('uh oh' + err);
			res.write(err);
		} else {
			if (fundowners.length == 0) {
			res.type('html').status(200);
			res.write('There are no funds');
			res.end();
			return;
			} else {
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
// modifies fund given its name
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
 * Modifies a Contributor given its Contributorname. It gets values from form data and
 * updates and place back in database. Once done, it sends the Contributor back to the 
 * view page
 * author @jshand18
*/
app.use('/modifyUser', (req, res)=>{
	var filter = userID;  // Bandaid solution for not being able to pass query
	console.log("User ID (to edit): " + filter);
	Contributor.findOne({username: filter}).then((user, err) =>{
		if (err) {
			res.send('Unexpected Error!');
		} else if (!user || user == null) {
			console.log(user);
			// send message that there is no such fund
			res.type('html').status(200);

			res.write('No such user exists!');
			res.write(" <a href=\"/allFunds\">[View All Funds]</a>");
			res.write(" <a href=\"/request\">[Search for a Fund]</a>");
			res.write("<p> <a href=\"/\">[Return Home]</a>");
			if(isLoggedIn) {res.write("<p> <a href=\"/logout\">[Log Out]</a>");}
			res.end();
		} else {
			// if the submitted body isn't empty, update the value
			if (req.body.name){
				user.name = req.body.name;
				Contributor.findByIdAndUpdate({_id: user.id}, {name: user.name}).then((err) => {
					if(err){
						res.write('Unexpected Error!');
					} else{
						console.log("Updated Name! " + user.name);
						res.write("<p>Updated + " + user.username + "'s Name: " + user.name + "!");
					}
				});
			}
			if (req.body.password){
				user.password = req.body.password; 
				Contributor.findByIdAndUpdate({_id: user.id}, {password: user.progress}).then((err) => {
					if(err){
						res.write('Unexpected Error!');
					} else{
						console.log("Updated Password! " + user.password);
						res.write("<p>Updated + " + user.username + "'s Password: " + user.password + "!");
					}
				});
			}

			res.type('html').status(200);
			res.write('<p>Changes successfully made to ' + user.username + '!');
			res.write("<p> <a href=\"/allUsers\">[View All Users]</a>");
			res.write(" <a href=\"/request\">[Search for a Fund]</a>");
			res.write("<p> <a href=\"/\">[Return Home]</a>");
			if(isLoggedIn) {res.write("<p> <a href=\"/logout\">[Log Out]</a>");}
			res.end();
		}
	});

});
// creates a new Fund
app.use('/add', (req, res) => {
	// construct the Fund from the form data which is in the request body
	var newFund = new Fund ({
		name: req.body.name,
		description: req.body.desscription,
		goal: req.body.goal,
		progress: 0,
		completion: 0,
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
		if(isLoggedIn) {res.write("<p> <a href=\"/logout\">[Log Out]</a>");}
		res.end(); 
	    } ); 
    }
    );
// endpoint for adding a new Contributor
app.use('/newUser', (req, res) => {
	// construct the Person from the form data which is in the request body
	var newUser = new Contributor({
		username: req.body.username,
		password: req.body.password,
		name: req.body.name,
		contribution_log: [],
	    });

	// validate that the username has not been taken yet
	Contributor.findOne({username: newUser.username}).then((user, err) => {
		res.type('html').status(200);
		if (err) {
			console.log('Error: ' + err);
			res.write(err);
		} else if (user == null) {
			//save the person to the database
			Contributor.register({username : newUser.username, password : newUser.password, name: newUser.name, contribution_log: newUser.contribution_log, active : false}, newUser.password);
			// display the "successfull created" message
			res.type('html').status(200);
			res.write('Successfully added ' + newUser.name + ' to the database');
			res.write(" <a href=\"/create\">[Add Fund]</a>");
			res.write(" <a href=\"/request\">[Search for a Fund]</a>");
			res.write("<p> <a href=\"/\">Return Home </a>");
			res.end(); 
		} 
		else {
			res.redirect("/public/registerOnFailure.html");
		}
	});
});
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
			res.write("<p> <a href=\"/logout\">[Log Out]</a>");
			res.end();
		    }
		}
	    }) 
});
// endpoint for sorting funds by progress
// @author bho
app.use('/allprogress', (req, res) => { // PLEASE CHECK IF IT NEEDS MODIFICATIONS
    
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
				res.write('Name: ' + fund.name + '; Goal: ' + fund.goal + '; Progress: ' + fund.progress +
				'; Completion: ' + fund.completion + '% ; Owners: ' + fund.ownerName);
			    res.write(" <a href=\"/delete?name=" + person.name + "\">[Delete]</a>");
			    res.write('</li>');
					 
			});
			res.write('</ul>');
			res.end();
		    }
		}
	}).sort(function (x, y) { 
		return x.completion - y.completion; // completion = fund.progress / (fund.goal * 1.0) * 100
	});
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
app.use('/allUsers', (req, res) => {
    
	// find all the Person objects in the database
	Contributor.find().then((users, err) => {
		if (err) {
		    res.type('html').status(200);
		    console.log('uh oh' + err);
		    res.send(err);
		}
		else {
		    if (!users || users == null || users.length == 0) {
			res.type('html').status(200);
			res.write('There are no users');
			res.write("<p> <a href=\"/\">Return Home </a>");
			res.end();
			return;
		    }
		    else {
			res.type('html').status(200);
			res.write('Here are the people in the database:');
			res.write('<ul>');
			// show all the people
			users.sort(); // this sorts them BEFORE rendering the results
			users.forEach( (user) => {
			    res.write('<li>');
			    res.write('Name: ' + user.name + '; Username: ' + user.username);
			    // this creates a link to the /delete endpoint
				console.log("username: " + user.username);
			    res.write(" <a href=\"/editUser?username=" + user.username + "\">[Edit]</a>");
				res.write(" <a href=\"/deleteUser?username=" + user.username + "\">[Delete]</a>");
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
// endpoint for deleting a user
app.use('/deleteUser', (req, res) => {
	var filter = req.query.username;
	Contributor.deleteOne({username: filter}).then((err) => {
		if(err){
			res.write('Unexpected Error!');
		} 
	});
	res.redirect('/allUsers');
});
// endpoint for contributing money to a fund
app.use('/addToFund', (req, res) => {
	var fundname = {'name' : req.query.fund};
	var donationAmt = req.query.donation;
	var username = {'username' : req.query.username}; // {'username' : req.user.username}; // todo: check if "req.user.username" is right here
	var fundID;
	// update fund
	Fund.findOne(fundname).then((fund, err) => {
		if (err) {
			res.send('Unexpected Error!');
		} else if (!fund || fund == null) {
			// send message that there is no such fund
			res.type('html').status(200);

			res.send('No such fund exists!');
		} else {
			fundID = fund.id;
			// update fund progress
			console.log(fund.id);
			fund.progress =  parseInt(fund.progress) + parseInt(donationAmt);
			fund.completion = parseInt(fund.progress) / parseInt(fund.goal);

			// if there is no contribution log, create one. otherwise, update
			if (!fund.contribution_log || fund.contribution_log == null) {
				fund.contribution_log = [{
					contributor_id: username,
					contribution: donationAmt,
					date: new Date()
				}];
			} else {
				fund.contribution_log.push({
					contributor_id: username,
					contribution: donationAmt,
					date: new Date()
				});
			}
			
			// Update progress
			Fund.findByIdAndUpdate({_id: fund.id}, {progress: fund.progress}).then((err, doc) => {
				if(err){
					res.write('Unexpected Error!');
				} else{
					res.write('Updated Fund Progress!');
					console.log("Updated Fund Progress! " + fund.progress);
				}
			});

			// update contribution
			Fund.findByIdAndUpdate({_id: fund.id}, {contribution_log: fund.contribution_log}).then((err, doc) => {
				if(err){
					res.write('Unexpected Error!');
				} else{
					res.write('Updated Fund Contribution Log!');
					console.log("Updated Fund Contribution Log! " + fund.contribution_log);
				}
			});
		}
	})

	// update user
	Contributor.findOne(username).then((contributor, err) => {
		if (err) {
			res.send('Unexpected Error!');
		} else if (!contributor || contributor == null) {
			// send message that there is no such fund
			res.type('html').status(200);

			res.send('No such contributor exists!');
			console.log(username);
		} else {
			// if there is no contribution log, create one. otherwise, update
			if (!contributor.contribution_log || contributor.contribution_log == null) {
				contributor.contribution_log = [{
					fundId: fundID,
					fudnName : fundname,
					contribution: donationAmt,
					date: new Date()
				}];
			} else {
				contributor.contribution_log.push({
					fundId: fundID,
					fundName: fundname,
					contribution: donationAmt,
					date: new Date()
				});
			}
			// console.log("User History Log: " + contributor.contribution_log);

			// update progress
			Contributor.findByIdAndUpdate({_id: contributor.id}, {contribution_log: contributor.contribution_log}).then((err, doc) => {
				if(err){
					res.write('Unexpected Error!');
				} else{
					res.write("Updated Contributor's Contribution Log!");
					console.log("Updated Contributor's Contribution Log! " + contributor.contribution_log);
				}
			});

		}
		res.type('html').status(200);
		res.write("<p> <a href=\"/\">[Return Home]</a>");
		res.end();
	})
})
// endpoint for deleting a user
app.use('/deleteUser', (req, res) => {
	var filter = req.query.username;
	Contributor.deleteOne({username: filter}).then((err) => {
		if(err){
			res.write('Unexpected Error!');
		} 
	});
	res.redirect('/allUsers');
});
// endpoint for accessing contribution history
app.use('/contributionHistory', (req, res) => {
	var username = {'username' : req.query.username} // {'username' : req.user.username};
	contributionHistory = [];

	Contributor.findOne(username).then((contributor, err) => {
		var contributionHistory = []
		if (err) {
			console.log(err);
			res.json([]);
		} else if (!contributor || contributor == null) {
			// send empty json
			res.json([]);
		} else {
			// if there is no contribution log, create one. otherwise, update
			if (!contributor.contribution_log || contributor.contribution_log == null) {
				// send empty json
				res.json([])
			} else {
				contributor.contribution_log.forEach((i) => {
					if (i.fundId) {
						contributionHistory.unshift({
							"fundId" : i.fundId,
							"contribution" : i.contribution,
							"date" : i.date
						})
					}
				});
				res.send(contributionHistory);
			}	
		}
	})	
});

// return username function
app.use('/getUsername', (req, res) => {
	if (req.user.username) {
		res.json({'username' : req.user.username});
	} else {
		res.json([]);
	}
});

app.use('/viewUser', (req, res) => {
	// res.write("<p> <a href=\"/modifyUser\">[Modify user information]</a>");????
	res.write("<p> <a href=\"/addNote\">[Add a note]</a>");
	res.write("<p> <a href=\"/create\">[Add Fund]</a>");
	res.write("<p> <a href=\"/allFunds\">[View All Funds]</a>");
	res.write(" <a href=\"/request\">[Search for a Fund]</a>");
	res.write("<p> <a href=\"/\">Return Home </a>");
	res.end(); 

});

// add note
app.use('/addNote', (req, res) => {
	// create a JSON object
	var user = {'username': req.query.username};
	var note = {'note': req.query.note};

	var filter = fundID;  // Bandaid solution for not being able to pass query
	console.log("Filter: " + filter);
	// res.redirect('/public/editfund.html');
	Fund.findOne({'username': filter}).then((fund, err) =>{
		// console.log("Fund: " + fund);
		if (err) {
			res.send('Unexpected Error!');
		} else if (!fund || fund == null) {
			console.log(fund);
			// send message that there is no such fund
			res.type('html').status(200);

			res.write('No such username exists!');

			res.write("<p> <a href=\"/viewUser\">[Back to Profile]</a>");
			res.write("<p> <a href=\"/\">[Return Home]</a>");
		} else {
			// if the submitted body isn't empty, update the value
			if (req.body.note){
				user.note = req.body.note;
				user.findByIdAndUpdate({_id: user.id}, {note: user.goal}).then((err, doc) => {
					if(err){
						res.write('Unexpected Error!');
					} else{
						console.log("Updated note! " + user.note);
						res.write("<p>Updated + " + user.name + "'s note!");
					}
				});
			}

			res.type('html').status(200);
			res.write('<p>Changes successfully made to ' + user.name + '!');
			res.write(" <a href=\"/viewUser\">[Back to Profile]</a>");
			res.write("<p> <a href=\"/\">[Return Home]</a>");
		}
		res.end();
	})
	
	// send it back
	res.json(data);
    });
// endpoint for clearing history
app.use('/clearHistory', (req, res) => {

});
/***************************************/
// This is the '/test' endpoint that you can use to check that this works
app.use('/test', (req, res) => {
	// create a JSON object
	var data = { 'message' : 'It works!' };
      	// send it back
	res.json(data);
    });
// Testing for login in functionaility
app.post('/login', passport.authenticate('local', {successRedirect: '/profile', failureRedirect: '/createUser' }),  function(req, res) {
	console.log("LOGIN" + req.user);
	res.redirect('/secret');
});

app.get('/logout', (req, res) => {
	req.session.destroy((err) => {
		res.redirect('/'); 
	  });
});

app.get('/profile', connectEnsureLogin.ensureLoggedIn(), (req,res) =>{
	res.type('html').status(200);
	res.write("Hello " + req.user.name);
	res.write("<p> <a href=\"/\">[Return Home]</a>");
	res.write("<p> <a href=\"/secret\">[Suprise Me]</a>");
	res.write("<p> <a href=\"/logout\">[Log Out]</a>");
	res.end();
});
app.get('/secret', connectEnsureLogin.ensureLoggedIn(), (req,res) => {
	res.redirect('/public/secret.html');
});

/** Andriod Backend Routes */
// Handling logging in from the MainView
app.get('/loginAndroid', passport.authenticate('local', {
	successRedirect: '/loginAndroidSuccess', 
	failureRedirect: '/loginAndroidFailure' 
}))
// Sends a message regarding the login success
app.get('/loginAndroidSuccess', (req, res) =>{
	res.json({"status" : "success"});
})
// Sends a message regarding the login success
app.get('/loginAndroidFailure', (req, res) =>{
	res.json({"status" : "failure"});
})
// Checking the logged in status
app.get('/loginStatus', (req, res) => {
	if(req.user){
		res.json({'status' : 'true'});
	} else{
		res.json({'status' : 'false'});
	}
});
// return username function
app.use('/getUsername', (req, res) => {
	if (req.user) {
		res.json({'username' : req.user.username});
	} else {
		res.json([]);
	}
});
app.get('/newUserAndroid', (req, res) => {
	// construct the Person from the form data which is in the request body
	var newUser = new Contributor({
		username: req.query.username,
		password: req.query.password,
		name: req.query.name,
		contribution_log: [],
	    });

	// validate that the username has not been taken yet
	Contributor.findOne({username: newUser.username}).then((user, err) => {
		if (err) {
			console.log('Error: ' + err);
			res.json({'status' : 'failure'});
		} else if (user == null) {
			//save the person to the database
			Contributor.register({username : newUser.username, password : newUser.password, name: newUser.name, contribution_log: newUser.contribution_log, active : false}, newUser.password);
			// display the "successfull created" message
			res.json({'status' : 'success'});
		} 
		else {
			res.json({'status' : 'failure'});
		}
	});
});

app.get('/newUserAndroidSuccess', (req, res) =>{
	res.json({"status" : "failure"});
})
app.get('/newUserAndroidFailure', (req, res) =>{
	res.json({"status" : "failure"});
})



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
	res.redirect('/public/editUser.html'); })
app.get('/createcontributor', (req, res) => {res.redirect('/public/newcontributor.html'); })
app.get('/editUser', (req, res) => {
	userID = req.query.username;
	res.redirect('/public/editUser.html'); })
app.get('/createUser', (req, res) => {res.redirect('/public/newUser.html'); })
app.get('/login',connectEnsureLogin.ensureLoggedOut('/profile'), (req, res, next) =>{
	res.redirect('/public/login.html');
});



