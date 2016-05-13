/**
 * Created by diego on 28/04/16.
 * @module Account
 */

module.exports = function () {
    "use strict";

    var express = require("express"),
        router = express.Router();


    router.post("/login", function (req, res) {
        var token = require("../include/token.js");
        var account = require("../lib/account.js");
        account = new account();
        var payload = req.body;
        var response;

        if (payload.user === undefined || payload.user === '') {
            res.status(401).send({
                status: "ERROR",
                message: "Debe proveer un usuario"
            });
        } else {
            account = account.getAccount(payload.user, payload.password, function (err, data) {
                if (err) {
                    res.status(401).send(err);
                } else {
                    token.createToken(payload, function (token) {
                        response = {
                            status: "OK",
                            data: token
                        };
                        res.status(200).send(response);
                    });
                }
            });
        }
    });

    return router;
};
