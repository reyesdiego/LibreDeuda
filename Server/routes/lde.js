/**
 * Created by diego on 4/18/16.
 */

module.exports = (socket) => {
    "use strict";
    var express = require("express");
    var router = express.Router();
    var FreeDebt = require("../models/freeDebt.js");
    var moment = require("moment");

    router.get("/", (req, res) => {
        var result;

        var free = FreeDebt.find();
        free.exec((err, data) => {
            if (err) {
                result = {
                    status: "ERROR",
                    message: err.message,
                    data: err};
                res.status(500).send(result);
            } else {
                result = {
                    status: "OK",
                    data: data};
                res.status(200).send(result);
            }
        });
    });

    let getFreeDebt = (req, res) => {

        if (req.url.indexOf('/lugar') >= 0) {
            let place = require('../lib/place.js');
            let ID = req.query.ID;
            place = new place();

            if (ID) {
                place.getPlace(ID)
                    .then(data => {
                        res.status(200).send(data);
                    })
                    .catch(err => {
                        res.status(500).send(err);
                    });
            } else {
                place.getPlaces()
                    .then(data => {
                        res.status(200).send(data);
                    })
                    .catch(err => {
                        res.status(500).send(err);
                    });
            }

        } else {
            let lde = require('../lib/lde.js');
            lde = new lde();
            lde.getLde(req.params)
                .then(data => {
                    res.status(200).send(data);
                })
                .catch(err => {
                    res.status(500).send(err);
                });
        }

    };

    let putFreeDebt = (req, res) => {
        const DISABLED = 9;
        const ENABLED = 0;
        const INVOICED = 3;
        var contenedor = req.body.CONTENEDOR;
        var user = req.user;
        var status = -1;
        var description = '';
        var newStatus = {
            AUD_USER: user.USUARIO,
            AUD_TIME: Date.now()
        };

        FreeDebt.findOne({CONTAINER: contenedor})
        .exec((err, data) => {
            if (err) {
                res.status(500).send({status: "ERROR", message: err.message, data: err});
            } else {
                if (!data) {
                    res.status(403).send({status: "ERROR", message: "No Existe el Libre Deuda para el Contenedor."});
                } else {
                    var lastStatus = data.STATUS[data.STATUS.length-1];

                    if (req.route.path.indexOf('/disable') >= 0) {
                        if (lastStatus.STATUS === DISABLED) {
                            description = 'Deshabilitado';
                        } else if (lastStatus.STATUS === INVOICED) {
                            description = 'Facturado';
                        } else {
                            status = DISABLED;
                        }
                    } else if (req.route.path.indexOf('/enable')  >= 0) {
                        if (lastStatus.STATUS === ENABLED) {
                            description = 'Habilitado';
                        } else if (lastStatus.STATUS === INVOICED) {
                            description = 'Facturado';
                        } else {
                            status = ENABLED;
                        }
                    } else if (req.route.path.indexOf('/invoice')  >= 0) {
                        if (lastStatus.STATUS === INVOICED) {
                            description = 'Facturado';
                        } else if (lastStatus.STATUS === DISABLED) {
                            description = 'Deshabilitado';
                        } else {
                            status = INVOICED;
                        }
                    }

                    if (description !== '') {
                        res.status(403).send({
                            status: "ERROR",
                            message: `El Libre Deuda del Contenedor yá se encuentra ${description}.`
                        });
                    } else {
                        newStatus.STATUS = status;
                        data.STATUS.push(newStatus);
                        data.save((err, rowAffected) => {
                            res.status(200).send({
                                status: "OK",
                                data: data
                            });
                        });
                    }
                }
            }
        });
    };

    let addFreeDebt = (req, res) => {
        //TODO controlar que el LDE no exista previamente
        var lde = req.body;
        var container = require("../include/container.js");
        var cuit = require("../include/cuit.js");
        var timestamp = moment().toDate();
        var lde2insert;

        var ldeClass = require('../lib/lde.js');

        ldeClass = new ldeClass();
        ldeClass.getLde({contenedor: lde.CONTENEDOR})
            .then(data => {
                let result = {
                    status: "ERROR",
                    message: `Yá existe un LDE para el contenedor ${lde.CONTENEDOR}`,
                    data: data.data
                };
                res.status(200).send(result);
            })
            .catch(err => {

                let checkContainer = container(lde.CONTENEDOR);
                let checkCuit = cuit(lde.CUIT);

                if (checkCuit === false) {
                    res.status(400).send({status: "ERROR", message: "El CUIT es inválido", data: {CUIT: lde.CUIT}});
                } else {
                    lde2insert = {
                        TERMINAL: lde.TERMINAL,
                        SHIP: lde.BUQUE,
                        TRIP: lde.VIAJE,
                        CONTAINER: lde.CONTENEDOR,
                        BL: lde.BL,
                        ID_CLIENT: lde.ID_CLIENTE,
                        RETURN_TO: [
                            {PLACE: lde.LUGAR_DEV,
                                DATE_TO: moment(lde.FECHA_DEV, "YYYY-MM-DD").format("YYYY-MM-DD"),
                                AUD_USER: req.user.USUARIO,
                                AUD_TIME: timestamp
                            }
                        ],
                        STATUS: [
                            {STATUS: 0,
                                AUD_USER: req.user.USUARIO,
                                AUD_TIME: timestamp}
                        ],
                        CLIENT: [
                            {CUIT: lde.CUIT,
                                EMAIL_CLIENT: lde.EMAIL_CLIENTE,
                                AUD_USER: req.user.USUARIO,
                                AUD_TIME: timestamp}
                        ],
                        EXPIRATION: (lde.VENCE === undefined) ? 0 : lde.VENCE
                    };
                    FreeDebt.create(lde2insert, function (err, data) {
                        if (err) {
                            res.status(500).send({status: "ERROR", message: err.message, data: err});
                        } else {
                            socket.emit('container', lde2insert);
                            let result = {
                                status: "OK",
                                data: {
                                    ID: data._id,
                                    ID_CLIENTE: data.ID_CLIENT
                                }};

                            if (checkContainer === false) {
                                result.message = "El Contenedor no es válido por su dígito verificador";
                            }
                            res.status(200).send(result);
                        }
                    });
                }
            });
    };

    router.get("/:contenedor", getFreeDebt);
    router.put("/disable", putFreeDebt);
    router.put("/enable", putFreeDebt);
    router.put("/invoice", putFreeDebt);
    router.post("/", addFreeDebt);

    return router;
}
