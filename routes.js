const express = require('express')
const routes = express.Router()
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

loadDatabase()

global.AccessToken = 'x-access-token'

rotaUser = require('./src/routes/Users')
rotaMatch = require('./src/routes/Match')

routes.use(rotaUser)
routes.use(rotaMatch)

module.exports = routes;

function loadDatabase() {

    const Users = require('./src/models/Users')
    const Match = require('./src/models/Match')
}
