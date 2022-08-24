const config = require('../../config.json')
//const jwt_decode = require('jwt-decode')

const { getDadosToken } = require('../js/util')

const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(config.database, config.user, config.password, {
    host: config.host,
    dialect: 'postgres',
    protocol: 'postgres'
  });

const bcrypt = require('bcrypt');
const ModelUsers = require("../models/Users")
require('dotenv/config');

const util = require('../js/util')

function emailValido (email) {
  const regexEmail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return regexEmail.test(email)
}

function loginValido (login) {
  // const regexLogin = /^(?=[a-zA-Z0-9._]{8,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/ // Regex com minimo 8 letras
  const regexLogin = /^(?=[a-zA-Z0-9._]{4,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/
  return regexLogin.test(login)
}

async function createUser (req,res) {
  let body = req.body

  if(!body.login)
    return res.status(400).send('Login não informado')
  
  if(!body.email)
    return res.status(400).send('E-mail não informado')

  if (!loginValido(body.login.trim()))
    return res.status(400).send('Login inválido.')
  
  if (!emailValido(body.email.trim())) 
    return res.status(400).send('E-mail inválido.')
  
  if(!body.senha || !body.senhaConfirm)
    return res.status(400).send('Senhas não informadas')
  
  let Usuario = await ModelUsers.findOne({
    where:{
      login: body.login.trim()
    }
  })    
    
  if(Usuario){
    res.status(400).send('Nome de usuário já está em uso.')
    return
  }  

  Usuario = await ModelUsers.findOne({
    where:{
      email: body.email
    }
  })  

  if(Usuario){
    res.status(400).send('Email já cadastrado')
    return
  }
  
  const t = await sequelize.transaction({})
  try{    
    let senha = bcrypt.hashSync(body.senha, '$2b$10$H/dMXXSrF2DXpqq23LSzIO')
    
    Usuario = await ModelUsers.schema(body.schema).create({
      login: body.login.trim(),
      senha: senha,
      email: body.email,
      status: 'P'
    }, {transaction:t})    
    
    await t.commit()
    res.status(200).send(Usuario)

  }catch(err){
    console.log(err)
    await t.rollback()
    res.status(400).send('Erro ao cadastrar usuário')
  }

}

async function readUsers (req,res) {

    ModelUsers.findAll({
      attributes: ['id','login','email', 'status'],
      where: {
      }
    }).then(dados => {
        res.send(dados)
    }).catch(err => {
        res.status(400).send(err)
    })
}

async function readOneUser (req,res) {
  let body = req.body

  if(!body.id){
    res.status(400).send('Usuário não informado')
    return
  }

  ModelUsers.findOne({
    attributes: ['id','login','email', 'status'],
    where: {
      id: body.id
    }
  }).then(response => {
    res.send(response)
  }).catch(err => {
    res.status(400).send(err)
  })
}

async function updateUser (req,res) {
  let body = req.body

  
  if(!body.id){
    res.status(400).send('Usuário não informado')
    return
  }
    
  let User = await ModelUsers.findOne({
    where: {
      id: body.id
    }
  })

  if(!User){
    res.status(400).send('Usuário não encontrado')
    return
  }
  
  const t = await sequelize.transaction({})
  try{
    Usuario.login = body.login.trim()

    await Usuario.save({transaction:t})
    await t.commit()
    res.send('Dados atualizados')
  }catch(err){
    console.log(err)
    await t.rollback()
    res.status(400).send('Erro ao atualizar perfil do usuário')
  }
  return

}

async function deleteUser (req,res) {

  let body = req.body

  if(!body.id){
    res.status(400).send('Usuário não informado')
    return
  }

  const t = await sequelize.transaction({})

  try {
    let User = await ModelUsers.findOne({
      where: {
        id: body.id
      }
    }, { transaction: t} )
  
    if(!User){
      res.status(400).send('Usuário não encontrado')
      return
    }
  
    await User.destroy({ transaction: t})
    await t.commit()
    res.status(200).send('Usuário deletado com sucesso')
  } catch (error) {
    await t.rollback()
    res.status(400).send('Erro ao deletar usuário')
  }

}

async function approveUser(req, res){       
  const t = await sequelize.transaction({})
  try {
    let body = req.body

    if (!body.id) return res.status(400).send('Informe o id')
    
    let User = await ModelUsers.findOne({
      attributes: ['id','login','email'],
      where:{
        id: body.id
      }
    }, {transaction: t})
    
    if(!User) return res.status(400).send('Usuário não localizado.')
    if(User.status == 'A') return res.status(400).send('Usuário já está ativo.')

    User.status = 'A'
    await User.save({transaction: t})
    await t.commit()
    return res.status(200).send(User)
  } catch (error) {
    console.log(error)
    await t.rollback()
    return res.status(400).send(error)
  }
}

async function disapproveUser(req, res){       
  const t = await sequelize.transaction({})
  try {
    let body = req.body

    if (!body.id) return res.status(400).send('Informe o id')
    
    let User = await ModelUsers.findOne({
      attributes: ['id','login','email'],
      where:{
        id: body.id
      }
    }, {transaction: t})
    
    if(!User) return res.status(400).send('Usuário não localizado.')
    if(User.status == 'I') return res.status(400).send('Usuário já está inativo.')

    User.status = 'I'
    await User.save({transaction: t})
    await t.commit()
    return res.status(200).send(User)
  } catch (error) {
    console.log(error)
    await t.rollback()
    return res.status(400).send(error)
  }
}

async function login(req, res){       
  try {
    let body = req.body

    if (!body.login) return res.status(400).send('Informe o login')
    
    if (!body.senha) return res.status(400).send('Informe a senha')

    if(body.senha.trim().length <= 0) return res.status(400).send('Senha não informada.')
    
    let User = await ModelUsers.findOne({
      attributes: ['id','login','email'],
      where:{
        login: body.login.trim()
      }
    })
    
    if(!User) return res.status(400).send('Usuário não localizado.')

    if(User.status == 'I') return res.status(400).send('Usuário está inativo.')

    let UserSenha = await ModelUsers.findOne({
      attributes: ['senha'],
      where:{
        login: body.login.trim()
      }
    })
    
    if(!bcrypt.compareSync(body.senha, UserSenha.senha)) return res.status(400).send('Usuário/Senha incorreto.')

    let key = util.genKey(16)          
    let token = util.getToken(User.id, key)    
    let dados =  {
      token:token
    }
    return res.status(200).send({
      dados:dados,
      user: User
    })

    return res.status(200).send(User)
  } catch (error) {
    console.log(error)
    return res.status(400).send(error)
  }
}

async function logout (req, res){
  let dados = getDadosToken(req, res)
  if(dados){           
    let token = getInvalidToken(dados.id, dados.key) 
    res.send({token: token})
  }else{
    res.status(400).send('Sessão expirada')
  }
}

async function validarSessao(req, res){

  var dadosToken = getDadosToken(req, res)

  try {
    
    let User = await ModelUsers.findOne({
      attributes: ['id','login','email'],
      where:{
        id: dadosToken.id
      }
    })
    
    if(!User) return res.status(400).send('Usuário não localizado.')

    return res.status(200).send({
      dados:dadosToken,
      user: User
    })
  } catch (error) {
    console.log(error)
    return res.status(400).send(error)
  }
}

async function userLogado(req, res){

  var dadosToken = getDadosToken(req, res)

  try {
    
    let User = await ModelUsers.findOne({
      attributes: ['id','login','email'],
      where:{
        id: dadosToken.id
      }
    })
    
    if(!User) return res.status(400).send('Usuário não localizado.')

    return res.status(200).send({
      dados:dadosToken,
      user: User
    })
  } catch (error) {
    console.log(error)
    return res.status(400).send(error)
  }
}

module.exports = { 
    createUser,   //C
    readUsers,    //R
    readOneUser,  //R
    updateUser,   //U
    deleteUser,   //D
    
    login,
    logout,
    approveUser,
    disapproveUser,
    validarSessao,
    userLogado

    // D - deleteUsuario
    // login,
    // logout  
}