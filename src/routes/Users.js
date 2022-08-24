const express = require('express')
const routes = express.Router()
const Users = require('../controllers/Users')

const { validatedRoute, refreshToken } = require('../js/util')

routes.post('/users/create', Users.createUser)
routes.post('/users/readone', Users.readOneUser)
routes.post('/users/read', Users.readUsers)
routes.post('/users/update', Users.updateUser)
routes.post('/users/delete', Users.deleteUser)
routes.post('/users/login', Users.login)
routes.post('/users/logout', Users.logout)
routes.post('/users/approve', Users.approveUser)
routes.post('/users/disapprove', Users.disapproveUser)
routes.get('/users/logado', validatedRoute, refreshToken, Users.userLogado)

routes.get('/validarsessao', validatedRoute, refreshToken, Users.validarSessao)


module.exports = routes 