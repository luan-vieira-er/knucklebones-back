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

const Board = sequelize.define('board', {
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
    p1_A1:{
        type: Sequelize.INTEGER,
        defaultValue: null
    },
    p1_A2:{
        type: Sequelize.INTEGER,
        defaultValue: null
    },
    p1_A3:{
        type: Sequelize.INTEGER,
        defaultValue: null
    },
    p1_B1:{
        type: Sequelize.INTEGER,
        defaultValue: null
    },
    p1_B2:{
        type: Sequelize.INTEGER,
        defaultValue: null
    },
    p1_B3:{
        type: Sequelize.INTEGER,
        defaultValue: null
    },
    p1_C1:{
        type: Sequelize.INTEGER,
        defaultValue: null
    },
    p1_C2:{
        type: Sequelize.INTEGER,
        defaultValue: null
    },
    p1_C3:{
        type: Sequelize.INTEGER,
        defaultValue: null
    },
    p2_A1:{
        type: Sequelize.INTEGER,
        defaultValue: null
    },
    p2_A2:{
        type: Sequelize.INTEGER,
        defaultValue: null
    },
    p2_A3:{
        type: Sequelize.INTEGER,
        defaultValue: null
    },
    p2_B1:{
        type: Sequelize.INTEGER,
        defaultValue: null
    },
    p2_B2:{
        type: Sequelize.INTEGER,
        defaultValue: null
    },
    p2_B3:{
        type: Sequelize.INTEGER,
        defaultValue: null
    },
    p2_C1:{
        type: Sequelize.INTEGER,
        defaultValue: null
    },
    p2_C2:{
        type: Sequelize.INTEGER,
        defaultValue: null
    },
    p2_C3:{
        type: Sequelize.INTEGER,
        defaultValue: null
    },
}, {
    tableName: 'board',
    timestamps: false,
}, {
    // For the sake of clarity we specify our indexes
    indexes: [{ unique: true, fields: ['id'] }]
})

Board.belongsTo(Match, { foreignKey: 'match_id', targetKey: 'id', hooks: true, unique: true })
Board.belongsTo(Users, { foreignKey: 'player1', targetKey: 'id', hooks: true, unique: false })
Board.belongsTo(Users, { foreignKey: 'player2', targetKey: 'id', hooks: true, unique: false })

Board.sync({ force: false, alter: process.env.alter == 'true' ? true : false }).then(async(dados) => {
    console.log(dados, 'Table Board loaded successfuly');
});

module.exports = Board;