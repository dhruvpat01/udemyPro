const jwt = require("jsonwebtoken")

module.exports = function(req,res,next){
    const token = req.cookies.jwt;
    if (!token) return res.status(401).send("Access Denied");

    try{
        jwt.verify(token,process.env.SECRET)
        const verified = jwt.decode(token,process.env.SECRET);
        req.user = verified;
        
        next();

    }catch(err){
        res.status(400).send("Invalid Token")

    }

}

// module.exports = function(req,res,next){
//     let token = req.cookies.jwt
    
//     if (!token){
//         return res.status(403).send("Access Denied")
//     }

//     let payload
//     try{
//         //use the jwt.verify method to verify the access token
//         //throws an error if the token has expired or has a invalid signature
//         payload = jwt.verify(token, process.env.SECRET)
//         next()
//     }
//     catch(e){
//         //if an error occured return request unauthorized error
//         return res.status(401).send("Invalid Token")
//     }

// }