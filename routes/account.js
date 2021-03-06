/**
 * Created by diego on 28/04/16.
 * @module Account
 */
//@ts-check

"use strict";

module.exports = (log) => {

    var Error = require("../include/error.js");
    var express = require("express"),
        router = express.Router();

    var Account = require("../lib/account.js");

    let validateAccount = (req, res, next) => {
        var result;

        req.checkBody(
            {
                email: {
                    notEmpty: { errorMessage: "El Email es requerido." },
                    isEmail: { errorMessage: "El Email es inválido." }
                },
                password: {
                    notEmpty: { errorMessage: "La Clave es requerida." }
                },
                company: {
                    notEmpty: { errorMessage: "La Razón Social es requerida." }
                },
                cuit: {
                    notEmpty: { errorMessage: "El CUIT es requerido." }
                },
                group: {
                    notEmpty: { errorMessage: "la Entidad es requerida." }
                },
                emailContact: {
                    notEmpty: { errorMessage: "El Email de Contancto es requerido." },
                    isEmail: { errorMessage: "El Email de Contancto es inválido." }
                },
                lastname: {
                    notEmpty: { errorMessage: "El Apellido de Contancto es requerido." }
                },
                firstname: {
                    notEmpty: { errorMessage: "El Nombre de Contancto es requerido." }
                },
                telephone: {
                    notEmpty: { errorMessage: "El Teléfono de Contancto es requerido." }
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
                    account.getAccount(payload.USUARIO, payload.CLAVE)
                        .then(data => {
                            res.status(200).send(data);
                        })
                        .catch(err => {
                            res.status(err.http_status).send(err);
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

        if (payload.USUARIO === undefined || payload.USUARIO === "") {
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
                                if (payload.TYPE.toLowerCase() === "full") {
                                    response.data = user;
                                    response.data.token = token;
                                }
                                res.status(200).send(response);
                            })
                            .catch(err => {
                                res.status(403).send({
                                    status: "ERROR",
                                    message: "Hubo un error en el inicio de sesión (token)"
                                });
                            });
                    } else if (user.status === Account.STATUS.NEW) {
                        res.status(403).send({
                            status: "ERROR",
                            message: `El usuario no se encuentra habilitado para operar. Revice su correo electrónico (${user.email})en donde encontrará los pasos para validar el usuario creado.`
                        });
                    } else if (user.status === Account.STATUS.PENDING) {
                        res.status(403).send({
                            status: "ERROR",
                            message: "El usuario no se encuentra habilitado para operar. Consultar con el Administrador del Sistema."
                        });
                    } else if (user.status === Account.STATUS.DISABLED) {
                        res.status(403).send({
                            status: "ERROR",
                            message: "El usuario se encuentra deshabilitado para operar."
                        });
                    } else {
                        res.status(403).send({
                            status: "ERROR",
                            message: "El estado del usuario es incorrecto para operar."
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
        var config = require("../config/config.js");

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
                /**
                 * Crea un token expirable a 10 años ya que es para el alta del usuario.
                 */
                token.createToken(payload, { expiredIn: "10 years" })
                    .then(token => {
                        let mailData = {
                            email: data.data.email,
                            company: data.data.company,
                            password: data.data.password,
                            url: config.url,
                            token: token
                        };
                        res.render("register.pug", mailData, (err, html) => {
                            res.status(200).send(html);
                            if (err) {
                                res.status(500).send({
                                    status: "ERROR",
                                    message: err.message,
                                    data: err
                                });
                            } else {
                                html = {
                                    data: html,
                                    alternative: true
                                };
                                var Mail = require("../include/micro-emailjs.js");
                                Mail.send(data.data.email, "Usuario Creado", html)
                                    .then(() => {
                                        log.logger.info(`Email enviado a: ${data.data.email}`);
                                    }).catch(() => {
                                        log.logger.error("Error al enviar mail a %s.", data.data.email);
                                    });
                            }
                        });
                        //res.status(200).send(data);
                    })
                    .catch(err => {
                        res.status(500).send(err);
                    });

            })
            .catch(err => {
                console.error(err.message);
                log.logger.error(`INS Account: ${err.message}`);
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
                        if (data.data.status === Account.STATUS.NEW) {
                            account.setStatus(data.data._id, Account.STATUS.PENDING)
                                .then(data => {
                                    res.render("validated.pug", data.data, (err, html) => {
                                        res.status(200).send(html);
                                        var Mail = require("../include/micro-emailjs.js");
                                        html = {
                                            data: html,
                                            alternative: true
                                        };
                                        Mail.send("dreyes@puertobuenosaires.gob.ar", "Aprobar usuario Libre Deuda", html);
                                    });
                                })
                                .catch(err => {
                                    res.status(err.http_status).send(err);
                                });
                        } else {
                            res.status(500).send("El usuario está pendiente de Aprobación");
                        }
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
