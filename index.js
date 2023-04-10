// set up Express
var express = require('express');
var app = express();

// set up BodyParser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

var session = require('express-session');
app.use(session({
	secret: 'SoftTeamIsCoool',
	resave: false,
	saveUninitialized: true,
	cookie: {maxAge : 60 * 60 * 1000} //1 Hour

}));


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

// import the Fund class from Fund.js
var Fund = require('./Fund.js');
// import the Contributor class from Contributor.js
var Contributor = require('./Contributor.js');

var Owner = require('./Owner.js');

// value to hold name of Fund to edit
var fundID;
// value to hold name of Contributor to edit 
var ContributorID;
// value to hold name of Owner to edit 
var OwnerID;

passport.use(Contributor.createStrategy());
passport.serializeUser(Contributor.serializeUser());
passport.deserializeUser(Contributor.deserializeUser());

passport.use(Owner.createStrategy)
passport.serializeUser(Owner.serializeUser());
passport.deserializeUser(Owner.deserializeUser());

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
 * Modifies a Fund given its name. It gets values from form data and
 * updates and place back in database. Once done, it sends the Contributor back to the 
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
 * Modifies a Contributor given its Contributorname. It gets values from form data and
 * updates and place back in database. Once done, it sends the Contributor back to the 
 * view page
 * author @jshand18
*/
app.use('/modifyContributor', (req, res)=>{
	var filter = ContributorID;  // Bandaid solution for not being able to pass query
	console.log("Contributor ID (to edit): " + filter);
	Contributor.findOne({Contributorname: filter}).then((Contributor, err) =>{
		if (err) {
			res.send('Unexpected Error!');
		} else if (!Contributor || Contributor == null) {
			console.log(Contributor);
			// send message that there is no such fund
			res.type('html').status(200);

			res.write('No such Contributor exists!');
			res.write(" <a href=\"/allFunds\">[View All Funds]</a>");
			res.write(" <a href=\"/request\">[Search for a Fund]</a>");
			res.write("<p> <a href=\"/\">[Return Home]</a>");
			res.end();
		} else {
			// if the submitted body isn't empty, update the value
			if (req.body.name){
				Contributor.name = req.body.name;
				Contributor.findByIdAndUpdate({_id: Contributor.id}, {name: Contributor.name}).then((err) => {
					if(err){
						res.write('Unexpected Error!');
					} else{
						console.log("Updated Name! " + Contributor.name);
						res.write("<p>Updated + " + Contributor.Contributorname + "'s Name: " + Contributor.name + "!");
					}
				});
			}
			if (req.body.password){
				Contributor.password = req.body.password; 
				Contributor.findByIdAndUpdate({_id: Contributor.id}, {password: Contributor.progress}).then((err) => {
					if(err){
						res.write('Unexpected Error!');
					} else{
						console.log("Updated Password! " + Contributor.password);
						res.write("<p>Updated + " + Contributor.Contributorname + "'s Password: " + Contributor.password + "!");
					}
				});
			}

			res.type('html').status(200);
			res.write('<p>Changes successfully made to ' + Contributor.Contributorname + '!');
			res.write("<p> <a href=\"/allContributors\">[View All Contributors]</a>");
			res.write(" <a href=\"/request\">[Search for a Fund]</a>");
			res.write("<p> <a href=\"/\">[Return Home]</a>");
			res.end();
		}
	});

});

/*
	Creating new Fund
*/
app.use('/add', (req, res) => {
	// construct the Person from the form data which is in the request body
	var newFund = new Fund ({
		name: req.body.name,
		goal: req.body.goal,
		progress: req.body.progress
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

// endpoint for adding a new Contributor
app.use('/newContributor', (req, res) => {
	// construct the Person from the form data which is in the request body
	var newContributor = new newContributor({
		Contributorname: req.body.Contributorname,
		password: req.body.password,
		name: req.body.name,
	    });
	console.log("Contributor created");
	// save the person to the database
	newContributor.save().then( (err) => { 
		res.type('html').status(200);
		if (!err) {
		    res.write('uh oh: ' + err);
		    console.log(err);
		}
		else {
		    // display the "successfull created" message
		    res.write('Successfully added ' + newContributor.name + ' to the database');
			res.write(" <a href=\"/create\">[Add Fund]</a>");
			res.write(" <a href=\"/request\">[Search for a Fund]</a>");
		}
		res.write("<p> <a href=\"/\">Return Home </a>");
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

// endpoint for showing all the Contributors
app.use('/allContributors', (req, res) => {
    
	// find all the Person objects in the database
	Contributor.find().then((Contributors, err) => {
		if (err) {
		    res.type('html').status(200);
		    console.log('uh oh' + err);
		    res.send(err);
		}
		else {
		    if (!Contributors || Contributors == null || Contributors.length == 0) {
			res.type('html').status(200);
			res.write('There are no Contributors');
			res.write("<p> <a href=\"/\">Return Home </a>");
			res.end();
			return;
		    }
		    else {
			res.type('html').status(200);
			res.write('Here are the people in the database:');
			res.write('<ul>');
			// show all the people
			Contributors.sort(); // this sorts them BEFORE rendering the results
			Contributors.forEach( (Contributor) => {
			    res.write('<li>');
			    res.write('Name: ' + Contributor.name + '; Contributorname: ' + Contributor.Contributorname);
			    // this creates a link to the /delete endpoint
				console.log("Contributorname: " + Contributor.Contributorname);
			    res.write(" <a href=\"/editContributor?Contributorname=" + Contributor.Contributorname + "\">[Edit]</a>");
				res.write(" <a href=\"/deleteContributor?Contributorname=" + Contributor.Contributorname + "\">[Delete]</a>");
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


// endpoint for deleting a Contributor
app.use('/deleteContributor', (req, res) => {
	var filter = req.query.Contributorname;
	Contributor.deleteOne({Contributorname: filter}).then((err) => {
		if(err){
			res.write('Unexpected Error!');
		} 
	});
	res.redirect('/allContributors');
});



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
app.get('/editContributor', (req, res) => {
	contributorID = req.query.Contributorname;
	res.redirect('/public/editContributor.html'); })
app.get('/createContributor', (req, res) => {res.redirect('/public/newContributor.html'); })