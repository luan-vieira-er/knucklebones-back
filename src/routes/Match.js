const express = require('express')
const routes = express.Router()
const Match = require('../controllers/Match')

const { validatedRoute, refreshToken } = require('../js/util')

routes.post('/match/create', Match.createMatch)
routes.post('/match/readone', Match.readOneMatch)
routes.post('/match/read', Match.readMatches)
// routes.post('/users/update', Users.updateUser)
// routes.post('/users/delete', Users.deleteUser)
// routes.post('/users/login', Users.login)
// routes.post('/users/logout', Users.logout)
// routes.post('/users/approve', Users.approveUser)
// routes.post('/users/disapprove', Users.disapproveUser)
// routes.get('/users/logado', validatedRoute, refreshToken, Users.userLogado)


module.exports = routes 