var pg = require('pg');
pg.defaults.ssl = true;

const { Sequelize } = require('sequelize');
const config = require('../../config.json')

const Users = require('../models/Users');
const Match = require('../models/Match');

const sequelize = new Sequelize(config.database, config.user, config.password, {
    host: config.host,
    dialect: 'postgres',
    protocol: 'postgres'
  });

const MatchEvents = sequelize.define('match_events', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    match_id: {
        type: Sequelize.INTEGER,
            references: {
                model: Match,
                key: 'id'
            },
    },
    player: {
        type: Sequelize.INTEGER,
            references: {
                model: Users,
                key: 'id'
            },
    },
    dice: {
        type: Sequelize.INTEGER,
    },
    column: {
        type: Sequelize.STRING,
    },
    description: {
        type: Sequelize.STRING,
    },
}, {
    tableName: 'match_events',
    timestamps: false,
}, {
    // For the sake of clarity we specify our indexes
    indexes: [{ unique: true, fields: ['id'] }]
})

MatchEvents.belongsTo(Match, { foreignKey: 'match_id', targetKey: 'id', hooks: true, unique: false })
MatchEvents.belongsTo(Users, { foreignKey: 'player', targetKey: 'id', hooks: true, unique: false })

MatchEvents.sync({ force: false, alter: process.env.alter == 'true' ? true : false }).then(async(dados) => {
    console.log(dados, 'Table MatchEvents loaded successfuly');
});

module.exports = MatchEvents;