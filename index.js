// set up Express
var express = require('express');
var app = express();

// set up BodyParser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

/* Connecting to MongoDB Atlas
*/
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
var User = require('./User.js');

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

// TODO: edit not working? also send to screen that's like "changes submited!" [redirect to search] [??]
/**
 * Modifies a Fund given its name. It gets values from form data and
 * updates and place back in database. Once done, it sends the user back to the 
 * view page
 * author @vagorsol
*/
app.use('/modify', (req, res)=> {
	var filter = req.body.name;  // Bandaid solution for not being able to pass query
	console.log(filter);
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
			res.end();
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
			//Fund.findOneAndUpdate(filter, {goal: fund.goal, progress: fund.progress});

			//console.log(fund);
			res.type('html').status(200);
			res.write('<p>Changes successfully made to ' + fund.name + '!');
			res.write("<p> <a href=\"/allFunds\">[View All Funds]</a>");
			res.write(" <a href=\"/request\">[Search for a Fund]</a>");
			res.write("<p> <a href=\"/\">[Return Home]</a>");
			res.end();
			
		}
	});

});

app.use('/modifyUser', (req, res)=>{
	var filter = req.body.username;  // Bandaid solution for not being able to pass query
	console.log(filter);
	User.findOne({username: filter}).then((user, err) =>{
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
			res.end();
		} else {
			// if the submitted body isn't empty, update the value
			if (req.body.name){
				user.name = req.body.name;
				User.findByIdAndUpdate({_id: user.id}, {name: user.name}).then((err) => {
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
				User.findByIdAndUpdate({_id: user.id}, {password: user.progress}).then((err) => {
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
			res.end();
		}
	});

});

// temporary create function so i can test things
// endpoint for creating a new person
// this is the action of the "create new person" form
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
			    // this creates a link to the /delete endpoint
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
	User.find().then((users, err) => {
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

app.use('/deleteUser', (req, res) => {
	var filter = req.query.username;
	User.deleteOne({username: filter}).then((err) => {
		if(err){
			res.write('Unexpected Error!');
		} 
	});
	res.redirect('/allUsers');
});

// endpoint for adding a new Contributor
app.use('/newUser', (req, res) => {
	// construct the Person from the form data which is in the request body
	var newUser = new User({
		username: req.body.username,
		password: req.body.password,
		name: req.body.name,
	    });
	console.log("user created");
	// save the person to the database
	newUser.save().then( (err) => { 
		res.type('html').status(200);
		if (!err) {
		    res.write('uh oh: ' + err);
		    console.log(err);
		}
		else {
		    // display the "successfull created" message
		    res.write('Successfully added ' + newUser.name + ' to the database');
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

// Directory for linking through html files
app.get('/', (req, res)=> { res.redirect('/public/index.html'); } );
app.get('/request', (req, res) => { res.redirect('/public/viewFund.html'); } );
app.get('/create', (req, res) => {res.redirect('/public/addFund.html'); } ); // rough "add fund" function for testing
app.get('/edit', (req, res) => {res.redirect('/public/editFund.html'); })
app.get('/editUser', (req, res) => {res.redirect('/public/editUser.html'); })
app.get('/createUser', (req, res) => {res.redirect('/public/newUser.html'); })