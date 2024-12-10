const Sequelize = require('sequelize');
const sequelize = require('../utills/database');


const artists = sequelize.define("artists",{

      artist_id: {
        type: Sequelize.UUID,
        defaultValue : Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      grammy: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      hidden: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
},
{
    paranoid: true,
}
);


module.exports = artists;