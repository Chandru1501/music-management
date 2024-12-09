const express = require('express');

const Router = express.Router();

const Auth = require('../utills/auth');

const userController = require('../controller/userController');



Router.post("/add-user",Auth.Authendicate,userController.addUser);

Router.put("/update-password",Auth.Authendicate,userController.updatePassword);

Router.delete("/:userId",Auth.Authendicate,userController.deleteUser);

Router.get("/",Auth.Authendicate,userController.getAllUsers);


module.exports = Router;