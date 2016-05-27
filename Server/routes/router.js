/**
 * Created by diego on 28/04/16.
 */

module.exports = function (app, socket) {
    "use strict";

    let verifyToken = (req, res, next) => {
        var incomingToken = req.headers.token,
            token = require("../include/token.js");

        token.verifyToken(incomingToken, (err, payload) => {
            if (err) {
                res.status(401).send({status: 'ERROR', message: "Token Invalido", data: err});
            } else {
                req.user = payload;
                next();
            }
        });
    }

    var account = require("./account.js")();
    app.use(account);

    var lde = require("./lde.js")(socket);
    app.use('/lde', verifyToken, lde);

    app.get('/', (req, res) => {
        var pm2 = require('pm2');
        pm2.connect((err) => {
            if (err) {

            } else {
                console.log("se conecto");
                pm2.describe("LibreDeuda", (err, data) => {
                    pm2.disconnect();
                    res.status(200).send(data);
                });
            }
        });

    });
}