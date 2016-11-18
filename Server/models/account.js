/**
 * Created by diego on 09/05/16.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Account = new Schema({
    email: { type: String, required: true, lowercase: true, index: { unique: true } },
    user: {type: String},
    password: { type: String},
    group: {type: String},
    full_name: {type: String, required: true},
    company: {type: String},
    date_created: {type: Date, default: Date.now},
    status: {type: Boolean},
    lastLogin: {type: Date}
});

module.exports = mongoose.model('accounts', Account);