const express = require('express');

const Router = express.Router();

const Auth = require('../utills/auth');

const trackController = require('../controller/trackController');



Router.post("/add-track",Auth.Authendicate,trackController.addTrack);

Router.get("/:trackId",Auth.Authendicate,trackController.getTrack);

Router.put("/:trackId",Auth.Authendicate,trackController.updateTrack);

Router.delete("/:trackId",Auth.Authendicate,trackController.deleteTrack);

Router.get("/",Auth.Authendicate,trackController.getAllTrack);


module.exports = Router;