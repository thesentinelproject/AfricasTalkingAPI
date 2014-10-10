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
  app.param('id', generalAuth, messages.load)
  app.get('/messages', generalAuth, messages.index)
  app.get('/messages/check/:lastId', generalAuth, messages.check)
  app.get('/messages/fetch/:lastId', generalAuth, messages.fetch)
  app.get('/messages/send', generalAuth, messages.send)
  app.get('/messages/broadcast', generalAuth, messages.broadcast)
  app.get('/messages/:id', generalAuth, messages.show)
  app.del('/messages/:id', generalAuth, messages.destroy)

  // home route
  app.get('/', generalAuth, messages.index)

  // tag routes
  var tags = require('../app/controllers/tags')
  app.get('/tags/:tag', generalAuth, tags.index)
}
