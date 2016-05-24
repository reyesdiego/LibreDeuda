/**
 * Created by diego on 28/04/16.
 */

var mongoose = require("mongoose");

var freeDebt = new mongoose.Schema({
    TERMINAL: {type: String},
    SHIP: {type: String},
    TRIP: {type: String},
    CONTAINER: {type: String},
    BL: {type: String},
    RETURN_TO: [{
        PLACE: {type: String},
        DATE_TO: {type: Date},
        AUD_USER: {type: String, required: true},
        AUD_TIME: {type: Date, required: true}
    }],
    STATUS: [{
        STATUS: {type: Number},
        AUD_USER: {type: String, required: true},
        AUD_TIME: {type: Date, required: true}
    }],
    CLIENT: [{
        CUIT: {type: String},
        COMPANY: {type: String},
        EMAIL_CLIENT: {type: String},
        AUD_USER: {type: String, required: true},
        AUD_TIME: {type: Date, required: true}
    }]
});

module.exports = mongoose.model('free', freeDebt);