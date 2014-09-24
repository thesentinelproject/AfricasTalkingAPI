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
  , jquery = require('jquery')(require("jsdom").jsdom().parentWindow)
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
    next();
  })
}

/**
 * Ajax 
 */
exports.check = function(req, res){
  var lastId = req.params['lastId']; 
  if (checkForNewMessages(lastId)){
    res.send('true');
  }else{
    res.send('false');
  }
}

exports.fetch = function(req, res){
  var lastId = req.params['lastId']; 
  fetchMessages(lastId);
}

function endResponse(res){
  res.send('Done');
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

  Message.findOne({}, {}, { sort: {'created_at': -1}}, function(err, message) {
    if (null == message) {
      fetchMessages(0);
    } else {
      fetchMessages(message.extern_id);
      latest_id = message.extern_id
    };
  });

  var tip = '...loading';
  Message.list(options, function(err, messages) {
    if (err) return res.render('500')
    Message.count().exec(function (err, count) {
      res.render('messages/index', {
        title: 'Messages',
        messages: messages,
        page: page + 1,
        lastId: latest_id,
        pages: Math.ceil(count / perPage)
      })
    })
  });
}

function checkForNewMessages(lastReceivedId){
  Message.findOne({ extern_id: lastReceivedId },{},function(err, message) {
    if (null == message) {
      return false;
    } else {
      return true;
    };
  });
}

function fetchMessages(lastReceivedId) {
  var options = {
    host: 'api.africastalking.com',
    port: '443',
    path: '/version1/messaging?username=' + config.africastalking.username + '&lastReceivedId=' + lastReceivedId,
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'apikey': config.africastalking.apiKey
    }
  };
    
  var request = https.request(options, function(res) {
    res.setEncoding('utf8');
    var jsObject = '';
    res.on('data', function (chunk) {
      jsObject += chunk;
    });
    res.on('end', function () {
      var parsed = JSON.parse(jsObject);
      var messages = parsed.SMSMessageData.Messages;
      var finalId = '';

      if (messages.length > 0) {
        for (var i = 0; i < messages.length; ++i) {
          // construct and save message
          finalId = messages[i].id;
          var msg = new Message({
            extern_id: messages[i].id,
            text: jsesc(messages[i].text),
            from: messages[i].from,
            to: messages[i].to,
            linkId: messages[i].linkId, 
            date: messages[i].date
          }).save();
        }
        // recurse baby recurse
        fetchMessages(finalId);
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
