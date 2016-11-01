/**
 * Created by diego on 4/18/16.
 */

module.exports = (socket, log) => {
    "use strict";
    var express = require("express");
    var router = express.Router();
    var moment = require("moment");
    var Lde = require('../lib/lde.js');
    Lde = new Lde();

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
            Lde.checkLde(req.params)
                .then(data => {
                    res.status(200).send(data);
                })
                .catch(err => {
                    res.status(500).send(err);
                });
        }

    };

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
                res.status(500).send(err);
            });
    };

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
                res.status(500).send(err);
            });
    };

    let forwardLde = (req, res) => {
        var user = req.user;
        var Cuit = require("../include/cuit.js");
        var moment = require("moment");
        var fecha_dev;

        if (user.data.group !== 'FOR') {
            res.status(500).send({
                status: "ERROR",
                message: "No tiene permisos para realizar esta operación"
            });
        } else {
            var checkCuit = Cuit(req.body.CUIT);
            if (checkCuit === false) {
                res.status(400).send({status: "ERROR", message: `El CUIT ${req.body.CUIT} no es válido`, data: {CUIT: req.body.CUIT}});
            } else {
                if (req.body.FECHA_DEV) {
                    fecha_dev = moment(req.body.FECHA_DEV, "YYYY-MM-DD").toDate();
                }

                if (fecha_dev !== undefined && fecha_dev > moment() ) {
                    fecha_dev = moment(fecha_dev).format("DD/MM/YYYY");
                    res.status(400).send({
                        status: `ERROR`,
                        message: `La Fecha de Devolución ${fecha_dev} es menor a la fecha actual`, data: {FECHA_DEV: fecha_dev}
                    });
                } else {
                    var param = {
                        user: user,
                        contenedor: req.body.CONTENEDOR,
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

    let invoiceFreeDebt = (req, res) => {
        var user = req.user.data;
        var param = {
            contenedor: req.body.CONTENEDOR,
            email: req.body.EMAIL_CLIENTE,
            user: req.user
        };

        if (user.group !== 'TER') {
            res.status(500).send({
                status: "ERROR",
                message: "No tiene permisos para realizar esta operación"
            });
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

    let addFreeDebt = (req, res) => {

        var lde = req.body;
        var container = require("../include/container.js");
        var cuit = require("../include/cuit.js");
        var timestamp = moment().toDate();
        var lde2insert;

        Lde.checkLde({contenedor: lde.CONTENEDOR})
            .then(data => {
                data = data.data;
                let result = {
                    status: "ERROR",
                    message: `Yá existe un LDE para el contenedor ${lde.CONTENEDOR}`,
                    data: {
                        ID: data.ID,
                        CONTENEDOR: data.CONTAINER,
                        ID_CLIENT: data.ID_CLIENT,
                        STATUS: data.STATUS,
                        FECHA_DEV: data.FECHA_DEV
                    }
                };
                res.status(400).send(result);
            })
            .catch(err => {

                let checkContainer = container(lde.CONTENEDOR);
                let checkCuit = cuit(lde.CUIT);

                let toDay = moment(moment().format("YYYY-MM-DD")).toDate();
                let dateReturn = moment(lde.FECHA_DEV, "YYYY-MM-DD").toDate();
                let errMsg;
                if (checkCuit === false) {
                    errMsg = {
                        status: "ERROR",
                        code: "AGP-0004",
                        message: "El CUIT es inválido",
                        data: {CUIT: lde.CUIT}
                    };
                    log.logger.error(errMsg);
                    res.status(400).send(errMsg);
                } else if (dateReturn < toDay) {
                    errMsg = {
                        status: "ERROR",
                        code: "AGP-0005",
                        message: "La Fecha de Devolución no puede ser menor a la Fecha de Hoy",
                        data: {FECHA_DEV: lde.FECHA_DEV}};
                    log.logger.error(errMsg);
                    res.status(400).send(errMsg);
                } else {
                    lde2insert = {
                        TERMINAL: (lde.TERMINAL !== undefined) ? lde.TERMINAL.trim() : '',
                        SHIP: (lde.BUQUE !== undefined) ? lde.BUQUE.trim() : '',
                        TRIP: (lde.VIAJE !== undefined) ? lde.VIAJE.trim() : '',
                        CONTAINER: (lde.CONTENEDOR !== undefined) ? lde.CONTENEDOR.trim() : '',
                        BL: (lde.BL !== undefined) ? lde.BL.trim() : '',
                        ID_CLIENT: (lde.ID_CLIENTE !== undefined) ? lde.ID_CLIENTE.trim() : '',
                        RETURN_TO: [
                            {
                                PLACE: (lde.LUGAR_DEV !== undefined) ? lde.LUGAR_DEV.trim() : '',
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
                                EMAIL_CLIENT: (lde.EMAIL_CLIENTE !== undefined) ? lde.EMAIL_CLIENTE.trim() : '',
                                AUD_USER: req.user.USUARIO,
                                AUD_TIME: timestamp}
                        ],
                        EXPIRATION: (lde.VENCE === undefined) ? '0' : lde.VENCE.toString()
                    };
                    Lde.add(lde2insert)
                    .then(data => {
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
                            log.logger.insert("Insert LDE - %j", JSON.stringify(data));
                            res.status(200).send(data);
                    })
                    .catch(err => {
                            log.logger.error(err);
                            res.status(500).send(err);
                        });
                }
            });
    };

    let changePlace = (req, res) => {
        var user = req.user;
        var moment = require("moment");

        var param = {
            contenedor: req.body.CONTENEDOR,
            id_cliente: req.body.ID_CLIENTE,
            id: req.body.ID,
            lugar_dev: req.body.LUGAR_DEV,
            fecha_dev: moment(req.body.FECHA_DEV, "YYYY-MM-DD").toDate(),
            user: user
        };

        if (user.data.group !== 'AGE') {
            res.status(500).send({
                status: "ERROR",
                message: "No tiene permisos para realizar esta operación"
            });
        } else {
            Lde.changePlace(param)
                .then(data => {
                    res.status(200).send(data);
                })
                .catch(err => {
                    res.status(500).send(err);
                });
        }
    };

    router.get("/:contenedor", getFreeDebt);
    router.put("/disable", disableFreeDebt);
    router.put("/enable", enableFreeDebt);
    router.put("/invoice", invoiceFreeDebt);
    router.post("/", addFreeDebt);
    router.put("/lugar", changePlace);
    router.put("/forward", forwardLde);

    return router;
};