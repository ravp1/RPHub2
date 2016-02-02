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
		server.listen(process.env.PORT || 80);
	}
});


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback(){

});

//Setup the server to listen on port 80 (Web traffic port), allow it to parse POSTED body data, and let it render EJS pages 
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





/*

// CREATE DEFAULT CATEGORIES, INETERESTS, POSTS (ALREADY CREATED; NO NEED TO RUN EVERY TIME)
//{ SETUP ENGINEERING CATEGORY
var engineering = new Category({ name: 'Engineering'});

engineering.interests[engineering.interests.length] = new Interest({name:'Aeronautical Engineering', nickname:"aero"});
engineering.interests[engineering.interests.length] = new Interest({name:'Biomedical Engineering', nickname:"bmed"});
engineering.interests[engineering.interests.length] = new Interest({name:'Chemical Engineering', nickname:"chme"});
engineering.interests[engineering.interests.length] = new Interest({name:'Civil Engineering', nickname:"civl"});
engineering.interests[engineering.interests.length] = new Interest({name:'Computer & Systems Engineering', nickname:"cse"});
engineering.interests[engineering.interests.length] = new Interest({name:'Electrical Engineering', nickname:"ee"});
engineering.interests[engineering.interests.length] = new Interest({name:'Environmental Engineering', nickname:"enve"});
engineering.interests[engineering.interests.length] = new Interest({name:'Industrial & Management Engineering', nickname:"isye"});
engineering.interests[engineering.interests.length] = new Interest({name:'Materials Engineering', nickname:"mtle"});
engineering.interests[engineering.interests.length] = new Interest({name:'Mechanical Engineering', nickname:"mech"});
engineering.interests[engineering.interests.length] = new Interest({name:'Nuclear Engineering', nickname:"nuke"});
for (var i =0; i< engineering.interests.length; i++){
	engineering.interests[i].noSpace = engineering.interests[i].name.replace(/ /g, "").replace(/,/g, "").replace(/&/g, "").toLowerCase();
	engineering.interests[i].nickname = engineering.interests[i].nickname.toUpperCase();
	engineering.interests[i].save();
}
console.log(engineering.interests[3]);
engineering.save();
//}

//{ SETUP SCIENCE CATEGORY
var science = new Category({name:'Science'});
science.interests[science.interests.length] = new Interest({name:'Biology', nickname:"biol"});
science.interests[science.interests.length] = new Interest({name:'Biochemistry & Biophysics', nickname:"bcbp",});
science.interests[science.interests.length] = new Interest({name:'Bioinformatics & Molecular Biology', nickname:"bimb"});
science.interests[science.interests.length] = new Interest({name:'Chemistry', nickname:"chem"});
science.interests[science.interests.length] = new Interest({name:'Computer Science', nickname:"csci"});
science.interests[science.interests.length] = new Interest({name:'Environmental Science', nickname:"envs",});
science.interests[science.interests.length] = new Interest({name:'Geology', nickname:"geol"});
science.interests[science.interests.length] = new Interest({name:'Hydrogeology', nickname:"hgeo"});
science.interests[science.interests.length] = new Interest({name:'Mathematics', nickname:"math"});
science.interests[science.interests.length] = new Interest({name:'Physics & Applied Physics', nickname:"phys" });
for (var i =0; i< science.interests.length; i++){
	science.interests[i].noSpace = science.interests[i].name.replace(/ /g, "").replace(/,/g, "").replace(/&/g, "").toLowerCase();
	science.interests[i].nickname = science.interests[i].nickname.toUpperCase();
	science.interests[i].save();
}
science.save();
//}

//{ SETUP MANAGEMENT CATEGORY
var management = new Category({ name: 'Management'});

management.interests[management.interests.length] = new Interest({name:'Business & Management', nickname:"mgmt"});
management.interests[management.interests.length] = new Interest({name:'Financial Engineering', nickname:"fnce"});
for (var i =0; i< management.interests.length; i++){
	management.interests[i].noSpace = management.interests[i].name.replace(/ /g, "").replace(/,/g, "").replace(/&/g, "").toLowerCase();
	management.interests[i].nickname = management.interests[i].nickname.toUpperCase();
	management.interests[i].save();
}

management.save();
//}

//{ SETUP HASS CATEGORY
var hass = new Category({ name: 'Humanities, Arts, & Soc. Sciences'});

hass.interests[hass.interests.length] = new Interest({name:'Cognitive Science', nickname:"cogs"});
hass.interests[hass.interests.length] = new Interest({name:'Communication', nickname:"comm"});
hass.interests[hass.interests.length] = new Interest({name:'Design, Innovation, and Society', nickname:"dis"});
hass.interests[hass.interests.length] = new Interest({name:'Economics', nickname:"econ"});
hass.interests[hass.interests.length] = new Interest({name:'Electronic Arts', nickname:"ea"});
hass.interests[hass.interests.length] = new Interest({name:'Electronic Media, Arts, & Communication', nickname:"emac"});
hass.interests[hass.interests.length] = new Interest({name:'Games & Simulation Arts and Sciences', nickname:"gsas"});
hass.interests[hass.interests.length] = new Interest({name:'Philosophy', nickname:"phil"});
hass.interests[hass.interests.length] = new Interest({name:'Psychology', nickname:"psyc"});
hass.interests[hass.interests.length] = new Interest({name:'Science, Technology & Society', nickname:"sts"});
hass.interests[hass.interests.length] = new Interest({name:'Sustainability Studies', nickname:"sust"});

for (var i =0; i< hass.interests.length; i++){
	hass.interests[i].noSpace = hass.interests[i].name.replace(/ /g, "").replace(/,/g, "").replace(/&/g, "").toLowerCase();
	hass.interests[i].nickname = hass.interests[i].nickname.toUpperCase();
	hass.interests[i].save();
}

hass.save();


//}

//{ SETUP ARCHITECTURE CATEGORY
var arch = new Category({ name: 'Architecture'});

arch.interests[arch.interests.length] = new Interest({name:'Architecture', nickname:"arch"});
arch.interests[arch.interests.length] = new Interest({name:'Lighting', nickname:"lght"});
for (var i =0; i< arch.interests.length; i++){
	arch.interests[i].noSpace = arch.interests[i].name.replace(/ /g, "").replace(/,/g, "").replace(/&/g, "").toLowerCase();
	arch.interests[i].nickname = arch.interests[i].nickname.toUpperCase();
	arch.interests[i].save();
}

arch.save();
//}

//{ SETUP IT & WS CATEGORY
var itws = new Category({ name: 'Information Technology & Web Science'});

itws.interests[itws.interests.length] = new Interest({name:'Information Technology & Web Science', nickname:"itws"});
for (var i =0; i< itws.interests.length; i++){
	itws.interests[i].noSpace = itws.interests[i].name.replace(/ /g, "").replace(/,/g, "").replace(/&/g, "").toLowerCase();
	itws.interests[i].nickname = itws.interests[i].nickname.toUpperCase();
	itws.interests[i].save();
}

itws.save();
//}

var timeStamp = new Date();
var timeStr = timeStamp.toDateString();
var posts = [];
var post1 = new Post({poster:'Sample Professor', content:'For students looking for experience with digital design. For credit or salary.', title:'VLSI Project', tags:['Electrical Engineering'], fullfilled:false, replyAddress: 'panser@rpi.edu', timePosted: timeStamp, timeString: timeStr});
post1.save();
posts.push(post1);
var post2 = new Post({poster:'Sample Professor', content:"Computational physics research in density functional theory. Must be junior or above with programming experience.", title:'DFT Research', fulfilled:false, replyAddress: 'panser@rpi.edu', timePosted: timeStamp, timeString: timeStr});
post2.save();
posts.push(post2);
var post3 = new Post({poster:'Sample Professor', content:"More physics stuff find out more later.", title:'Physics', fulfilled:true, replyAddress: 'panser@rpi.edu', timePosted: timeStamp, timeString: timeStr});
post3.save();
posts.push(post3);


//}
//console.log("engineering: " + JSON.stringify(engineering));
//console.log("first interest posts: " + Interest.findOne().exec().returnPosts());

Interest.findOne({name: "Electrical Engineering"},function(err,result){
	console.log("err is " + err);
	//console.log("first interest posts: " + JSON.stringify(result.returnPosts() ) );
	result.returnPosts()
});

*/









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
	
	app.get('/addInterest', function(req, res){
		if (req.session.user == null){
			res.redirect('/');
		}
		else{
			res.render('addInterest',{user:req.session.user});
		}
	});
	
	app.get('/interests/:intName', function(req, res) {
		if (req.session.user == null){
			res.redirect('/');
		}
		else{
			if (!req.params.intName){
				res.end();
				return;
			}
			var intName = req.params.intName;
			//console.log("the url for this request is" + req.url);
			//console.log("the path for this request is" + req.path);
			Interest.findOne({nickname:intName},function(err,interest){
				if (interest == null){
					res.end();
					return;
				}
				Post.find({tags:interest.name}, function(err, relevantPosts){
					if(err) return console.error(err);
					res.render('interests', { interest: interest, posts: relevantPosts, user:req.session.user });
				});
			});
		}
	});
//}


//{ APP.GET(ACTION)
	app.get('/amILoggedIn', function(req, res){
		if(req.session.user){
			res.end("yes");
			return;
		}
		else{
			res.end("no");
			return;
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
	
	app.get('/request', function(req, res){
		if (req.session.user == null){
			res.redirect('/');
		}
		else{
			res.render('request',{user:req.session.user});
		}
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
	
	//{ POST REQUEST TO FEED
	var parseCompensation = function(compen, payAmount, credAmount){
		var compensations = [[false, 0], [false, 0]];
		if (compen == "both" || compen =="cash"){
			compensations[0] = [true, payAmount];
		}
		if(compen =="both" || compen=="cred"){
			compensations[1] = [true, credAmount];
		}
		return compensations;
	}

	app.post("/sendMessage",function(req,res){

		subject = req.body.subject;
		message = req.body.message;
		//var tags = findTags(message);
		console.log(req.body.tags);
		var tags = req.body.tags.split("; ");
		tags.pop();
		var comp = parseCompensation(req.body.compen, req.body.payAmount, req.body.credAmount);
		if (parseInt(req.body.hrwk) != NaN){
			var hrwk = req.body.hrwk;
		}
		else{
			var hrwk = 0;
		}
		var years = req.body.year;
		var date = new Date();
		var timeS = date.toDateString();
		var currentUser = req.session.user.name.first + " " + req.session.user.name.last;
		var sentEmail = req.session.user.email;
		if (subject == null || message == null)
		{
			res.redirect("/request");
			return;
		}
		var post = new Post({content:message, title:subject, fulfilled:false, timePosted: date, poster:currentUser, timeString:timeS, replyAddress:sentEmail, tags:[], commitment: hrwk, years: years, pay:comp[0], credit:comp[1]});
		for (var i =0; i< tags.length; i++){
			/*
			Interest.findOne({$or : [{noSpace: tags[i]}, {nickname: tags[i]}]},function(err,result){
				if (result != null){
					post.tags.push(result.name);
					post.save();
				}
			});
			*/
			Interest.findOne({name:tags[i]},function(err,result){
				if (result != null){
					post.tags.push(result.name);
					post.save();
				}
			});
		}
		post.save();
		res.redirect("/");
		//res.end();

	});
	
	//}

//}





