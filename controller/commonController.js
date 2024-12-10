const userModel = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const functions = require('../middlewares/functions.js');

async function generateAccessToken(id, email, role) {
    return jwt.sign(
        { id: id, email: email, role: role },
        process.env.JWT_TOKEN_SECRECT,{
        expiresIn: process.env.TOKEN_EXPIRATION,
        }
    );
}

exports.logout = async (req,res,next)=>{
    try {
        const user = await userModel.findOne({ where : req?.user?.id });
        console.log(user);
        if(user){
          res.status(200).json({ message : "User logged out successfully.", data : null, status:200, error: null });
        } else {
          res.status(401).json({ message : "User not found.", data : null, status:401, error: null });
        }
    } catch (err) {
        res.status(500).json({ message : "Internal error occured please try later.", data : null, status:500, error: "internal error occured" });
    }
};

exports.signUp = async (req, res, next) => {
    try {
        console.log(req.body);
        const { email, password } = req?.body;
        const requiredParams = ['email', 'password'];
        const missingParams = functions.checkMissingParams(requiredParams, req.body);

        if (missingParams?.length > 0) { 
            res.status(400).json({ message: `Bad request. Reason : ${missingParams?.toString()}.`, status:400, error:null, data:null });
        } else {
            const checkExist = await userModel.findOne({ where: { email: email } });
            console.log(checkExist);
            if (checkExist) {
                res
                .status(409)
                .json({ message: "Email already exists.", status:409, data:null, error:null });
            } else {
                let userCount = await userModel.count();
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                const user = await userModel.create({
                    email : email,
                    password: hashedPassword,
                    role : userCount === 0 ? "Admin" : 'Viewer'
                });
                console.log(user);
                if(user){
                    res
                    .status(201)
                    .json({ message: "User created succesfully.", status: 201, data:null, error:null });
                } else {
                    res
                    .status(500)
                    res.status(500).json({ message : "Internal error occured please try later.", data : null, status:500, error: "internal error occured" });
                }
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message : "Internal error occured please try later", data : null, status:500, error: "internal error occured" });
    }
};

exports.login = async (req, res, next) => {
    try {
        console.log(req.body);
        const { email, password } = req.body;
        const requiredParams = ['email', 'password'];
        const missingParams = functions.checkMissingParams(requiredParams, req.body);
        
        if (missingParams?.length > 0) { 
            res.status(400).json({ message: `Bad request. Reason : ${missingParams?.toString()}.`, status:400, error:null, data:null });
        } else {
        const user = await userModel.findOne({
            where: { email: email },
        });
            console.log(user);
            if (user) {
            const DB_PASSWORD = user?.password;
            const checkPassword = await bcrypt.compare(password, DB_PASSWORD);
                if(checkPassword){
                const token = await generateAccessToken(user?.user_id, user?.email, user?.role);
                console.log(token);
                    if (token) {
                        res
                        .status(200)
                        .json({ message: "Login successful.", status:200, data : { token: token }, error:null });
                    } else {
                        res.status(500).json({ message : "Internal error occured please try later.", data : null, status:500, error: "internal error occured" });
                    }
                } else {
                    res.status(400).json({ message: "Bad request. Reason : Wrong password.", status:400, data:null, error:null });
                }    
            } else {
                res.status(404).json({ message: "User not found.", status:404, data:null, error:null });
            }
        }
        
    } catch (err) {
        console.log(err);
        res.status(500).json({ message : "Internal error occured please try later.", data : null, status:500, error: "internal error occured" });
    }
};