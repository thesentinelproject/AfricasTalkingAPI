/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Message = mongoose.model('Message')
  , utils = require('../../lib/utils')
  , extend = require('util')._extend
  , http = require('http')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../../config/config')[env]
  , querystring = require('querystring')
  , jsesc = require('jsesc')
  , https = require('https');

/**
 * Load
 */

exports.load = function(req, res, next, id){
  var User = mongoose.model('User')

  Message.load(id, function (err, message) {
    if (err) return next(err)
    if (!message) return next(new Error('not found'))
    req.message = message
    next()
  })
}

/**
 * List
 */

exports.index = function(req, res){
  var page = (req.param('page') > 0 ? req.param('page') : 1) - 1
  var perPage = 30
  var options = {
    perPage: perPage,
    page: page
  }
  //
  //////////////////////////////////////////////////////////////////////////////////////
  // get latest data from API
  Message.findOne({}, {}, { sort: {'created_at': -1}}, function(err, message) {
    if (null == message) {
      fetchMessages(0);
    } else {
      fetchMessages(message.extern_id);
      latest_id = message.extern_id
    };
  });
  //////////////////////////////////////////////////////////////////////////////////////
  // Resume normal ops

  Message.list(options, function(err, messages) {
    if (err) return res.render('500')
    Message.count().exec(function (err, count) {
      res.render('messages/index', {
        title: 'Messages',
        messages: messages,
        page: page + 1,
        pages: Math.ceil(count / perPage)
      })
    })
  })
}

function fetchMessages(lastReceivedId_) {
  var options = {
    host: 'api.africastalking.com',
    port: '443',
    path: '/version1/messaging?username=' + config.africastalking.username + '&lastReceivedId=' + lastReceivedId_,
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'apikey': config.africastalking.apiKey
    }
  };
    
  var request = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      var jsObject = JSON.parse(chunk);
      var messages = jsObject.SMSMessageData.Messages;

      if (messages.length > 0) {
        for (var i = 0; i < messages.length; ++i) {
          // construct and save message
          new Message({
            extern_id: messages[i].id,
            text: jsesc(messages[i].text),
            from: messages[i].from,
            to: messages[i].to,
            linkId: messages[i].linkId, 
            date: messages[i].date
          }).save();
        }
        // recurse baby recurse
        fetchMessages(lastReceivedId_);
      } 
    });
  });
  request.end();
};


/**
 * Show
 */

exports.show = function(req, res){
  res.render('messages/show', {
    title: req.message.extern_id,
    message: req.message
  })
}

/**
 * Delete
 */

exports.destroy = function(req, res){
  var message = req.message
  message.remove(function(err){
    req.flash('info', 'Deleted')
    res.redirect('/messages')
  })
}
