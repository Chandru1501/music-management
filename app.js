require('dotenv').config();

const express = require('express');

const app = express();

const sequelize = require('./utills/database');

const bodyParser = require('body-parser');

const cors = require('cors');

const userModel = require('./model/userModel');

const albumModel = require('./model/albumModel');

const artistModel = require('./model/artistModel');

const trackModel = require('./model/trackModel');

const favoriteModel = require('./model/favoriteModel');

const userRoutes = require('./routes/userRoutes');

const albumRoutes = require('./routes/albumRoutes');

const artistRoutes = require('./routes/artistRoutes');

const trackRoutes = require('./routes/trackRoutes');

const favoriteRoutes = require('./routes/favoriteRoutes');

const commonRoutes = require('./routes/commonRoutes');

app.use(bodyParser.urlencoded({
    extended : false
}));
    
app.use(bodyParser.json());

const corsOptions = {
    // origin: [],
    origin: "*",
    methods: ["GET", "POST", "PUT", "OPTION", "HEAD", "PATCH", "DELETE"],
    allowedHeaders: ["Accept", "Content-Type", "Authorization", "device"],
    credentials: true,
  };
  
app.use(cors(corsOptions));

app.use('/api/v1/albums',albumRoutes);
app.use('/api/v1/artists',artistRoutes);
app.use('/api/v1/tracks',trackRoutes);
app.use('/api/v1/favorites',favoriteRoutes);
app.use('/api/v1/users',userRoutes);
app.use('/api/v1/',commonRoutes);

userModel.hasMany(favoriteModel,{ foreignKey: 'userId', allowNull: false });

artistModel.hasMany(albumModel,{ foreignKey: 'artistId', allowNull: false });

albumModel.belongsTo(artistModel,{ foreignKey: 'artistId', allowNull: false });

artistModel.hasMany(trackModel,{ foreignKey: 'artistId', allowNull: false });

trackModel.belongsTo(artistModel,{ foreignKey: 'artistId', allowNull: false });

albumModel.hasMany(trackModel,{ foreignKey: 'albumId', allowNull: false } );

trackModel.belongsTo(albumModel,{ foreignKey: 'albumId', allowNull: false } );

favoriteModel.belongsTo(artistModel, { foreignKey: 'item_id', constraints: false });

favoriteModel.belongsTo(albumModel, { foreignKey: 'item_id', constraints: false });

favoriteModel.belongsTo(trackModel, { foreignKey: 'item_id', constraints: false });

// sequelize.sync({ force : true })
sequelize.sync()
.then(()=>{
  app.listen(8000,()=>{
        console.log("This server is running on port 8000");
  })
})
.catch((err)=>{
  console.log(err);
  console.log("some error occured");
});