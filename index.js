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
const Student = require("./modals/students")
require('dotenv').config();
const url = process.env.MONGODB_URL;
const passwordValidator = require('password-validator');
const check = new passwordValidator();
let Logged_in=false
let Role = ""



mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});

app.use(cookieParser())
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
// app.use(express.static("public"));
app.use(express.static(path.join(__dirname, '/public')));
app.set('view engine',"ejs");







//Api Endpoints

app.get("/",(req,res)=>{
	if(Logged_in){
		Course.find({}, (err, course) => {
			if (err) {
				console.log(err);
			} else {
				console.log(req.user);
				res.render('all_course', {
					courses  : course,
					rol      : Role		
				});
			}
		});
	}else{
		Course.find({}, (err, course) => {
			if (err) {
				console.log(err);
			} else {
				console.log(req.user);
				res.render('home', {
					courses  : course,		
				});
			}
		});
		
	}
	
  
})

//Register Route
app.get("/register",(req,res)=>{
  res.render("register")
})

app.post("/register",(req,res)=>{
	const role="student"
    
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
						phone,
						role
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
					    if(result === true){
							Role = foundUser.role
							Logged_in = true
							const token = jwt.sign({email:foundUser.email,role:foundUser.role},process.env.SECRET,{ expiresIn: '1h' });
							// res.header('auth-token',token)
							res.cookie("jwt", token, {secure: false, httpOnly: true})
    						res.redirect("/")
							
					      
					
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
	Logged_in = false
	res.clearCookie("jwt");
	
	res.redirect("/")
})

// app.get("/home", verifi,(req,res)=>{
	
// 	res.send("Hello World");
// })

//Admin side
app.get("/admin",verifi,(req,res)=>{
	
	if(req.user.role==="admin"){
	
		res.render("admin")
	}
	else{
		res.send("Permission for this route is restricted")
	}
	
})

app.post("/admin",(req,res)=>{
	const { course_name,email,course_title,course_description,duration,start_date,end_date,min,max} = req.body;
	console.log(req.body)
	const newCourse = new Course({
		course_name,
		email,
		course_title,
		course_description,
		duration,
		start_date,
		end_date,
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
// app.get("/all_course",verifi,(req,res)=>{
// 	Course.find({}, (err, course) => {
// 		if (err) {
// 			console.log(err);
// 		} else {
// 			console.log(req.user);
// 			res.render('all_course', {
// 				courses  : course,		
// 			});
// 		}
// 	});
// })

// app.post("/all_course",verifi,(req,res)=>{
	
// 	const newStudent = new Student({
// 		email:req.user.email,
// 		courses:req.body.id
// 	});
// 	newStudent.save((err)=>{
// 		if(err){
// 			console.log(err)
// 		}
// 		else{
// 			console.log("Successfully Saved")
// 		}
// 	})



// })


//User
app.get("/user",verifi,(req,res)=>{
	User.find({ email: req.user.email }, (err, use) =>{
		if(err){
			console.log(err)
		}else{
			if(Role==="admin"){
				Course.find({ email: req.user.email }, (err, course) => {
					if (err) {
						console.log(err);
					} else {
						res.render('user', { 
							courses: course,
							user   :use,
							rol 	:Role
						});
						
					}
				});
			}
			else{
				Student.find({email: req.user.email},(err, stud)=>{
					if(err){
						console.log(err)
					}else{
						res.render('user', { 
							students: stud,
							user   :use,
							rol		:Role
							
						});
					}
				})
			}
			

		}
});

	// res.render("user");
})






//Course_Profile
app.get('/:topic', verifi, (req, res) => {
	const re = req.params.topic;
	console.log(re);
	
	Course.find({}, (err, courses) => {
		if (err) {
			console.log(err);
		} else {
			Student.find({course_title:re},(err,stu)=>{
				if (err) {
					console.log(err);
				} else {
					res.render('course', {
						course : courses,
						user : req.user,
						student : stu,
						name : re,
						rol   :Role
					});
				
				}
		
			})
			
		}
	});
});

app.post('/:topic',verifi, (req, res)=>{
	console.log(req.body)
	Student.findOne({course_title:req.body.course_title,email:req.user.email},(err,foundUser)=>{
		if(err){
			console.log(err)
		}else{
			if(foundUser){
				res.send("You have already enrolled for this course")
			}else{
				const newStudent = new Student({
					email:req.user.email,
					course_title:req.body.course_title,
					duration:req.body.duration,
					start_date:req.body.start_date
			
				});
				newStudent.save((err)=>{
					if(err){
						console.log(err)
					}
					else{
						console.log("Successfully Saved")
						res.redirect("/")
					}
				})

			}
		}
	})
	
});





//Listener

app.listen("3000",()=>{console.log("Server started listening on port 3000")})

//changes