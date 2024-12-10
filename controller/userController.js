const userModel = require('../model/userModel');
const { Sequelize, Op, where } = require('sequelize');
const bcrypt = require('bcrypt');
const functions = require('../middlewares/functions.js');


const numberRegex = /^-?\d+(\.\d+)?$/;

exports.addUser = async (req,res,next)=>{
    try {
        console.log(req.body);
        const reqUserId = req?.user?.id;
        const { role, email, password } = req.body;
        const requiredParams = ['email', 'password', 'role'];
        const missingParams = functions.checkMissingParams(requiredParams, req.body);
        
        if (missingParams?.length > 0) { 
            res.status(400).json({ message: `Bad request. Reason : ${missingParams?.toString()}`, status:400, error:null, data:null });
        } else {
            const user = await userModel.findOne({ where : { user_id : reqUserId }});
            console.log(user);
            if(!user || user?.role !== 'Admin' || role === 'Admin'){
                return res.status(403).json({ message: `Forbidden Access/Operation not allowed.`, status:403, error:null, data:null });  
            }
            if(role !== 'Editer' && role !== 'Viewer'){
                res.status(400).json({ message: `Bad request. Reason : role must be Editer or Viewer.`, status:400, error:null, data:null });
            }
            const checkExist = await userModel.findOne({ where : { email : email }});
            console.log(checkExist);
            if (checkExist) {
                res
                .status(409)
                .json({ message: "Email already exists.", status:409, data:null, error:null });
            } else {
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                const user = await userModel.create({
                    email : email,
                    role : role,
                    password: hashedPassword,
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
        res.status(500).json({ message : "Internal error occured please try later.", data : null, status:500, error: "internal error occured" });
    }
};


exports.getAllUsers = async (req,res,next)=>{
    try {
        const reqUserId = req?.user?.id;
        const user = await userModel.findOne({ where : { user_id : reqUserId }});
        console.log(user);
        if(!user || user?.role !== 'Admin'){
            return res.status(403).json({ message: `Forbidden Access/Operation not allowed.`, status:403, error:null, data:null });  
        } 
            const limit = req?.query?.limit ? req?.query?.limit : 5;
            const offset = req?.query?.offset ? req?.query?.offset : 0;
            const role = req?.query?.role ? req?.query?.role : null;
            if(!numberRegex.test(limit) || !numberRegex.test(offset)){
                return res.status(400).json({ message: `Bad request. Reason : please provide correct values`, status:400, error:null, data:null });
            } else {
                if(role!== 'Editer' && role !== 'Viewer' && role !== null){
                    res.status(400).json({ message: `Bad request. Reason : role must be Editer or Viewer.`, status:400, error:null, data:null });
                } else {
                    let where = {};
                    if(role === null){
                        where.role = { [Op.ne] : 'Admin' } 
                    } else {
                        where.role = { [Op.eq] : role }
                    }
                    const users = await userModel.findAll({ 
                        where : where,
                        attributes : ['user_id','email','role','createdAt'], 
                        limit : Number(limit), 
                        offset : Number(offset) 
                    });
                    console.log(users);
                    res.status(200).json({ message : 'User retrived successfully.', status:200, error:null, data: users });
                }
            }
            
    } catch (err) {
        console.log(err);
        res.status(500).json({ message : "Internal error occured please try later.", data : null, status:500, error: "internal error occured" });
    }
}


exports.deleteUser = async (req,res,next)=>{
    try {
        const reqUserId = req?.user?.id;
        const user = await userModel.findOne({ where : { user_id : reqUserId }});
        console.log(user);
        if(!user || user?.role !== 'Admin'){
            return res.status(403).json({ message: `Forbidden Access/Operation not allowed.`, status:403, error:null, data:null });  
        } 
        const userId = req?.params?.userId;
        const deleteUser = await userModel.destroy({ where : { user_id : userId }});
        console.log(deleteUser);
        if(deleteUser){
            res.status(200).json({ message : 'User deleted successfully.', status:200, error:null, data:null});
        } else {
            res.status(404).json({ message : 'User not found.', status:404, error:null, data:null });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message : "Internal error occured please try later.", data : null, status:500, error: "internal error occured" });
    }
};


exports.updatePassword = async (req,res,next)=>{
    try {
        console.log(req.body);
        const reqUserId = req?.user?.id;
        const { old_password, new_password } = req.body;
        const requiredParams = ['old_password', 'new_password'];
        const missingParams = functions.checkMissingParams(requiredParams, req.body);
        
        if (missingParams?.length > 0) { 
            res.status(400).json({ message: `Bad request. Reason : ${missingParams?.toString()}`, status:400, error:null, data:null });
        } else {
            const user = await userModel.findOne({ where: { user_id : reqUserId } });
            if (user) {
              const oldpassword = old_password;
              const newpassword = new_password;
              const existingPassword = user?.password;
              const checkPassword = await bcrypt.compare(oldpassword, existingPassword);
                if(checkPassword){
                    const saltRounds = 10;
                    const hashedPassword = await bcrypt.hash(newpassword, saltRounds);
                    const changePassword = await user.update({
                        password: hashedPassword,
                    });
                    console.log(changePassword);
                    if(changePassword){
                        res
                        .status(204)
                        .json({ message: "Password updated succesfully.", status: 204, data:null, error:null });
                    } else {
                        res
                        .status(500)
                        .json({ message : "Internal error occured please try later.", data : null, status:500, error: "internal error occured" });
                    }
                } else {
                    res.status(400)
                    .json({ message : 'Bad request. Reason : wrong old password', status:404, error:null, data:null });
                }
            } else {
                res.status(404).json({ message : 'User not found.', status:404, error:null, data:null });
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message : "Internal error occured please try later.", data : null, status:500, error: "internal error occured" });
    }
};

