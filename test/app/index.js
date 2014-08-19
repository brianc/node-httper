var express = require('express')
var app = module.exports = express()
var bodyParser = require('body-parser')

app.use(bodyParser.json())

app.get('/204', function(req, res, next) {
  res.status(204).end()
})

var echo = function(method) {
  app[method].call(app, '/echo', function(req, res, next) {
    res.send({name: req.body.name})
  })
}

echo('post')
echo('put')
echo('delete')
