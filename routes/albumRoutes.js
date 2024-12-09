const express = require('express');

const Router = express.Router();

const Auth = require('../utills/auth');

const albumController = require('../controller/albumController');


Router.post("/add-album",Auth.Authendicate,albumController.addAlbum);

Router.get("/:albumId",Auth.Authendicate,albumController.getAlbum);

Router.put("/:albumId",Auth.Authendicate,albumController.updateAlbum);

Router.delete("/:albumId",Auth.Authendicate,albumController.deleteAlbum);

Router.get("/",Auth.Authendicate,albumController.getAllAlbums);


module.exports = Router;