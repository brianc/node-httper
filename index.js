var http = require('http')

var Client = function(app) {
  this.app = app
  this.server = null
  this.start = this.start.bind(this)
  this.stop = this.stop.bind(this)
  this.get = this.req.bind(this, 'GET')
  this.post = this.req.bind(this, 'POST')
  this.put = this.req.bind(this, 'PUT')
  this.delete = this.req.bind(this, 'DELETE')
  this.head = this.req.bind(this, 'HEAD')
}

Client.prototype.start = function(cb) {
  var self = this
  this.server = http.createServer(this.app)
  this.server.listen(function() {
    cb(null, self)
  })
}

Client.prototype.stop = function(cb) {
  this.server.close(cb)
}

Client.prototype.url = function(path) {
  if(typeof this.app == 'string') {
    return this.app + path
  }
  return 'http://localhost:' + this.server.address().port + path
}

Client.prototype.req = function(method, path, options, cb) {
  if(typeof options == 'function') {
    cb = options
    options = {}
  }
  options.method = method
  options.url = this.url(path)
  httpTest.request(options, cb)
}

var httpTest = module.exports = function(app, cb) {
  var client = new Client(app)
  if(cb) {
    client.start(cb)
  }
  return client
}

httpTest.request = require('request')
