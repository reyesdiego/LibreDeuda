/**
 * Created by diego on 28/04/16.
 */

module.exports = function (app, socket) {
    "use strict";

    function verifyToken (req, res, next) {
        var incomingToken = req.headers.token,
            token = require("../include/token.js");

        token.verifyToken(incomingToken, function (err, payload) {
            if (err) {
                res.status(401).send({status: 'ERROR', message: "Token Invalido", data: err});
            } else {
                req.user = payload;
                next();
            }
        });
    }

    var account = require("./account.js")(app);
    app.use(account);

    var lde = require("./lde.js")(socket);
    app.use('/lde', verifyToken, lde);

}