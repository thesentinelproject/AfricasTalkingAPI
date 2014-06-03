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
  var latest_id;

  Message.findOne({}, {}, { sort: {'created_at': -1}}, function(err, message) {
    if (null == message) {
      latest_id = 0
    } else {
      latest_id = message.extern_id
    };
  });

  var req_options = {
    hostname: 'api.africastalking.com',
    path: '/version1/messaging?username='+config.africastalking.username+'&lastReceivedId='+latest_id,
    method: 'GET',
    headers: {
      'ApiKey': config.africastalking.apiKey
      ,'Accept':'application/json'
    }
  };

  var req = http.get(req_options, function(res){
    var bodyChunks = [];
    res.on('data', function(chunk) {
      bodyChunks.push(chunk);
    }).on('end', function() {
      var body = Buffer.concat(bodyChunks);
      var parsedBody = JSON.parse(body);
      var new_messages = parsedBody['SMSMessageData']['Messages'];

      if (new_messages != null) {
        Object.keys(new_messages).forEach(function(key) {
          var organic = new_messages[key];
          // construct and save message
          new Message({
            extern_id: organic['id'],
            text: organic['text'],
            from: organic['from'],
            to: organic['to'],
            linkId: organic['linkId'],
            date: organic['date']
          }).save();
        });
      }
    })   
  })
  .on('error',function(e){
    console.log("Error: " + req_options.hostname + "\n" + e.message); 
    console.log(e.stack);
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
