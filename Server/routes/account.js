/**
 * Created by diego on 28/04/16.
 * @module Account
 */

module.exports = () => {
    "use strict";

    var Error = require('../include/error.js');
    var express = require("express"),
        router = express.Router();
    var account = require("../lib/account.js");

    var getAccount = (req, res) => {
        var incomingToken = req.headers.token,
            token = require("../include/token.js");
        var errToken;

        account = new account();

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
            account = account.getAccount(payload.USUARIO, payload.CLAVE)
            .then(data => {
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
                })
            .catch(err => {
                    res.status(err.http_status).send(err);
                });
        }
    };

    var register = (req, res) => {

        var params = req.body;
        var config = require('../config/config.js');
        var mail = require("../include/emailjs.js");
        var terminals = ["TRP", "TERMINAL4"];

        account = new account();

        params = {
            email: params.email,
            password: params.password,
            group: params.group,
            company: params.company,
            cuit: params.cuit,
            emailContact: params.emailContact,
            telephone: params.telephone,
            position: params.position,
            lastName: params.lastName,
            firstName: params.firstName,
            date_created: new Date(),
            status: 1,
            terminals: terminals
        };

        account.register(params)
        .then(data => {
                var mailer = new mail.mail(config.email);
                mailer.send(data.data.email, "Usuario Creado", "Click aqui", function (err, emailData) {
                    if (err) {
                        res.status(500).send({
                            status: 'ERROR',
                            message: err.message,
                            data: err
                        });
                    } else {
                        res.status(200).send(data);
                    }
                });
            })
        .catch(err => {
                res.status(err.http_status).send(err);
            });

    };

    router.post("/register", register);
    router.post("/account", getAccount);
    router.post("/login", login);

    return router;
};
