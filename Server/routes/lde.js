/**
 * Created by diego on 4/18/16.
 */

module.exports = (socket) => {
    "use strict";
    var express = require("express");
    var router = express.Router();
    var FreeDebt = require("../models/freeDebt.js");
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
        var Cuit = require("../include/cuit.js");
        var moment = require("moment");

        var checkCuit = Cuit(req.body.CUIT);
        if (checkCuit === false) {
            res.status(400).send({status: "ERROR", message: "El CUIT es inválido", data: {CUIT: req.body.CUIT}});
        } else {
            let fecha = moment(req.body.FECHA_DEV, "YYYY-MM-DD").toDate();
            if (fecha < new Date()) {
                res.status(400).send({status: "ERROR", message: "La Fecha de Devolución debe ser mayor a la fecha actual", data: {FECHA_DEV: fecha}});
            } else {
                var param = {
                    user: req.user,
                    contenedor: req.body.CONTENEDOR,
                    cuit: req.body.CUIT,
                    fecha_dev: moment(req.body.FECHA_DEV, "YYYY-MM-DD").toDate()
                };
                Lde.forwardLde(param)
                    .then(data => {
                        res.status(200).send(data);
                    })
                    .catch(err => {
                        res.status(500).send(err);
                    });
            }
        }
    };

    let invoiceFreeDebt = (req, res) => {
        var param = {
            contenedor: req.body.CONTENEDOR,
            email: req.body.EMAIL_CLIENTE,
            user: req.user
        };

        Lde.invoiceLde(param)
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    };

    let addFreeDebt = (req, res) => {

        var lde = req.body;
        var container = require("../include/container.js");
        var cuit = require("../include/cuit.js");
        var timestamp = moment().toDate();
        var lde2insert;

        Lde.checkLde({contenedor: lde.CONTENEDOR})
            .then(data => {
                let result = {
                    status: "ERROR",
                    message: `Yá existe un LDE para el contenedor ${lde.CONTENEDOR}`,
                    data: data.data
                };
                res.status(400).send(result);
            })
            .catch(err => {

                let checkContainer = container(lde.CONTENEDOR);
                let checkCuit = cuit(lde.CUIT);

                let toDay = moment(moment().format("YYYY-MM-DD")).toDate();
                let dateReturn = moment(lde.FECHA_DEV, "YYYY-MM-DD").toDate();

                if (checkCuit === false) {
                    res.status(400).send({status: "ERROR", message: "El CUIT es inválido", data: {CUIT: lde.CUIT}});
                } else if (dateReturn < toDay) {
                    res.status(400).send({status: "ERROR", message: "La Fecha de Devolución no puede ser menor a la Fecha de Hoy", data: {FECHA_DEV: lde.FECHA_DEV}});
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
                                DATE_TO: moment(lde.FECHA_DEV, "YYYY-MM-DD").format("YYYY-MM-DD"),
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

    let changePlace = (req, res) => {

        var contenedor = req.body.CONTENEDOR;
        var id_cliente = req.body.ID_CLIENTE;

        var param = {
            contenedor: contenedor,
            id_cliente: id_cliente,
            lugar_dev: req.body.LUGAR_DEV
        };

        Lde.checkLde(param)
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
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