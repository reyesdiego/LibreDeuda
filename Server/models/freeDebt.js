/**
 * Created by diego on 28/04/16.
 */

var mongoose = require("mongoose");

var freeDebt = new mongoose.Schema({
    TERMINAL: {type: String, enum: ['BACTSSA', 'TRP', 'TERMINAL4', 'EXOLGAN']},
    SHIP: {type: String},
    TRIP: {type: String},
    CONTAINER: {type: String, required: true},
    BL: {type: String},
    ID_CLIENT: {type: String},
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
        CUIT: {type: String, required: true},
        COMPANY: {type: String},
        EMAIL: {type: String},
        AUD_USER: {type: String, required: true},
        AUD_TIME: {type: Date, required: true}
    }],
    EXPIRATION: {type: String, enum: ['0', '1'], required: true}
});

module.exports = mongoose.model('frees', freeDebt);