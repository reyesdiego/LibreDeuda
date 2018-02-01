/**
 * Created by diego on 11/07/16.
 */

var mongoose = require('mongoose');

const place = new mongoose.Schema({
    _id: {type: String},
    NOMBRE: {type: String},
    STATUS: {type: Number}
});

module.exports = mongoose.model('place', place);