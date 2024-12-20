const Sequelize = require('sequelize');
const sequelize = require('../utills/database');


const albums = sequelize.define("albums",{

     album_id: {
        type: Sequelize.UUID,
        defaultValue : Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      year: {
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


module.exports = albums;