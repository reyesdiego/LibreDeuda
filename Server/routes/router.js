/**
 * Created by diego on 28/04/16.
 */
//@ts-check

"use strict";

module.exports = function (app, socket, log) {
    var Error = require("../include/error.js");

    let verifyToken = (req, res, next) => {
        var incomingToken = req.headers.token,
            token = require("../include/token.js");
        var result;

        const _Account = require("../lib/account.js");
        const Account = new _Account();

        token.verifyToken(incomingToken, (err, payload) => {
            if (err) {
                result = Error.ERROR("AGP-0009").data(err);
                res.status(result.http_status).send(result);
            } else {
                Account.getAccount(payload.USUARIO, payload.CLAVE)
                    .then(data => {
                        req.user = payload;
                        if (err) {
                            res.status(500).send(err);
                        } else {
                            if (data.status === "OK") {
                                req.user.data = data.data;
                            }
                            next();
                        }
                    })
                    .catch(err => {
                        res.status(err.http_status).send(err);
                    });
            }
        });
    };

    var account = require("./account.js")(log);
    app.use(account);

    var ctvp = require("./ctvp.js")(socket);
    app.use("/ctvp", verifyToken, ctvp);

    var error = require("./error.js")();
    app.use("/errors", verifyToken, error);

    var lde = require("./lde.js")(socket, log);
    app.use("/lde", verifyToken, lde);

    app.get("/pm2test", (req, res) => {
        var pm2 = require("pm2");
        pm2.connect((err) => {
            if (err) {
                res.status(500).send(err);
            } else {
                console.log("se conecto");
                pm2.describe("LibreDeuda", (err, data) => {
                    pm2.disconnect();
                    res.status(200).send(data);
                });
            }
        });
    });

    app.get("/", (req, res) => {
        res.status(200).send("Libre Deuda 1.0\n");
    });

};