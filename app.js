var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	mailer = require("nodemailer"),
	crypto = require("crypto"),
	bodyParser = require("body-parser");
var mongoose = require('mongoose');
var session = require("express-session");

var ejs = require("ejs");

app.set('view engine', 'ejs');

var uriString = process.env.MONGOLAB_URI 
					 || process.env.MONGOHQ_URL 
					 || 'mongodb://localhost/test';

mongoose.connect(uriString, function(err, res){
	if(err){
		console.log('ERROR connecting to: ' + uriString + '. ' + err);
	}
	else{
		console.log('Succeeded connected to: ' + uriString);
	}
};


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback(){

});

//Setup the server to listen on port 80 (Web traffic port), allow it to parse POSTED body data, and let it render EJS pages 
server.listen(process.env.PORT || 80);
app.use(bodyParser());

app.use(express.static(__dirname));

app.use(session({secret: 'monkey wizard'}));

//{  SCHEMA STUFF
var Schema = mongoose.Schema;

//a category may be, for example, engineering or performance
//a sub-interest may be electrical engineering or guitar

var interestSchema = new Schema({
	name: String,
	nickname: String,
	noSpace: String,
	relatedInterests: [String],
});

var postSchema = new Schema({
	poster: String,
	content: String,
	title: String,
	timeString: String,
	timePosted: Date,
	replyAddress: String,
	tags: [String], //interest 
	fullfilled: Boolean,
	pay: [],
	credit: [],
	commitment: Number,
	years: [String],
	comments: [{name: String, posts:[{poster:String, content:String, timePosted:Date}]}],
});

var userSchema = new Schema({
	name: 
	{
		first: String,
		last: String,
	},
	email: String,
	password: String,
	loginTries: Number,
	interests: [interestSchema],
	blocked: Boolean,
	loginFail: Boolean,
	posts: [postSchema],
	
});

var categorySchema = new Schema({
	name: String,
	
	interests: [interestSchema],
	meta: {
		following: Number,
	}
	
});

var Post = mongoose.model('Post', postSchema);

interestSchema.methods.returnPosts = function(){
Post.find({tags:this.name}, function(err, relevantPosts){
	if(err) return console.error(err);
	console.log(relevantPosts);
});
}

userSchema.virtual('name.full').get(function () {
  return this.name.first + ' ' + this.name.last;
});

var User = mongoose.model('User', userSchema);

var Category = mongoose.model('Category', categorySchema);

var Interest = mongoose.model('Interest', interestSchema);
//}


//Find all categories and store them in a variable
//so they can be freely referenced later without
//having to find them all first
Category.find({},function(err,data){
	app.locals.categories = data;
});

//{ APP.GET(WEBPAGES)
	app.get('/', function(req, res){
		if (req.session.user == null){
			res.render('login', {user:req.session.user});
		}
		else{
			Post.find({},function(err,data){
				res.render('index', {posts:data, user:req.session.user});
			});
		}
	});

	app.get('/register', function(req, res){
		res.render('register',{user:req.session.user});
	});
//}


//{ APP.GET(ACTION)

	app.get('/addInterest', function(req, res){
		if (req.session.user == null){
			res.redirect('/');
		}
		else{
			res.render('addInterest',{user:req.session.user});
		}
	});

	app.get("/interests",function(req,res){
		Interest.find({},function(err,data){
			res.write(JSON.stringify(data) );
			res.end();
		});
	});

	app.get("/checkInterests",function(req,res){
		res.write(JSON.stringify(req.session.user.interests) );
		res.end();
	});

	app.get("/logoff",function(req,res){
		//req.session.user.save();
		User.findOne({email:req.session.user.email, password:req.session.user.password}, function(err, loggedUser){
			if(err) return console.error(err);
			if(loggedUser!=null){
				loggedUser.interests = req.session.user.interests;
				loggedUser.password = req.session.user.password;
				loggedUser.loginTries = req.session.user.loginTries;
				loggedUser.blocked = req.session.user.blocked;
				loggedUser.loginFail = req.session.user.loginFail;
				loggedUser.posts = req.session.user.posts;
				loggedUser.save(function(err, data){   
					//if (err) return res.json(400, err);
					//res.json(201, data);
					req.session.destroy();
					res.redirect('/');
				});
			}
			else{
				console.log("Some sort of error; user not found");
				res.end();
			}
		});
		//req.session.destroy();
		//res.redirect('/');
	});

//}



//{ APP.POST(INFORMATION)

	app.post("/login",function(req,res){

		sentEmail = req.body.email;
		sentPassword = req.body.password;
		
		if (sentEmail == undefined || sentPassword == undefined)
		{
			res.redirect("/");
			return;
		}
		User.findOne({email:sentEmail, password:sentPassword}, function(err, loggedUser){
			if(err) return console.error(err);
			req.session.user = loggedUser;
			if(loggedUser!=null){
				/*
				req.session.reload(function(err) {
				  // will have a new session here
				});
				*/
				res.redirect("/");
			}
			else{
				console.log("Failed login; please try again.");
				res.redirect("/");
				app.get("/loginError", function(req, res){
					res.write('true');
					res.end();
				});
			}
		});

	});

	app.post("/registerUser", function(req, res){
		sentEmail = req.body.email;
		sentPassword = req.body.password;
		sentFirst = req.body.firstName;
		sentLast = req.body.lastName;
		console.log(sentEmail);
		console.log(sentFirst);
		
		User.findOne({email:sentEmail}, function(err, loggedUser){
			if(err) return console.error(err);
			if(loggedUser!=null){
				console.log("There is already an account associated with this email. Please login or click 'Forgot password'");
				res.redirect("/register");
			}
			else if (sentEmail == "" || sentPassword == "" || sentFirst == "" || sentLast == "")
			{
				console.log("You have left some fields blank. Please try again.");
			}
			else{
				var newUser = new User({email: sentEmail, password: sentPassword, name:{first:sentFirst, last:sentLast}, blocked: false, loginFail: false, loginTries:0});
				newUser.save();
				console.log("Congratulations! You have created a new user!");
				res.redirect("/");
			}
		});
	});

//}





