const jwt = require('jsonwebtoken');
const jwt_decode = require("jwt-decode")

require('dotenv/config');
const ModelUsers = require("../models/Users")

newMatchToken = () => {
  var TokenGenerator = require( 'token-generator' )({
    salt: 'knuckle',
    timestampMap: 'abcdefghij', // 10 chars array for obfuscation proposes
  });
  var token = TokenGenerator.generate();
  return token
}

validateMatchToken = (token) => {
  var TokenGenerator = require( 'token-generator' )({
    salt: 'knuckle',
    timestampMap: 'abcdefghij', // 10 chars array for obfuscation proposes
  });
  return TokenGenerator.isValid(token)
}

getToken = (id, key) => {
  let token = jwt.sign({ 'id': id, keyCache: key }, process.env.SECRET, {
    expiresIn: '600s' // 600 segundos = 10 minutos
  });
  return token
}

getOtherToken = (id, key, time) => {
    let token = jwt.sign({'id': id, keyCache: key }, process.env.SECRET, {
      expiresIn: time
    });
    return token
  }
  
getInvalidToken = (id, key) => {
    let token = jwt.sign({'id': id, keyCache: key }, process.env.SECRET, {
        expiresIn: -1
    });
    return token
}

refreshToken = (req, res, next) => {
    let token = req.headers['x-access-token'];
  
    if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });
  
    jwt.verify(token, process.env.SECRET, function (err, decoded) {
      if (err) return res.status(500).json({ auth: false, message: err });// 'Failed to authenticate token.' });
      token = jwt.sign({ id: decoded.id, keyCache: decoded.key }, process.env.SECRET, {
        expiresIn: '600s' // 600 segundos = 10 minutos
      });
      res.setHeader("refreshtoken", token)
  
      //res.locals.__sessDiplomaDigitalAVMB = token;
      next();
    });
  }

validatedRoute = (req, res, next) => {
    const token = req.headers[global.AccessToken];

    if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });
    var dadosToken = jwt_decode(token)
    console.log(dadosToken)
    ModelUsers.findOne({
        where: {
            id: dadosToken.id
        }
    }).then(Usuario => {
        if (!Usuario) {
            return res.status(400).json({ auth: false, message: 'Usuário não encontrado' });
        }
        if (Usuario.status != 'A') {
            return res.status(400).json({ auth: false, message: 'Usuário não está ativo' });
        }


        jwt.verify(token, process.env.SECRET, function (err) {
        if (err) return res.status(500).json({ auth: false, message: err });// 'Failed to authenticate token.' });      
        next();
        });
    })

}

genKey = (length) => {
    var ret = "";
    while (ret.length < length) {
      ret += Math.random().toString(16).substring(2);
    }
    return ret.substring(0, length);
  }
  
  
  
getDadosToken = (req, res) => {
    let token = req.headers[global.AccessToken]
    console.log(token)
    return jwt.verify(token, process.env.SECRET, function (err, decoded) {
        if (err) return res.status(500).json({ auth: false, message: err });// 'Failed to authenticate token.' });      
        return decoded
    });
}

module.exports = {
    validatedRoute, getToken, refreshToken, getDadosToken, genKey, getInvalidToken, getOtherToken, newMatchToken, validateMatchToken
  }