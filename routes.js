const express = require('express')
const routes = express.Router()
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

loadDatabase()

global.AccessToken = 'x-access-token'

rotaUser = require('./src/routes/Users')

routes.use(rotaUser)

module.exports = routes;

function loadDatabase() {

    const Users = require('./src/models/Users')
}
