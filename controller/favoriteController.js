const userModel = require('../model/userModel');
const artistModel = require('../model/artistModel');
const albumModel = require('../model/albumModel');
const trackModel = require('../model/trackModel');
const favoriteModel = require('../model//favoriteModel');
const functions = require('../middlewares/functions.js');

const categoryMapping = {
    artist: artistModel,
    album: albumModel,
    track: trackModel
};

const categoryKeyMapping = {
    artist: 'artist_id',
    album: 'album_id',
    track: 'track_id'
};

exports.addToFav = async (req,res,next) => {
    try {
        console.log(req.body);
        const reqUserId = req?.user?.id;
        const user = await userModel.findOne({ where : { user_id : reqUserId }});
        console.log(user);
        if(user){
            const { category, item_id } = req?.body;
            const requiredParams = ['category', 'item_id'];
            const missingParams = functions.checkMissingParams(requiredParams, req.body);
            if (missingParams?.length > 0) { 
                return res.status(400).json({ message: `Bad request. Reason : ${missingParams?.toString()}.`, status:400, error:null, data:null });
            }
            if(category !== 'artist' && category !== 'album' && category !== 'track'){
                return res.status(400).json({ message: `Bad request. Reason : category must be artist or album or track.`, status:400, error:null, data:null });
            }
            const checkExist = await favoriteModel.findOne({ 
                where : { item_id : item_id, userId : user?.user_id }
            });
            console.log(checkExist);
            if(checkExist){
                return res.status(400).json({ message: `Bad request. Reason : favorite already exist`, status:400, error:null, data:null });
            }
            const item = await categoryMapping[category].findOne({ where : { [categoryKeyMapping[category]] : item_id }}); 
            console.log(item);
            if(!item){
                return res.status(404).json({ message: `Resource doesn't exist.`, status:404, error:null, data:null });
            } else {
                const addFavi = await favoriteModel.create({
                    category : category,
                    item_id  : item_id,
                    userId : user?.user_id
                });
                console.log(addFavi);
                res.status(201)
                .json({ message: "Favorite added succesfully.", status: 201, data:null, error:null });
            }
        } else {
            return res.status(403)
            .json({ message: `Forbidden Access/Operation not allowed.`, status:403, error:null, data:null });  
        }
    } catch (err) {
        console.log(err);
        res
        .status(500)
        res.status(500).json({ message : "Internal error occured please try later.", data : null, status:500, error: "internal error occured" });
    }
}


exports.getAllFav = async (req,res,next) => {
    try {
        const reqUserId = req?.user?.id;
        const user = await userModel.findOne({ where : { user_id : reqUserId }});
        console.log(user);
        if(user){
            const category = req?.params?.category;
            if(category !== 'artist' && category !== 'album' && category !== 'track'){
                res.status(400).json({ message: `Bad request. Reason : category must be artist or album or track.`, status:400, error:null, data:null });
            } else {
                const categoryMapping = {
                    artist: artistModel,
                    album: albumModel,
                    track: trackModel
                };
                const favorites = await favoriteModel.findAll({ 
                    where : { category : category, userId : user?.user_id },
                    attributes : ['favorite_id','category','item_id','createdAt'],
                    include : {
                        model : categoryMapping[category],
                        attributes : ['name']
                    }
                });
                console.log(favorites);
                const response = favorites.map((favorite) => {
                    const associatedModel = favorite[favorite.category];
                    return {
                    favorite_id : favorite?.favorite_id,
                    category : favorite?.category,
                    item_id : favorite?.item_id,
                    name : associatedModel?.name,
                    createdAt : favorite?.createdAt
                   }
                });
                res.status(201)
                .json({ message: "Favorites fetched succesfully.", status: 201, data:response, error:null });
            }
        } else {
            return res.status(403)
            .json({ message: `Forbidden Access/Operation not allowed.`, status:403, error:null, data:null });  
        }
    } catch (err) {
        console.log(err);
        res
        .status(500)
        res.status(500).json({ message : "Internal error occured please try later.", data : null, status:500, error: "internal error occured" });
    }
}


exports.removeFromFav = async (req,res,next) => {
    try {
        const reqUserId = req?.user?.id;
        const user = await userModel.findOne({ where : { user_id : reqUserId }});
        console.log(user);
        if(user){
            const favoriteId = req?.params?.favoriteId;
            const deleteFav = await favoriteModel.destroy({ where : { favorite_id : favoriteId }});
            console.log(deleteFav);
            if(deleteFav){
                res.status(200)
                .json({ message: "Favorites fetched succesfully.", status: 200, data:null, error:null });
            } else {
                return res.status(404)
                .json({ message: `Favorite doesn't exist.`, status:404, error:null, data:null });
            }
        } else {
            return res.status(403)
            .json({ message: `Forbidden Access/Operation not allowed.`, status:403, error:null, data:null });  
        }
    } catch (err) {
        console.log(err);
        res
        .status(500)
        res.status(500).json({ message : "Internal error occured please try later.", data : null, status:500, error: "internal error occured" });
    }
}