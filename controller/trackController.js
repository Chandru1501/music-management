const artistModel = require('../model/artistModel');
const albumModel = require('../model/albumModel');
const trackModel = require('../model/trackModel')
const userModel = require('../model/userModel');
const { Sequelize, Op } = require('sequelize');
const functions = require('../middlewares/functions.js');

const numberRegex = /^-?\d+(\.\d+)?$/;
const yearRegex = /^(19|20)\d{2}$/;
const boolRegex = /^(true|false)$/;

exports.addTrack = async (req,res,next)=>{
    try {
        console.log(req.body);
        const reqUserId = req?.user?.id;
        const name = req?.body?.name ? req?.body?.name : null;
        const duration = req?.body?.duration ? req?.body?.duration : null;
        const hidden = req?.body?.hidden ? req.body.hidden : null;
        const artistId = req?.body?.artist_id ? req.body.artist_id : null;
        const albumId = req?.body?.album_id ? req.body.album_id : null;

        const requiredParams = ['name', 'duration', 'hidden','artist_id','album_id'];
        const missingParams = functions.checkMissingParams(requiredParams, req.body);
        
        if (missingParams?.length > 0) { 
            res.status(400).json({ message: `Bad request. Reason : ${missingParams?.toString()}`, status:400, error:null, data:null });
        } else if(!numberRegex.test(duration) || !boolRegex.test(hidden)){
            res.status(400).json({ message: `Bad request. Reason : please provide correct values`, status:400, error:null, data:null });
        } else {
            const user = await userModel.findOne({ where : { user_id : reqUserId }});
            console.log(user);
            if(!user || user?.role !== 'Admin' && user?.role !== 'Editer'){
                return res.status(403).json({ message: `Forbidden Access/Operation not allowed.`, status:403, error:null, data:null });  
            } else {
                const artist = await artistModel.findOne({
                   where : { artist_id : artistId }
                });
                console.log(artist);
                const album = await albumModel.findOne({
                   where : { album_id : albumId }
                });
                console.log(artist);  
                console.log(album);
                if(!artist && !album){
                    res.status(404).json({ message: `Resource doesn't exist.`, status:404, error:null, data:null });
                } else {
                    const newTrack = await trackModel.create({
                        name : name,
                        duration : duration,
                        hidden : hidden === 'true',
                        artistId : artist?.artist_id,
                        albumId : album?.album_id
                    });
                    console.log(newTrack);
                    res.status(201)
                    .json({ message: "Track created succesfully.", status: 201, data:null, error:null });
                }
            }
        }
            
    } catch (err) {
        console.log(err);
        res.status(500).json({ message : "Internal error occured please try later.", status:500, data : null, error: "internal error occured" });
    }
};

exports.getAllTrack = async (req,res,next) => {
    try {
        const reqUserId = req?.user?.id;
        const user = await userModel.findOne({ where : { user_id : reqUserId }});
        console.log(user);
        if(user){
            const limit = req?.query?.limit ? req?.query?.limit : 5;
            const offset = req?.query?.offset ? req?.query?.offset : 0;
            const artistId = req?.query?.artist_id ? req?.query?.artist_id : null;
            const albumId = req?.query?.album_id ? req?.query?.album_id : null;
            const hidden = req?.query?.hidden ? req?.query?.hidden : null;
            console.log(req?.query);
            if(!numberRegex.test(limit) || !numberRegex.test(offset)){
                return res.status(400).json({ message: `Bad request. Reason : please provide correct values`, status:400, error:null, data:null });
            } else {
                let where = {};
                if(hidden != null) {
                    if(!boolRegex.test(hidden)){
                        return res.status(400).json({ message: `Bad request. Reason : hidden should be boolean value.`, status:400, error:null, data:null });
                    }
                    where.hidden = { [Op.eq] : hidden === 'true' }
                } 
                if(artistId != null){
                    where.artistId = { [Op.eq] : artistId }
                }
                if(albumId != null){
                    where.albumId = { [Op.eq] : albumId }
                }
                
                console.log(where);

                const tracks = await trackModel.findAll({
                    where : where,
                    attributes : ['track_id','albumId','artistId','name','duration','hidden'],
                    limit : Number(limit),
                    offset  : Number(offset),
                    include: [
                        {
                            model: artistModel,
                            attributes: ['name'],
                        },
                        {
                            model: albumModel,
                            attributes: ['name'],
                        },
                    ],
                });
                console.log(tracks);
                let formattedTracks;
        
                if (!tracks || tracks.length === 0) {
                    formattedTracks = [];
                }
        
                formattedTracks = tracks?.map((track) => ({
                    track_id: track?.track_id,
                    artist_name: track?.artist?.name, 
                    album_name: track?.album?.name, 
                    name: track?.name,
                    duration: track?.duration,
                    hidden: track?.hidden,
                }));

                res.status(200)
                .json({ message : "Tracks retrived successfully.", status:200, data : formattedTracks, error:null });
            }
        } else {
            return res.status(403).json({ message: `Forbidden Access/Operation not allowed.`, status:403, error:null, data:null });  
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message : "Internal error occured please try later.", data : null, status:500, error: "internal error occured" });
    }
};


exports.getTrack = async (req,res,next) => {
    try{
        const reqUserId = req?.user?.id;
        const user = await userModel.findOne({ where : { user_id : reqUserId }});
        console.log(user);
        if(user){
        const trackId = req?.params?.trackId;
        const track = await trackModel.findOne({ 
            where : { track_id : trackId },
            attributes : ['track_id','albumId','artistId','name','duration','hidden'],
            include: [
                {
                    model: artistModel,
                    attributes: ['name'],
                },
                {
                    model: albumModel,
                    attributes: ['name'],
                },
            ],
        });

        console.log(track);

        let resData = {
            track_id : track?.track_id,
            name : track?.name,
            artist_name : track?.artist?.name,
            album_name : track?.album?.name,
            year : track?.duration,
            hidden : track?.hidden
        }

           if(track){
                res.status(200)
                .json({ message : "Track fetched successfully.", status:200, data : resData, error:null });
            } else {
                res.status(404)
                .json({ message: `Track not found.`, status:404, error:null, data:null });  
            }
        } else {
            return res.status(403)
            .json({ message: `Forbidden Access/Operation not allowed.`, status:403, error:null, data:null });  
        }
    } catch (err) {
        console.log(err);
        res.status(500)
        .json({ message : "Internal error occured please try later.", data : null, status:500, error: "internal error occured" });
    }
};


exports.updateTrack = async (req,res,next) => {
    try{
        const reqUserId = req?.user?.id;
        const name = req?.body?.name ? req?.body?.name : null; 
        const duration = req?.body?.duration ? req?.body?.duration : null; 
        const hidden = req?.body?.hidden ? req?.body?.hidden : null;

        const user = await userModel.findOne({ where : { user_id : reqUserId }});
        console.log(user);
        if(!user || user?.role !== 'Admin' && user?.role !== 'Editer'){
            return res.status(403)
            .json({ message: `Forbidden Access/Operation not allowed.`, status:403, error:null, data:null });  
        }
        const trackId = req?.params?.trackId;
        const track = await trackModel.findOne({ 
            where : { track_id : trackId },
        });
        console.log(track);
           if(track){
            let updateValues = {};
            let count = 0;
            
                if(name && track?.name !== name){
                    updateValues.name = name;
                    count++;
                }

                if(hidden){
                    if(!boolRegex.test(hidden)){
                        res.status(400)
                        .json({ message: `Bad request. Reason : hidden value must be boolean`, status:400, error:null, data:null });
                    } else {
                        const hiddenValue = hidden === 'true';
                        if(track?.hidden !== hiddenValue){
                            updateValues.hidden = hidden === 'true';
                            count++;
                        }
                    }
                }

                if(duration){
                    if(!numberRegex.test(duration)){
                        res.status(400)
                        .json({ message: `Bad request. Reason : duration value must be integer`, status:400, error:null, data:null });
                    } else {
                        if(track?.duration !== Number(duration)){
                            updateValues.duration = Number(duration);
                            count++;
                        }
                    }
                }

                if(count > 0){
                    const updatetrack = await track.update(updateValues);
                    console.log(updatetrack);
                    res.status(204)
                    .json({ message : "Track updated successfully", status:204, data :null, error:null });
                } else {
                    res.status(400)
                    .json({ message: `Bad request. Reason : No fields to update`, status:400, error:null, data:null });
                }

            } else {
              res.status(404)
             .json({ message: `Track not found.`, status:404, error:null, data:null });  
            }
    } catch (err) {
        console.log(err);
        res.status(500)
        .json({ message : "Internal error occured please try later.", data : null, status:500, error: "internal error occured" });
    }
};

exports.deleteTrack = async (req,res,next) => {
    try {
        const reqUserId = req?.user?.id;
        const user = await userModel.findOne({ where : { user_id : reqUserId }});
        console.log(user);
        if(!user || user?.role !== 'Admin' && user?.role !== 'Editer'){
            return res.status(403)
            .json({ message: `Forbidden Access/Operation not allowed.`, status:403, error:null, data:null });  
        }
        const trackId = req?.params?.trackId;
        const track = await trackModel.findOne({ where : { track_id : trackId } });
        console.log(track);
           if(track){
            const trackName = track?.name;
            await track.destroy();
            res.status(200)
            .json({ message: `Track ${trackName} deleted successfully.`, status:200, error:null, data:null });  
           } else {
             res.status(404)
            .json({ message: `Resource doesn't exist.`, status:404, error:null, data:null });  
           }
    } catch (err) {
        console.log(err);
        res.status(500)
        .json({ message : "Internal error occured please try later.", data : null, status:500, error: "internal error occured" });
    }
};