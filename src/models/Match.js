var pg = require('pg');
pg.defaults.ssl = true;

const { Sequelize } = require('sequelize');
const config = require('../../config.json')

const Users = require('../models/Users');

const sequelize = new Sequelize(config.database, config.user, config.password, {
    host: config.host,
    dialect: 'postgres',
    protocol: 'postgres'
  });

const Match = sequelize.define('match', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    player1: {
        type: Sequelize.INTEGER,
            references: {
                model: Users,
                key: 'id'
            },
    },
    player2: {
        type: Sequelize.INTEGER,
            references: {
                model: Users,
                key: 'id'
            },
    },
    player_turno:{
        type: Sequelize.INTEGER,
    },
    player_vencedor: {
        type: Sequelize.INTEGER,
            references: {
                model: Users,
                key: 'id'
            },
    },
    token:{
        type: Sequelize.STRING,
        unique: true,
    },
    status:{
        /* 0 - Criado, aguardando player 2 */
        /* 1 - Partida em andamento */
        /* 2 - Partida Finalizada */
        /* 3 - Partida Expirada */
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    roladas: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    data: {
        type: Sequelize.DATE
    }
}, {
    tableName: 'match',
    timestamps: false,
}, {
    // For the sake of clarity we specify our indexes
    indexes: [{ unique: true, fields: ['id'] }]
})

Match.belongsTo(Users, { foreignKey: 'player1', targetKey: 'id', hooks: true, unique: false })
Match.belongsTo(Users, { foreignKey: 'player2', targetKey: 'id', hooks: true, unique: false })
Match.belongsTo(Users, { foreignKey: 'player_vencedor', targetKey: 'id', hooks: true, unique: false })

Match.sync({ force: false, alter: process.env.alter == 'true' ? true : false }).then(async(dados) => {
    console.log(dados, 'Table Match loaded successfuly');
});

module.exports = Match;