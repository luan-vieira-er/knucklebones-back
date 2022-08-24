require('dotenv').config()
const cors = require('cors');

var express = require('express')
const app = express()
port = process.env.PORT || 3000;

console.log(port)

const routes = require('./routes');
const bodyParser = require("body-parser")
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

app.use(bodyParser.json({limit: '200mb', extended: true, parameterLimit:50000}))
app.use(bodyParser.urlencoded({limit: '200mb', extended: true, parameterLimit:50000}))
app.use(bodyParser.text({limit: '200mb', extended: true, parameterLimit:50000}))

const corsOptions = {
    exposedHeaders: 'refreshtoken',
};  
app.use(cors(corsOptions));

app.use(routes)

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}/`)
});