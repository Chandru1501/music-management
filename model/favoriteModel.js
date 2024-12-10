const Sequelize = require('sequelize');
const sequelize = require('../utills/database');


const favorites = sequelize.define("favorites",{

        favorite_id: {
        type: Sequelize.UUID,
        defaultValue : Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      category : {
        type : Sequelize.ENUM('artist','album','track'),
        allowNull : false
      },
      item_id : {
        type: Sequelize.UUID,
        allowNull: false,
      }

},
);


module.exports = favorites;