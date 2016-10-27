/**
 * Created by diego on 23/09/16.
 */
/**
 * Created by diego on 28/04/16.
 */

var mongoose = require("mongoose");

var ctvp = new mongoose.Schema({
    CONTENEDOR: {type: String, required: true},
    CERTIFICADO: {type: String, required: true},
    FECHA: {type: Date, required: true},
    STATUS: [{
        STATUS: {type: Number},
        AUD_USER: {type: String, required: true},
        AUD_TIME: {type: Date, required: true}
    }]
});

module.exports = mongoose.model('ctvps', ctvp);