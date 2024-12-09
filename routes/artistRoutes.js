const express = require('express');

const Router = express.Router();

const Auth = require('../utills/auth');

const artistController = require('../controller/artistController');


Router.post("/add-artist",Auth.Authendicate,artistController.addArtist);

Router.get("/:artistId",Auth.Authendicate,artistController.getArtist);

Router.put("/:artistId",Auth.Authendicate,artistController.updateArtist);

Router.delete("/:artistId",Auth.Authendicate,artistController.deleteArtist);

Router.get("/",Auth.Authendicate,artistController.getAllArtists);


module.exports = Router;