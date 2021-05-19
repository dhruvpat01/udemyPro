const express = require("express")
const bodyParser = require("body-parser")
const app = express();
const mongoose = require("mongoose")
const cookieParser = require('cookie-parser')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const verifi = require("./verifyTokens")

var path = require('path')
const ejs = require("ejs");
const User = require("./modals/users");
const Course = require("./modals/courses");
require('dotenv').config();
const url = process.env.MONGODB_URL;
const passwordValidator = require('password-validator');
const check = new passwordValidator();



mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});

app.use(cookieParser())
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
// app.use(express.static("public"));
app.use(express.static(path.join(__dirname, '/public')));
app.set('view engine',"ejs");







//Api Endpoints

app.get("/",(req,res)=>{
  res.send("Hello")
})

//Register Route
app.get("/register",(req,res)=>{
  res.render("register")
})

app.post("/register",(req,res)=>{
    
  const { name, phone, email, password, password2 } = req.body;

  
  
  check.has().uppercase().has().lowercase().has().digits(2);
  let errors = [];
	if (!name || !email || !password || !password2) {
		errors.push({ msg: 'All fields are compulsory' });
	}
	if (phone.length != 10) {
		errors.push({ msg: 'Wrong Phone number' });
	}
	if (password.length < 6) {
		errors.push({ msg: 'Passwords too short' });
	}
	if (check.validate(password) == false) {
		errors.push({ msg: 'Password too weak' });
	}
	if (password != password2) {
		errors.push({ msg: 'Passwords do not match' });
	}
  
	if (errors.length > 0) {
		res.render('register', { errors, name, email, password, password2 });
	} else {
		User.findOne({ email: email })
			.then((user) => {
				if (user) {
					errors.push({ msg: 'Email already exists' });
					res.render('register', { errors, name, email, password, password2 });
				} else {
					
					const newUser = new User({
						name,
						email,
						password,
						phone
						// profile_img : loc.url
					});
					
					bcrypt.genSalt(10, (err, salt) => {
						bcrypt.hash(newUser.password, salt, (err, hash) => {
							if (err) {
								console.log(err);
							} else {
								newUser.password = hash;
								
								newUser.save();
								res.redirect('/login');
							}
						});
					});
				}
			})
			.catch((e) => console.log(e));
    }

    
})



//Login
app.get("/login",(req,res)=>{
  res.render("login")
})

app.post("/login",(req,res)=>{
	User.findOne({email: req.body.email},(err,foundUser)=>{
		if(err){
			console.log(err)
		}
		else{
			if(foundUser){
				bcrypt.compare(req.body.password, foundUser.password, function(err, result) {
					    // result == true
					    if(result === true){
							const token = jwt.sign({email:foundUser.email},process.env.SECRET,{ expiresIn: '1h' });
							// res.header('auth-token',token)
							res.cookie("jwt", token, {secure: false, httpOnly: true})
    						res.send(token)
							
					      
					
						}
						
					});

			}else{
				console.log("no user")
			}

		}
	}
	)
	console.log(req.body);
})

app.get("/logout",(req,res)=>{
	res.clearCookie("jwt");
	res.send("clearing cookies")
})

app.get("/home", verifi,(req,res)=>{
	console.log(req.user);
	res.send("Hello World");
})

//Admin side
app.get("/admin",(req,res)=>{
	res.render("admin")
})

app.post("/admin",(req,res)=>{
	const { course_name,email,course_title,course_description,date,start_time,end_time,min,max} = req.body;
	console.log(req.body)
	const newCourse = new Course({
		course_name,
		email,
		course_title,
		course_description,
		date,
		start_time,
		end_time,
		min,
		max	
	});

	newCourse.save((err)=>{
		if(err){
			console.log(err)
		}
		else{
			console.log("successful saved")
		}
	})


})

//all_course
app.get("/all_course",(req,res)=>{
	Course.find({}, (err, course) => {
		if (err) {
			console.log(err);
		} else {
			console.log(req.user);
			res.render('all_course', {
				courses  : course,		
			});
		}
	});
})



//Listener

app.listen("3000",()=>{console.log("Server started listening on port 3000")})
