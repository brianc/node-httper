var express = require('express')
var app = module.exports = express()
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')

app.use(bodyParser.json())
app.use(cookieParser())

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
echo('patch')

app.post('/login', function(req, res, next) {
  res.cookie('auth', {username: req.body.username})
  res.status(200).end()
})

app.get('/secure', function(req, res, next) {
  if(!req.cookies.auth) {
    return res.status(401).end()
  }
  return res.send({username: req.cookies.auth.username})
})

app.get('/only-accept-testing-header', function(req, res, next) {
  var good = (req.headers['content-type']||'').indexOf('testing') > -1
  return res.status(good ? 200 : 501).end()
})
