const express = require('express');

const Router = express.Router();

const Auth = require('../utills/auth');

const commonController = require('../controller/commonController');



Router.get("/logout",Auth.Authendicate,commonController.logout);

Router.post("/signup",commonController.signUp);

Router.post("/login",commonController.login);


module.exports = Router;