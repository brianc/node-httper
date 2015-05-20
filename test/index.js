var httping = require('../')
var assert = require('assert')

describe('httping', function() {
  it('works via callback', function(done) {
    httping(require('./app'), function(err, app) {
      assert.ifError(err, 'should not have an error starting')
      assert(app, 'should callback with an app')
      app.stop(done)
    })
  })

  describe('round trip', function() {
    before(function(done) {
      this.app = httping(require('./app'), done)
    })

    after(function(done) {
      this.app.stop(done)
    })

    it('works', function(done) {
      this.app.get('/204', function(err, res) {
        assert.ifError(err, 'should not return error')
        assert.equal(res.statusCode, 204)
        done()
      })
    })
  })

  describe('different usage pattern', function() {
    var app = httping(require('./app'))
    before(app.start)
    after(app.stop)

    var methods = ['post', 'put', 'delete', 'patch']
    methods.forEach(function(method) {
      it('can ' + method, function(done) {
        var json = {name: 'brian ' + method}
        app[method]('/echo', {json: json}, function(err, res, body) {
          assert.equal(body.name, json.name)
          done()
        })
      })
    })
  })

  describe('root url', function() {
    it('can make request to string url', function(done) {
      var headers = {
        'accept-encoding': 'text/html'
      }
      var client = httping('https://github.com')
      client.get('/', {headers: headers}, function(err, res) {
        assert.ifError(err, 'request to google failed')
        assert.equal(res.statusCode, 200)
        done()
      })
    })
  })

  describe('unauthenticated', function() {
    var client = httping(require('./app'))
    before(client.start)
    after(client.stop)

    it('wont log in without being configured', function(done) {
      client.get('/secure', function(err, res) {
        if(err) return done(err)
        assert.equal(res.statusCode, 401)
        done()
      })
    })
  })

  describe('authentication', function() {
    var client = httping(require('./app'))
    before(client.start)
    after(client.stop)

    it('authenticates', function(done) {
      client.post('/login', {json: {username: 'Bob'}}, function(err, res) {
        assert.equal(res.statusCode, 200)
        done()
      })
    })

    it('works', function(done) {
      client.get('/secure', function(err, res) {
        assert.equal(res.statusCode, 200)
        done()
      })
    })
  })

  describe('before callback', function() {
    var client = httping(require('./app'))
    before(client.start)
    after(client.stop)

    it('calls the callback with options', function(done) {
      client.before = function(options) {
        assert.equal(options.method, 'GET')
        done()
      }
      client.get('/', function() {})
    })

    it('without header we get 501', function(done) {
      client.before = function() {}
      client.get('/only-accept-testing-header', function(err, res) {
        assert.equal(res.statusCode, 501)
        done()
      })
    })

    it('passes the options to the request', function(done) {
      client.before = function(options) {
        options.headers = options.headers || {}
        options.headers['content-type'] = 'text/testing'
      }
      client.get('/only-accept-testing-header', function(err, res) {
        assert.ifError(err)
        assert.equal(res.statusCode, 200)
        done()
      })
    })
  })
})

