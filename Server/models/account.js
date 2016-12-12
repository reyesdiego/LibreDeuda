/**
 * Created by diego on 09/05/16.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Account = new Schema({
    email: {type: String, required: true, lowercase: true, index: { unique: true } },
    password: {type: String, required: true},
    group: {type: String, required: true},
    company: {type: String, required: true},
    cuit: {type: String, required: true},
    emailContact: {type: String, lowercase: true, required: true},
    telephone: {type: String, required: true},
    position: {type: String},
    lastname: {type: String, required: true},
    firstname: {type: String, required: true},
    terminals: [{type: String}],
    dateCreated: {type: Date, required: true, default: Date.now},
    dateUpdated: {type: Date, required: true, default: Date.now},
    status: {type: Number, required: true},
    lastLogin: {type: Date}
});

module.exports = mongoose.model('accounts', Account);