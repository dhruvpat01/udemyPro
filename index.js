const express = require("express")
const bodyParser = require("body-parser")
const app = express();
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const verifi = require("./verifyTokens")
var path = require('path')
const ejs = require("ejs");
const User = require("./modals/users");
const url = "mongodb+srv://daksh:6B29jtiTryRXItXG@cluster0.vdagk.mongodb.net/udemyDB?retryWrites=true&w=majority"
const passwordValidator = require('password-validator');
const check = new passwordValidator();

mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});


app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
// app.use(express.static("public"));
app.use(express.static(path.join(__dirname, 'public')));
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
							const token = jwt.sign({email:foundUser.email},"Thisismysecret",{ expiresIn: '1h' });
							res.header('auth-token',token)
							
					      
					
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

app.get("/home", verifi,(req,res)=>{
	jwt.verify(token, 'Thisismysecr', function(err, decoded) {
		console.log("asdsdd") // bar
	  });
	
		res.json({message:"Helooo adfvsdf"});
	
	
})

//Admin side
app.get("/admin",(req,res)=>{
	res.render("admin")
})

app.post("/admin",(req,res)=>{

})

//Listener

app.listen("3000",()=>{console.log("Server started listening on port 3000")})
