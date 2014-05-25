/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../../config/config')[env]
  , Schema = mongoose.Schema
  , utils = require('../../lib/utils')

/**
 * Message Schema
 */
var MessageSchema = new Schema({
  extern_id  : {type: Number},
  text       : {type: String},
  from       : {type: Number},
  to         : {type: Number},
  linkId     : {type: Number},
  date       : {type: Date},
  user: {type : Schema.ObjectId, ref : 'User'},
  createdAt  : {type : Date, default : Date.now}
})

/**
 * Validations
 */

// settin un-true for now
//MessageSchema.path('text').required(true, 'Text should have a body');

/**
 * Statics
 */

MessageSchema.statics = {

  /**
   * Find message by id
   *
   * @param {ObjectId} id
   * @param {Function} cb
   * @api private
   */

  load: function (id, cb) {
    this.findOne({ _id : id })
      .populate('user', 'name email username')
      .exec(cb)
  },

  /**
   * List messages
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */

  list: function (options, cb) {
    var criteria = options.criteria || {}

    this.find(criteria)
      .populate('user', 'name username')
      .sort({'createdAt': -1}) // sort by date
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(cb)
  }

}

mongoose.model('Message', MessageSchema)
