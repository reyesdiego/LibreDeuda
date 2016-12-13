/**
 * Created by diego on 28/04/16.
 * @module Account
 */

module.exports = (log) => {
    "use strict";

    var Error = require('../include/error.js');
    var express = require("express"),
        router = express.Router();

    var Account = require("../lib/account.js");

    let validateAccount = (req, res, next) => {
        var result;

        req.checkBody(
            {
                email: {
                    notEmpty: {errorMessage: "El Email es requerido." },
                    isEmail: {errorMessage: "El Email es inválido."}
                },
                password: {
                    notEmpty: {errorMessage: "La Clave es requerida." }
                },
                company: {
                    notEmpty: {errorMessage: "La Razón Social es requerida." }
                },
                cuit: {
                    notEmpty: {errorMessage: "El CUIT es requerido." }
                },
                group: {
                    notEmpty: {errorMessage: "la Entidad es requerida." }
                },
                emailContact: {
                    notEmpty: {errorMessage: "El Email de Contancto es requerido." },
                    isEmail: {errorMessage: "El Email de Contancto es inválido."}
                },
                lastname: {
                    notEmpty: {errorMessage: "El Apellido de Contancto es requerido." }
                },
                firstname: {
                    notEmpty: {errorMessage: "El Nombre de Contancto es requerido." }
                },
                telephone: {
                    notEmpty: {errorMessage: "El Teléfono de Contancto es requerido." }
                }
            });

        var errors = req.validationErrors();
        if (errors) {
            result = Error.ERROR("AGP-0013").data(errors);
            res.status(result.http_status).send(result);
        } else {
            next();
        }
    };

    var getAccount = (req, res) => {
        var incomingToken = req.headers.token,
            token = require("../include/token.js");
        var errToken;

        var account = new Account();

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

        var account = new Account();

        payload.TYPE = payload.TYPE || "";

        if (payload.USUARIO === undefined || payload.USUARIO === '') {
            result = Error.ERROR("AGP-0012").data();
            res.status(result.http_status).send(result);
        } else {

            account.getAccount(payload.USUARIO, payload.CLAVE)
            .then(data => {
                    let user = data.data;
                    if (user.status === Account.STATUS.ENABLED) {
                        token.createToken(payload)
                        .then(token => {
                                response = {
                                    status: "OK",
                                    data: token
                                };
                                if (payload.TYPE.toLowerCase() === 'full') {
                                    response.data = user;
                                    response.data.token = token;
                                }
                                res.status(200).send(response);
                            })
                        .catch(err => {
                                console.log(err);
                            });
                    } else if (user.status === Account.STATUS.NEW) {
                        res.status(403).send({
                            status: "ERROR",
                            message: "El usuario no se encuentra habilitado para operar"
                        });
                    } else if (user.status === Account.STATUS.PENDING) {
                        res.status(403).send({
                            status: "ERROR",
                            message: "El usuario no se encuentra habilitado para operar. Usted a recibido un correo en donde encontrará los pasos para validar el usuario creado"
                        });
                    } else if (user.status === Account.STATUS.DISABLED) {
                        res.status(403).send({
                            status: "ERROR",
                            message: "El usuario no se encuentra deshabilitado para operar"
                        });
                    } else {
                        res.status(403).send({
                            status: "ERROR",
                            message: "El estado del usuario es incorrecto para operar"
                        });
                    }

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

        var account = new Account();

        params = {
            email: params.email,
            password: params.password,
            group: params.group,
            company: params.company,
            cuit: params.cuit,
            emailContact: params.emailContact,
            telephone: params.telephone,
            position: params.position,
            lastname: params.lastname,
            firstname: params.firstname,
            date_created: new Date(),
            status: 1,
            terminals: params.terminals
        };

        account.register(params)
        .then(data => {
                var token = require("../include/token.js");

                let payload = {
                    USUARIO: data.data.email,
                    CLAVE: data.data.password
                };
                token.createToken(payload, {expiredIn: '10 years'})
                .then(token => {
                        data.data.token = token;
                        data.data.url = config.url;
                        res.render('register.jade', data.data, (err, html) => {
                            if (err) {
                                //log.logger.error("Se produjo un error en la creacion del comprobante, Email No enviado. %s", err.message);
                                res.status(500).send({
                                    status: 'ERROR',
                                    message: err.message,
                                    data: err
                                });
                            } else {
                                html = {
                                    data: html,
                                    alternative: true
                                };
                                var mailer = new mail.mail(config.email);
                                mailer.send(data.data.email, "Usuario Creado", html, (err, emailData) => {
                                    if (err) {
                                        log.logger.error("Error al enviar mail a %s.", data.data.email);
                                        res.status(500).send({
                                            status: 'ERROR',
                                            message: err.message,
                                            data: err
                                        });
                                    } else {
                                        log.logger.info("Nuevo usuario.", data.data.email);
                                    }
                                });
                                res.status(200).send(data);

                            }
                        });
                    });
        })
        .catch(err => {
                res.status(err.http_status).send(err);
            });

    };

    var validate = (req, res) => {
        var salt = req.query.salt;
        var token = require("../include/token.js");
        var errToken;

        var account = new Account();

        token.verifyToken(salt, (err, payload) => {
            if (err) {
                errToken = Error.ERROR("AGP-0009").data(err);
                res.status(errToken.http_status).send(errToken);
            } else {
                account.getAccount(payload.USUARIO, payload.CLAVE)
                .then(data => {
                        account.setStatus(data.data._id, Account.STATUS.PENDING)
                            .then(data => {
                                res.render('validated.jade', data.data, (err, html) => {
                                    res.status(200).send(html);
                                });
                            })
                            .catch(err => {
                                res.status(err.http_status).send(err);
                            });
                    }).catch(err => {
                        res.status(err.http_status).send(err);
                    });
            }
        });

    };

    router.post("/register", validateAccount, register);
    router.get("/validate/token", validate);
    router.post("/account", getAccount);
    router.post("/login", login);

    return router;
};
