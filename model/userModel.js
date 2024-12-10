const Sequelize = require('sequelize');
const sequelize = require('../utills/database');


const users = sequelize.define("users",{

      user_id: {
        type: Sequelize.UUID,
        defaultValue : Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM("Admin","Editer","Viewer"),
        allowNull: false,
        defaultValue: 'Viewer',
      },
},
);


module.exports = users;