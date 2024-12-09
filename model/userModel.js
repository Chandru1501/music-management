const Sequelize = require('sequelize');
const sequelize = require('../utills/database');


const users = sequelize.define("users",{

      user_id: {
        // type: Sequelize.INTEGER,
        type: Sequelize.UUID,
        defaultValue : Sequelize.UUIDV4,
        // autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        // unique : true
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
// {
//     paranoid: true,
// }
);


module.exports = users;