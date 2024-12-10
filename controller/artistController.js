const artistModel = require('../model/artistModel');
const userModel = require('../model/userModel');
const { Sequelize, Op } = require('sequelize');
const functions = require('../middlewares/functions.js');

const numberRegex = /^-?\d+(\.\d+)?$/;
const boolRegex = /^(true|false)$/;

exports.addArtist = async (req,res,next)=>{
    try {
        console.log(req.body);
        const reqUserId = req?.user?.id;
        const name = req?.body?.name ? req?.body?.name : null;
        const grammy = req?.body?.grammy ? req?.body?.grammy : null;
        const hidden = req?.body?.hidden ? req.body.hidden : null;

        const requiredParams = ['name', 'grammy', 'hidden'];
        const missingParams = functions.checkMissingParams(requiredParams, req.body);
        
        if (missingParams?.length > 0) { 
            res.status(400).json({ message: `Bad request. Reason : ${missingParams?.toString()}`, status:400, error:null, data:null });
        } else if(!numberRegex.test(grammy) || !boolRegex.test(hidden)){
            res.status(400).json({ message: `Bad request. Reason : please provide correct values`, status:400, error:null, data:null });
        } else {
            const user = await userModel.findOne({ where : { user_id : reqUserId }});
            console.log(user);
            if(!user || user?.role !== 'Admin' && user?.role !== 'Editer'){
                return res.status(403).json({ message: `Forbidden Access/Operation not allowed.`, status:403, error:null, data:null });  
            } else {
                const newArtist = await artistModel.create({
                   name : name,
                   grammy : grammy,
                   hidden : hidden
                });
                console.log(newArtist);
                res.status(201)
                .json({ message: "Artist created succesfully.", status: 201, data:null, error:null });
            }
        }
            
    } catch (err) {
        console.log(err);
        res.status(500).json({ message : "Internal error occured please try later.", status:500, data : null, error: "internal error occured" });
    }
};

exports.getAllArtists = async (req,res,next) => {
    try {
        const reqUserId = req?.user?.id;
        const user = await userModel.findOne({ where : { user_id : reqUserId }});
        console.log(user);
        if(user){
            const limit = req?.query?.limit ? req?.query?.limit : 5;
            const offset = req?.query?.offset ? req?.query?.offset : 0;
            const grammy = req?.query?.grammy ? req?.query?.grammy : null;
            const hidden = req?.query?.hidden ? req?.query?.hidden : null;
            console.log(req?.query);
            if(!numberRegex.test(limit) || !numberRegex.test(offset)){
                return res.status(400).json({ message: `Bad request. Reason : please provide correct values`, status:400, error:null, data:null });
            } else {
                let where = {};
                if(hidden != null) {
                    if(!boolRegex.test(hidden)){
                        return res.status(400).json({ message: `Bad request. Reason : hidden should be boolean value`, status:400, error:null, data:null });
                    }
                    where.hidden = { [Op.eq] : hidden === 'true' }
                } 
                if(grammy != null){
                    if(!numberRegex.test(grammy)){
                        return res.status(400).json({ message: `Bad request. Reason : grammy must be integer value`, status:400, error:null, data:null });
                    }
                    where.grammy = { [Op.eq] : grammy }
                }
                
                console.log(where);
                const artists = await artistModel.findAll({ 
                    where : where,
                    attributes : ['artist_id','name','grammy','hidden'],
                    limit : Number(limit),
                    offset  : Number(offset)
                });
                console.log(artists);
                res.status(200)
                .json({ message : "Artists fetched successfully", status:200, data : artists, error:null });
            }
        } else {
            return res.status(403).json({ message: `Forbidden Access/Operation not allowed.`, status:403, error:null, data:null });  
        }

    } catch (err) {
        console.log(err);
        res.status(500).json({ message : "Internal error occured please try later.", data : null, status:500, error: "internal error occured" });
    }
};


exports.getArtist = async (req,res,next) => {
    try{
        const reqUserId = req?.user?.id;
        const user = await userModel.findOne({ where : { user_id : reqUserId }});
        console.log(user);
        if(user){
        const artistId = req?.params?.artistId;
        const artist = await artistModel.findOne({ 
            where : { artist_id : artistId },
            attributes : ['artist_id','name','grammy','hidden']
        });
        console.log(artist);
        
           if(artist){
                res.status(200)
                .json({ message : "Artist fetched successfully", status:200, data : artist, error:null });
            } else {
                res.status(404)
                .json({ message: `Artist not found.`, status:404, error:null, data:null });  
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


exports.updateArtist = async (req,res,next) => {
    try{
        const reqUserId = req?.user?.id;
        const name = req?.body?.name ? req?.body?.name : null; 
        const grammy = req?.body?.grammy ? req?.body?.grammy : null; 
        const hidden = req?.body?.hidden ? req?.body?.hidden : null;

        const user = await userModel.findOne({ where : { user_id : reqUserId }});
        console.log(user);
        if(!user || user?.role !== 'Admin' && user?.role !== 'Editer'){
            return res.status(403)
            .json({ message: `Forbidden Access/Operation not allowed.`, status:403, error:null, data:null });  
        }
        const artistId = req?.params?.artistId;
        const artist = await artistModel.findOne({ 
            where : { artist_id : artistId },
        });
        console.log(artist);
           if(artist){
            let updateValues = {};
            let count = 0;
                if(name && artist?.name !== name){
                    updateValues.name = name;
                    count++;
                }

                if(hidden){
                    if(!boolRegex.test(hidden)){
                        res.status(400)
                        .json({ message: `Bad request. Reason : hidden value must be boolean`, status:400, error:null, data:null });
                    } else {
                        const hiddenValue = hidden === 'true';
                        if(artist?.hidden !== hiddenValue){
                            updateValues.hidden = hidden === 'true';
                            count++;
                        }
                    }
                }

                if(grammy){
                    if(!numberRegex.test(grammy)){
                        res.status(400)
                        .json({ message: `Bad request. Reason : grammy value must be integer`, status:400, error:null, data:null });
                    } else {
                        if(artist?.grammy !== Number(grammy)){
                            updateValues.grammy = Number(grammy);
                            count++;
                        }
                    }
                }

                if(count > 0){
                    const updateArtist = await artist.update(updateValues);
                    console.log(updateArtist);
                    res.status(204)
                    .json({ message : "Artist updated successfully", status:204, data :null, error:null });
                } else {
                    res.status(400)
                    .json({ message: `Bad request. Reason : No fields to update`, status:400, error:null, data:null });
                }

            } else {
              res.status(404)
             .json({ message: `Artist not found.`, status:404, error:null, data:null });  
            }
    } catch (err) {
        console.log(err);
        res.status(500)
        .json({ message : "Internal error occured please try later.", data : null, status:500, error: "internal error occured" });
    }
};

exports.deleteArtist = async (req,res,next) => {
    try {
        const reqUserId = req?.user?.id;
        const user = await userModel.findOne({ where : { user_id : reqUserId }});
        console.log(user);
        if(!user || user?.role !== 'Admin' && user?.role !== 'Editer'){
            return res.status(403)
            .json({ message: `Forbidden Access/Operation not allowed.`, status:403, error:null, data:null });  
        }
        const artistId = req?.params?.artistId;
        const artist = await artistModel.findOne({ where : { artist_id : artistId } });
        console.log(artist);
           if(artist){
            const artistId = artist?.artist_id;
            const artistName = artist?.name;
            await artist.destroy();
            res.status(200)
            .json({ message: `Artist ${artistName} deleted successfully.`, status:200, error:null, data: { artist_id : artistId } });  
           } else {
             res.status(404)
            .json({ message: `Artist not found.`, status:404, error:null, data:null });  
           }
    } catch (err) {
        console.log(err);
        res.status(500)
        .json({ message : "Internal error occured please try later.", data : null, status:500, error: "internal error occured" });
    }
};