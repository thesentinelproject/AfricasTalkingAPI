/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Message = mongoose.model('Message')

/**
 * List items tagged with a tag
 */

exports.index = function (req, res) {
  var criteria = { tags: req.param('tag') }
  var perPage = 5
  var page = (req.param('page') > 0 ? req.param('page') : 1) - 1
  var options = {
    perPage: perPage,
    page: page,
    criteria: criteria
  }

  Message.list(options, function(err, messages) {
    if (err) return res.render('500')
    Message.count(criteria).exec(function (err, count) {
      res.render('messages/index', {
        title: 'Messages tagged ' + req.param('tag'),
        messages: messages,
        page: page + 1,
        pages: Math.ceil(count / perPage)
      })
    })
  })
}

