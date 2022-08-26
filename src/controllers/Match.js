const config = require('../../config.json')

const { getDadosToken } = require('../js/util')

const { Sequelize, where } = require('sequelize');
const sequelize = new Sequelize(config.database, config.user, config.password, {
    host: config.host,
    dialect: 'postgres',
    protocol: 'postgres'
  });

const ModelUsers = require("../models/Users")
const ModelMatch = require("../models/Match")
const ModelMatchEvents = require("../models/MatchEvents")
const ModelBoard = require("../models/Board")
require('dotenv/config');

const util = require('../js/util');
const { Op } = require('sequelize');

async function createMatch (req,res) {
  let body = req.body

  let dataAtual = new Date();
  dataAtual.setHours(dataAtual.getHours() - 3);
  console.log(dataAtual)

  if(!body.player)
    return res.status(400).send('Player não informado')

    let Player = await ModelUsers.findOne({
      attributes: ['id',],
      where: {
        id: body.player
      }
    })

  if(!Player)
    return res.status(400).send('Player não encontrado')
  
  const t = await sequelize.transaction({})
  try{

    let newToken = util.newMatchToken()
    if (!util.validateMatchToken(newToken)) {
      await t.rollback()
      return res.status(400).send('Não foi possível gerar um token válido')
    }
    
    let Match = await ModelMatch.create({
      player1: Player.id,
      token: newToken,
      data: dataAtual
    }, {transaction:t})

    let Board = await ModelBoard.create({
      match_id: Match.id,
      player1: Player.id
    }, {transaction:t})    

    let Event = await ModelMatchEvents.create({
      match_id: Match.id,
      player: Player.id,
      description: 'Partida Criada'
    }, {transaction:t})  
    
    await t.commit()
    res.status(200).send(Match)

  }catch(err){
    console.log(err)
    await t.rollback()
    res.status(400).send('Erro ao criar partida')
  }

}

async function readMatches (req,res) {

    let wherePlayer1 = {}
    let wherePlayer2 = {}
    if (req.body.player1 && !req.body.player2) {
      wherePlayer1 = {
        player1: req.body.player1
      }
      wherePlayer2 = {
        player2: req.body.player1
      }
    }
    if (req.body.player2 && !req.body.player1) {
      wherePlayer1 = {
        player1: req.body.player2
      }
      wherePlayer2 = {
        player2: req.body.player2
      }
    }
    // if (req.body.player1 && req.body.player2) {
    //   wherePlayer1 = {
    //     player1: req.body.player1
    //   }
    //   wherePlayer2 = {
    //     player2: req.body.player1
    //   }
    // }



    ModelMatch.findAll({
      attributes: ['id','data','player1', 'player2'],
      where: {
        [Op.or]: [wherePlayer1, wherePlayer2]
      }
    }).then(dados => {
        res.send(dados)
    }).catch(err => {
      console.log(err)
        res.status(400).send(err)
    })
}

async function readOneMatch (req,res) {
  let body = req.body

  if(!body.id){
    res.status(400).send('Id não informado')
    return
  }

  let Match = await ModelMatch.findOne({
    where: {
      id: body.id
    }
  })

  if(!Match){
    res.status(400).send('Id não informado')
    return
  }

  let Events = await ModelMatchEvents.findAll({
    where: {
      match_id: body.id
    }
  })

  let Board = await ModelBoard.findOne({
    where: {
      match_id: body.id
    }
  })

  let ResponseObject = {
    Match: Match,
    Board: Board,
    Events: Events
  }

  res.send(ResponseObject)
}

async function connectMatch (req,res) {
  let body = req.body

  
  if(!body.token){
    res.status(400).send('Token não informado')
    return
  }

  if(!body.player){
    res.status(400).send('Player não informado')
    return
  }
    
  let Match = await ModelMatch.findOne({
    where: {
      token: body.token
    }
  })

  if(!Match){
    res.status(400).send('Partida não encontrada')
    return
  }
  
  const t = await sequelize.transaction({})
  try{
    Match.player2 = body.player
    Match.status = 1

    let player_turno = Math.random() * (2 - 1) + 1;
    if (player_turno == 1) {
      Match.player_turno = Match.player1
    } else {
      Match.player_turno = Match.player2
    }

    await Match.save({transaction:t})

    let Event = await ModelMatchEvents.create({
      match_id: Match.id,
      player: Match.player2,
      description: 'Jogador conectado'
    }, {transaction:t})  

    let Board = await ModelBoard.findOne({
      where: {
        match_id: Match.id
      }
    }, {transaction:t})  

    Board.player2 = Match.player2

    await Board.save({transaction:t})

    await t.commit()
    res.send('Jogador conectado com sucesso')
  }catch(err){
    console.log(err)
    await t.rollback()
    res.status(400).send('Erro ao conectar')
  }
  return

}


module.exports = { 
    createMatch,   //C
    readMatches,    //R
    readOneMatch,  //R
    connectMatch
    // deleteUser,   //D
}