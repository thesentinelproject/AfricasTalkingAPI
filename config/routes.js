/*!
 * Module dependencies.
 */

var async = require('async')

/**
 * Controllers
 */

var users = require('../app/controllers/users')
  , messages = require('../app/controllers/messages')
  , auth = require('./middlewares/authorization')

/**
 * Route middlewares
 */

var messageAuth = [auth.requiresLogin, auth.message.hasAuthorization]

/**
 * Expose routes
 */

module.exports = function (app, passport) {
  var generalAuth = passport.authenticate('local', {
      failureRedirect: '/login',
      failureFlash: 'Invalid email or password.',
      scope: 'profile'
  });

  // posts
  app.post('/messages/broadcast', messages.broadcast)

  // user routes
  app.get('/login', users.login)
  app.get('/logout', users.logout)

  // message routes
  app.param('id', messages.load)
  app.get('/messages',  messages.index)
  app.get('/messages/check/:lastId',  messages.check)
  app.get('/messages/fetch/:lastId',  messages.fetch)
  app.get('/messages/send', messages.send)
  app.get('/messages/broadcast', messages.broadcast)
  app.get('/messages/:id', messages.show)
  app.del('/messages/:id', messages.destroy)

  // home route
  app.get('/', messages.index)

  // tag routes
  var tags = require('../app/controllers/tags')
  app.get('/tags/:tag', tags.index)
}
