/**
 * Created by diego on 28/04/16.
 * @module Account
 */

module.exports = () => {
    "use strict";

    var express = require("express"),
        router = express.Router();

    var getAccount = (req, res) => {
        var incomingToken = req.headers.token,
            token = require("../include/token.js");
        var account = require("../lib/account.js");
        account = new account();

        if (incomingToken === undefined) {
            res.status(401).send({status: 'ERROR', message: "Debe proveer un Token"});
        } else {
            token.verifyToken(incomingToken, (err, payload) => {
                if (err) {
                    res.status(401).send({status: 'ERROR', message: "Token Invalido", data: err});
                } else {
                    account.getAccount(payload.USUARIO, payload.CLAVE, (err, data) => {
                        if (err) {
                            res.status(401).send(err);
                        } else {
                            res.status(200).send(data);
                        }
                    });
                }
            });
        }

    };

    var login = (req, res) => {
        var token = require("../include/token.js");
        var account = require("../lib/account.js");
        account = new account();
        var payload = req.body;
        var response;

        if (payload.USUARIO === undefined || payload.USUARIO === '') {
            res.status(401).send({
                status: "ERROR",
                message: "Debe proveer un usuario"
            });
        } else {
            account = account.getAccount(payload.USUARIO, payload.CLAVE, (err, data) => {
                if (err) {
                    res.status(401).send(err);
                } else {
                    token.createToken(payload, (token) => {
                        response = {
                            status: "OK",
                            data: token
                        };
                        res.status(200).send(response);
                    });
                }
            });
        }
    };


    router.post("/account", getAccount);
    router.post("/login", login);

    return router;
};
