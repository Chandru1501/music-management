let jwt = require('jsonwebtoken');

exports.Authendicate = async (req,res,next)=>{
    try{
    let token = req.headers.authorization.split(" ")[1];
    console.log(token);
    const ReqUser = jwt.verify(token,process.env.JWT_TOKEN_SECRECT);
    console.log(ReqUser);
    req.user = ReqUser;
       next();
    }
    catch(err){
        console.log(err);
        res.status(401).json({ message: `Unauthorized Access`, status:401, error:null, data:null });
    }
}