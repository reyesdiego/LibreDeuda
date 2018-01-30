/**
 * Created by diego on 4/18/16.
 */
"use strict";
//@ts-check

module.exports = (socket, log) => {
    var express = require("express");
    var router = express.Router();
    var moment = require("moment");
    var contentCheck = require("../include/contentType.js");
    var Error = require("../include/error.js");

    var _Lde = require("../lib/lde.js");
    const Lde = new _Lde();

    let validateFree = (req, res, next) => {
        var result;

        req.checkBody(
            {
                TERMINAL: {
                    notEmpty: { errorMessage: "La Terminal es requerida." }
                },
                BUQUE: {
                    notEmpty: { errorMessage: "El buque es requerido." }
                },
                VIAJE: {
                    notEmpty: { errorMessage: "El Viaje es requerido." }
                },
                LUGAR_DEV: {
                    notEmpty: { errorMessage: "El Lugar de Devolución es requerido." }
                },
                FECHA_DEV: {
                    notEmpty: { errorMessage: "La Fecha de Devolución es requerida." },
                    isDate: {
                        errorMessage: "La Fecha de Devolución debe ser válida"
                    }
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

    /** GET */
    let getFrees = (req, res) => {
        var param = {
            user: req.user,
            bl: req.query.bl
        };
        var options = {
            skip: req.query.skip,
            limit: req.query.limit
        };

        if (req.query.order) {
            options.sort = JSON.parse(req.query.order) || { _id: -1 };
        }

        Lde.getLdes(param, options)
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                log.logger.error(err);
                res.status(err.http_status).send(err);
            });
    };

    /** GET */
    let getFreeDebt = (req, res, next) => {
        if (req.url.indexOf("/lugar") >= 0) {
            const _Place = require("../lib/place.js");
            let ID = req.query.ID;
            const Place = new _Place();

            if (ID) {
                Place.getPlace(ID)
                    .then(data => {
                        res.status(200).send(data);
                    })
                    .catch(err => {
                        res.status(err.http_status).send(err);
                    });
            } else {
                Place.getPlaces()
                    .then(data => {
                        res.status(200).send(data);
                    })
                    .catch(err => {
                        res.status(500).send(err);
                    });
            }
        }
        else {
            let param = {
                contenedor: req.params.contenedor,
                user: req.user
            };
            Lde.checkLde(param)
                .then(data => {
                    res.status(200).send(data);
                })
                .catch(err => {
                    /**
                     * En caso que el LDE ya haya sido factura y la terminal debe consultar el lugar de devolucion y/o la fecha del mismo, debe
                     * poder acceder a esos datos
                     */
                    if (param.user.data.group === "TER") {
                        next();
                    } else {
                        res.status(err.http_status).send(err);
                    }
                });
        }
    };

    let getReturnToLde = (req, res) => {
        let param = {
            contenedor: req.params.contenedor,
            user: req.user
        };
        Lde.returnToLde(param)
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(err.http_status).send(err);
            });
    };

    /** PUT */
    let enableFreeDebt = (req, res) => {

        var param = {
            contenedor: req.body.CONTENEDOR,
            user: req.user
        };

        Lde.enableLde(param)
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(err.http_status).send(err);
            });
    };

    /** PUT */
    let disableFreeDebt = (req, res) => {

        var param = {
            contenedor: req.body.CONTENEDOR,
            user: req.user
        };

        Lde.disableLde(param)
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(err.http_status).send(err);
            });
    };

    /** PUT */
    let forwardLde = (req, res) => {
        var user = req.user;
        var Cuit = require("../include/cuit.js");
        var moment = require("moment");
        var fecha_dev;

        if (user.data.group !== "FOR") {
            var result = Error.ERROR("AGP-0008").data();
            res.status(result.http_status).send(result);
        } else {
            var cuit = (req.body.CUIT === undefined) ? "" : req.body.CUIT;
            var checkCuit = Cuit(cuit);
            if (checkCuit === false) {
                res.status(400).send({ status: "ERROR", message: `El CUIT (${cuit}) no es válido`, data: { CUIT: req.body.CUIT } });
            } else {
                if (req.body.FECHA_DEV) {
                    fecha_dev = moment(req.body.FECHA_DEV, "YYYY-MM-DD").toDate();
                }

                if (fecha_dev !== undefined && fecha_dev < moment(moment().format("YYYY-MM-DD")).toDate()) {
                    fecha_dev = moment(fecha_dev).format("DD/MM/YYYY");
                    res.status(400).send({
                        status: "ERROR",
                        message: `La Fecha de Devolución ${fecha_dev} es menor a la fecha actual`, data: { FECHA_DEV: fecha_dev }
                    });
                } else {
                    var param = {
                        user: user,
                        contenedor: req.body.CONTENEDOR,
                        bl: req.body.BL,
                        cuit: req.body.CUIT
                    };
                    if (fecha_dev !== undefined) {
                        param.fecha_dev = fecha_dev;
                    }

                    Lde.forwardLde(param)
                        .then(data => {
                            res.status(200).send(data);
                        })
                        .catch(err => {
                            res.status(500).send(err);
                        });
                }
            }
        }
    };

    /** PUT */
    let invoiceFreeDebt = (req, res) => {
        var user = req.user.data;
        var param = {
            contenedor: req.body.CONTENEDOR,
            email: req.body.EMAIL_CLIENTE,
            user: req.user
        };

        if (user.group !== "TER") {
            var result = Error.ERROR("AGP-0008").data();
            res.status(result.http_status).send(result);
        } else {
            Lde.invoiceLde(param)
                .then(data => {
                    res.status(200).send(data);
                })
                .catch(err => {
                    res.status(500).send(err);
                });
        }
    };

    /** POST */
    let addFreeDebt = (req, res) => {

        var lde = req.body;
        var container = require("../include/container.js");
        var cuit = require("../include/cuit.js");
        var timestamp = moment().toDate();
        var lde2insert;
        var param, result;
        var user = req.user;

        if (user.data.group !== "AGE") {
            result = Error.ERROR("AGP-0008");
            res.status(result.http_status).send(result);
        } else {

            param = {
                id: "",
                contenedor: lde.CONTENEDOR,
                id_cliente: "",
                user: req.user
            };
            Lde.checkLde(param)
                .then(data => {
                    data = data.data;
                    result = Error.ERROR("AGP-0005").data({
                        ID: data.ID,
                        CONTENEDOR: data.CONTAINER,
                        ID_CLIENT: data.ID_CLIENT,
                        STATUS: data.STATUS,
                        FECHA_DEV: data.FECHA_DEV
                    });
                    res.status(result.http_status).send(result);
                })
                .catch(() => {

                    let checkContainer = container(lde.CONTENEDOR);
                    let checkCuit = cuit(lde.CUIT);

                    let dateReturn = moment(lde.FECHA_DEV, "YYYY-MM-DD").toDate();

                    if (checkCuit === false) {
                        result = Error.ERROR("AGP-0004").data({ CUIT: lde.CUIT || "" });
                        log.logger.error("Insert LDE - CUIT %j", JSON.stringify(result));
                        res.status(result.http_status).send(result);
                        //} else if (dateReturn < toDay) {
                        //    result = Error.ERROR("AGP-0006").data({FECHA_DEV: lde.FECHA_DEV || ""});
                        //    log.logger.error("Insert LDE - FECHA DEVOLUCION %j", JSON.stringify(result));
                        //    res.status(result.http_status).send(result);
                    } else {
                        lde2insert = {
                            TERMINAL: (lde.TERMINAL !== undefined) ? lde.TERMINAL.trim() : "",
                            SHIP: (lde.BUQUE !== undefined) ? lde.BUQUE.trim() : "",
                            TRIP: (lde.VIAJE !== undefined) ? lde.VIAJE.trim() : "",
                            CONTAINER: (lde.CONTENEDOR !== undefined) ? lde.CONTENEDOR.trim() : "",
                            BL: (lde.BL !== undefined) ? lde.BL.trim() : "",
                            ID_CLIENT: (lde.ID_CLIENTE !== undefined) ? lde.ID_CLIENTE.trim() : "",
                            RETURN_TO: [
                                {
                                    PLACE: (lde.LUGAR_DEV !== undefined) ? lde.LUGAR_DEV.trim() : "",
                                    DATE_TO: dateReturn,
                                    AUD_USER: req.user.USUARIO,
                                    AUD_TIME: timestamp
                                }
                            ],
                            STATUS: [
                                {
                                    STATUS: 0,
                                    AUD_USER: req.user.USUARIO,
                                    AUD_TIME: timestamp
                                }
                            ],
                            CLIENT: [
                                {
                                    CUIT: lde.CUIT,
                                    EMAIL: (lde.EMAIL !== undefined) ? lde.EMAIL.trim() : "",
                                    AUD_USER: req.user.USUARIO,
                                    AUD_TIME: timestamp
                                }
                            ],
                            EXPIRATION: (lde.VENCE === undefined) ? "0" : lde.VENCE.toString()
                        };
                        Lde.add(lde2insert)
                            .then(data => {

                                if (lde.EMAIL) {
                                    let ldeMail = {
                                        contenedor: lde.CONTENEDOR,
                                        terminal: lde.TERMINAL,
                                        buque: lde.BUQUE,
                                        viaje: lde.VIAJE,
                                        cuit: lde.CUIT,
                                        fecha: lde.FECHA_DEV,
                                        lugar: lde.LUGAR_DEV
                                    };
                                    res.render("lde.pug", ldeMail, (err, html) => {
                                        if (err) {
                                            log.logger.error("Error %s", err);
                                        } else {
                                            html = {
                                                data: html,
                                                alternative: true
                                            };

                                            var subject = `Libre Deuda Electónico ${lde.CONTENEDOR}`;

                                            var Mail = require("../include/micro-emailjs.js");
                                            Mail.send(lde.EMAIL, subject, html)
                                                .then(() => {
                                                    console.info(`Email enviado a: ${lde.EMAIL}`);
                                                }).catch(err => {
                                                    console.error(`Email NO enviado a: ${lde.EMAIL}. ERROR: ${err.message}`);
                                                });
                                        }
                                    });
                                }

                                socket.emit("container", lde2insert);
                                let result = {
                                    status: "OK",
                                    data: {
                                        ID: data._id,
                                        ID_CLIENTE: data.ID_CLIENT
                                    }
                                };

                                if (checkContainer === false) {
                                    result.message = "El Contenedor no es válido por su dígito verificador";
                                }
                                log.logger.insert("Insert LDE - %j", JSON.stringify(data));
                                res.status(200).send(data);
                            })
                            .catch(err => {
                                log.logger.error("Insert LDE - %s, %j", JSON.stringify(err), JSON.stringify(lde2insert));
                                res.status(err.http_status).send(err);
                            });
                    }
                });
        }
    };

    /** PUT */
    let changePlace = (req, res) => {
        var user = req.user;
        var moment = require("moment");
        var result;

        var toDay = moment(moment().format("YYYY-MM-DD")).toDate();
        var dateReturn;

        if (req.body.FECHA_DEV) {
            dateReturn = moment(req.body.FECHA_DEV, "YYYY-MM-DD").toDate();
        }

        var param = {
            contenedor: req.body.CONTENEDOR,
            id_cliente: req.body.ID_CLIENTE,
            id: req.body.ID,
            lugar_dev: req.body.LUGAR_DEV,
            fecha_dev: dateReturn,
            user: user
        };

        if (dateReturn < toDay) {
            result = Error.ERROR("AGP-0006").data({ FECHA_DEV: req.body.FECHA_DEV || "" });
            log.logger.error("Change Place LDE - FECHA DEVOLUCION %j", JSON.stringify(result));
            res.status(result.http_status).send(result);
        } else if (user.data.group === "TER") {
            result = Error.ERROR("AGP-0008");
            res.status(result.http_status).send(result);
        } else {
            if (user.data.group === "FOR") {
                delete param.lugar_dev;
                delete param.id_cliente;
                delete param.id;
            }

            Lde.changePlace(param)
                .then(data => {
                    log.logger.info("Change Place LDE - LUGAR - FECHA DEVOLUCION %s - %s", req.body.LUGAR_DEV, req.body.FECHA_DEV);
                    if (req.body.EMAIL) {
                        let lde = data.data;
                        var return_to = lde.RETURN_TO[lde.RETURN_TO.length - 1];
                        var client = lde.CLIENT[lde.CLIENT.length - 1];
                        let ldeMail = {
                            contenedor: lde.CONTAINER,
                            terminal: lde.TERMINAL,
                            buque: lde.SHIP,
                            viaje: lde.TRIP,
                            cuit: client.CUIT,
                            fecha: return_to.DATE_TO,
                            lugar: return_to.PLACE
                        };
                        res.render("changePlace.pug", ldeMail, (err, html) => {
                            if (err) {
                                log.logger.error("Error %s", err);
                            } else {
                                html = {
                                    data: html,
                                    alternative: true
                                };

                                var subject = `Libre Deuda Electónico ${req.body.CONTENEDOR}`;

                                var Mail = require("../include/micro-emailjs.js");
                                Mail.send(req.body.EMAIL, subject, html)
                                    .then(dataMail => {
                                        console.info(`Email enviado a: ${req.body.EMAIL}`);
                                        res.status(200).send(data);
                                    }).catch(err => {
                                        console.error(`Email NO enviado a: ${req.body.EMAIL} - ERROR: ${err.message}`);
                                    });
                            }
                        });

                    } else {
                        res.status(200).send(data);
                    }
                })
                .catch(err => {
                    res.status(500).send(err);
                });
        }
    };

    router.get("/", getFrees);
    router.get("/:contenedor", getFreeDebt, getReturnToLde);
    router.put("/disable", contentCheck.isApplicationJson, disableFreeDebt);
    router.put("/enable", contentCheck.isApplicationJson, enableFreeDebt);

    /** Marcar como utilizado a un LDE*/
    router.put("/invoice", contentCheck.isApplicationJson, invoiceFreeDebt);

    /** Dar de Alta un LDE*/
    router.post("/", contentCheck.isApplicationJson, validateFree, addFreeDebt);

    /** Cambia Lugar de Devolucion de un LDE*/
    router.put("/lugar", contentCheck.isApplicationJson, changePlace);

    router.put("/forward", contentCheck.isApplicationJson, forwardLde);

    return router;
};