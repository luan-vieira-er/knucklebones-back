var pg = require('pg');
pg.defaults.ssl = true;

const { Sequelize } = require('sequelize');
const config = require('../../config.json')

const sequelize = new Sequelize(config.database, config.user, config.password, {
    host: config.host,
    dialect: 'postgres',
    protocol: 'postgres'
  });

const Users = sequelize.define('users', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    login: {
        type: Sequelize.STRING
    },
    senha: {
        type: Sequelize.STRING
    },
    email:{
        type: Sequelize.STRING,
        unique: true,
    },
    status:{
        /* A - Ativo */
        /* I - Inativo */
        /* P - Pendente */
        type: Sequelize.STRING,
    },
}, {
    tableName: 'users',
    timestamps: false,
}, {
    // For the sake of clarity we specify our indexes
    indexes: [{ unique: true, fields: ['id'] }]
})

Users.sync({ force: false, alter: process.env.alter == 'true' ? true : false }).then(async(dados) => {
    console.log(dados, 'Table Users loaded successfuly');
});

module.exports = Users;