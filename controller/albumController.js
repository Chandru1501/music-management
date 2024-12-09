const artistModel = require('../model/artistModel');
const albumModel = require('../model/albumModel.js');
const userModel = require('../model/userModel');
const { Sequelize, Op } = require('sequelize');
const functions = require('../middlewares/functions.js');

const numberRegex = /^-?\d+(\.\d+)?$/;
const yearRegex = /^(19|20)\d{2}$/;
const boolRegex = /^(true|false)$/;

exports.addAlbum = async (req,res,next)=>{
    try {
        console.log(req.body);
        const reqUserId = req?.user?.id;
        const name = req?.body?.name ? req?.body?.name : null;
        const year = req?.body?.year ? req?.body?.year : null;
        const hidden = req?.body?.hidden ? req.body.hidden : null;
        const artistId = req?.body?.artist_id ? req.body.artist_id : null;

        const requiredParams = ['name', 'year', 'hidden','artist_id'];
        const missingParams = functions.checkMissingParams(requiredParams, req.body);
        
        if (missingParams?.length > 0) { 
            res.status(400).json({ message: `Bad request. Reason : ${missingParams?.toString()}`, status:400, error:null, data:null });
        } else if(!yearRegex.test(year) || !boolRegex.test(hidden)){
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
                if(!artist){
                    res.status(404).json({ message: `Resource doesn't exist.`, status:404, error:null, data:null });
                } else {
                    const newAlbum = await artist.createAlbum({
                        name : name,
                        year : year,
                        hidden : hidden === 'true'
                    });
                    console.log(newAlbum);
                    res.status(201)
                    .json({ message: "Album created succesfully.", status: 201, data:null, error:null });
                }
            }
        }
            
    } catch (err) {
        console.log(err);
        res.status(500).json({ message : "Internal error occured please try later.", status:500, data : null, error: "internal error occured" });
    }
};

exports.getAllAlbums = async (req,res,next) => {
    try {
        const reqUserId = req?.user?.id;
        const user = await userModel.findOne({ where : { user_id : reqUserId }});
        console.log(user);
        if(user){
            const limit = req?.query?.limit ? req?.query?.limit : 5;
            const offset = req?.query?.offset ? req?.query?.offset : 0;
            const artistId = req?.query?.artist_id ? req?.query?.artist_id : null;
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
                
                console.log(where);

                const albums = await albumModel.findAll({
                    where : where,
                    attributes : ['album_id','artistId','name','year','hidden'],
                    limit : Number(limit),
                    offset  : Number(offset),
                    include: [
                        {
                            model: artistModel,
                            attributes: ['name'], 
                        },
                    ],
                });
                console.log(albums);
                let formattedAlbums;
        
                if (!albums || albums.length === 0) {
                    formattedAlbums = [];
                }
        
                formattedAlbums = albums?.map((album) => ({
                    album_id: album?.album_id,
                    artist_name: album?.artist?.name, 
                    name: album?.name,
                    year: album?.year,
                    hidden: album?.hidden,
                }));

                res.status(200)
                .json({ message : "Albums retrived successfully.", status:200, data : formattedAlbums, error:null });
            }
        } else {
            return res.status(403).json({ message: `Forbidden Access/Operation not allowed.`, status:403, error:null, data:null });  
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message : "Internal error occured please try later.", data : null, status:500, error: "internal error occured" });
    }
};


exports.getAlbum = async (req,res,next) => {
    try{
        const reqUserId = req?.user?.id;
        const user = await userModel.findOne({ where : { user_id : reqUserId }});
        console.log(user);
        if(user){
        const albumId = req?.params?.albumId;
        const album = await albumModel.findOne({ 
            where : { album_id : albumId },
            attributes : ['album_id','name','year','hidden'],
            include : {
               model : artistModel,
               attributes : ['name']
            }
        });
        console.log(album);
        let resData = {
            album_id : album?.album_id,
            name : album?.name,
            artist_name : album?.artist?.name,
            year : album?.year,
            hidden : album?.hidden
        }
           if(album){
                res.status(200)
                .json({ message : "Album fetched successfully.", status:200, data : resData, error:null });
            } else {
                res.status(404)
                .json({ message: `Album not found.`, status:404, error:null, data:null });  
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


exports.updateAlbum = async (req,res,next) => {
    try{
        const reqUserId = req?.user?.id;
        const name = req?.body?.name ? req?.body?.name : null; 
        const year = req?.body?.year ? req?.body?.year : null; 
        const hidden = req?.body?.hidden ? req?.body?.hidden : null;

        const user = await userModel.findOne({ where : { user_id : reqUserId }});
        console.log(user);
        if(!user || user?.role !== 'Admin' && user?.role !== 'Editer'){
            return res.status(403)
            .json({ message: `Forbidden Access/Operation not allowed.`, status:403, error:null, data:null });  
        }
        const albumId = req?.params?.albumId;
        const album = await albumModel.findOne({ 
            where : { album_id : albumId },
        });
        console.log(album);
           if(album){
            let updateValues = {};
            let count = 0;
                if(name && album?.name !== name){
                    updateValues.name = name;
                    count++;
                }

                if(hidden){
                    if(!boolRegex.test(hidden)){
                        res.status(400)
                        .json({ message: `Bad request. Reason : hidden value must be boolean`, status:400, error:null, data:null });
                    } else {
                        const hiddenValue = hidden === 'true';
                        if(album?.hidden !== hiddenValue){
                            updateValues.hidden = hidden === 'true';
                            count++;
                        }
                    }
                }

                if(year){
                    if(!yearRegex.test(year)){
                        res.status(400)
                        .json({ message: `Bad request. Reason : year value must be integer`, status:400, error:null, data:null });
                    } else {
                        if(album?.year !== Number(year)){
                            updateValues.year = Number(year);
                            count++;
                        }
                    }
                }

                if(count > 0){
                    const updateAlbum = await album.update(updateValues);
                    console.log(updateAlbum);
                    res.status(204)
                    .json({ message : "Album updated successfully", status:204, data :null, error:null });
                } else {
                    res.status(400)
                    .json({ message: `Bad request. Reason : No fields to update`, status:400, error:null, data:null });
                }

            } else {
              res.status(404)
             .json({ message: `Album not found.`, status:404, error:null, data:null });  
            }
    } catch (err) {
        console.log(err);
        res.status(500)
        .json({ message : "Internal error occured please try later.", data : null, status:500, error: "internal error occured" });
    }
};

exports.deleteAlbum = async (req,res,next) => {
    try {
        const reqUserId = req?.user?.id;
        const user = await userModel.findOne({ where : { user_id : reqUserId }});
        console.log(user);
        if(!user || user?.role !== 'Admin' && user?.role !== 'Editer'){
            return res.status(403)
            .json({ message: `Forbidden Access/Operation not allowed.`, status:403, error:null, data:null });  
        }
        const albumId = req?.params?.albumId;
        const album = await albumModel.findOne({ where : { album_id : albumId } });
        console.log(album);
           if(album){
            const albumName = album?.name;
            await album.destroy();
            res.status(200)
            .json({ message: `Album ${albumName} deleted successfully.`, status:200, error:null, data:null });  
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