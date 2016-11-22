/**
 * Created by diego on 28/04/16.
 * @module Account
 */

module.exports = () => {
    "use strict";

    var Error = require('../include/error.js');
    var express = require("express"),
        router = express.Router();

    var getAccount = (req, res) => {
        var incomingToken = req.headers.token,
            token = require("../include/token.js");
        var account = require("../lib/account.js");
        account = new account();
        var errToken;

        if (incomingToken === undefined) {
            errToken = Error.ERROR("AGP-0009").data();
            res.status(errToken.http_status).send(errToken);
        } else {
            token.verifyToken(incomingToken, (err, payload) => {
                if (err) {
                    errToken = Error.ERROR("AGP-0009").data(err);
                    res.status(errToken.http_status).send(errToken);
                } else {
                    account.getAccount(payload.USUARIO, payload.CLAVE, (err, data) => {
                        if (err) {
                            res.status(err.http_status).send(err);
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
        var payload = req.body;
        var response;
        var result;

        var account = require("../lib/account.js");
        account = new account();

        payload.TYPE = payload.TYPE || "";

        if (payload.USUARIO === undefined || payload.USUARIO === '') {
            result = Error.ERROR("AGP-0012").data();
            res.status(result.http_status).send(result);
        } else {
            account = account.getAccount(payload.USUARIO, payload.CLAVE, (err, data) => {
                if (err) {
                    res.status(err.http_status).send(err);
                } else {
                    token.createToken(payload, (token) => {
                        response = {
                            status: "OK",
                            data: token
                        };
                        if (payload.TYPE.toLowerCase() === 'full') {
                            response = data;
                            response.data.token = token;
                        }
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
