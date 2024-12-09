const Sequelize = require('sequelize');
const sequelize = require('../utills/database');


const tracks = sequelize.define("tracks",{

      track_id: {
        type: Sequelize.INTEGER,
        // type: Sequelize.UUID,
        // defaultValue : Sequelize.UUIDV4,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
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


module.exports = tracks;