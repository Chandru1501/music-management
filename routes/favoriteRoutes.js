const express = require('express');

const Router = express.Router();

const Auth = require('../utills/auth');

const favoriteController = require('../controller/favoriteController');


Router.post("/add-favorite",Auth.Authendicate,favoriteController.addToFav);

Router.delete("/remove-favorite/:favoriteId",Auth.Authendicate,favoriteController.removeFromFav);

Router.get("/:category",Auth.Authendicate,favoriteController.getAllFav);


module.exports = Router;