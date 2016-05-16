/**
 * Created by diego on 4/18/16.
 */

module.exports = function (socket) {
    "use strict";
    var express = require("express");
    var router = express.Router();
    var FreeDebt = require("../models/freeDebt.js");
    var moment = require("moment");
    var Enumerable = require("linq");

    router.get("/", function (req, res) {
        var result;

        var free = FreeDebt.find();
        free.exec(function (err, data) {
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

    function getFreeDebt (req, res) {
        var result;
        var contenedor = req.params.contenedor;

        var free = FreeDebt.find({CONTAINER: contenedor});
        free.lean();
        free.exec(function (err, data) {
            if (err) {
                result = {
                    status: "ERROR",
                    message: err.message,
                    data: err};
                res.status(500).send(result);
            } else {
                if (data.length === 0) {
                    result = {
                        status: "ERROR",
                        message: "No existe Libre Deuda para este Contenedor."};
                    res.status(403).send(result);
                } else {
                    var statuses = Enumerable.from(data[0].STATUS)
                        .orderByDescending('$.AUD_TIME')
                        .select('value, idx => {STATUS: value.STATUS}')
                        .toArray();
                    if (statuses[0].STATUS !== 'undefined' && statuses[0].STATUS === 9) {
                        result = {
                            status: "ERROR",
                            message: "El Libre Deuda ha sido Anulado",
                            data: data.STATUS};
                        res.status(403).send(result);
                    } else {
                        result = {
                            status: "OK",
                            data: data};
                        res.status(200).send(result);
                    }
                }
            }
        });
    }

    function putFreeDebt (req, res) {
        const DISABLED = 9;
        const ENABLED = 0;
        const INVOICED = 3;
        var contenedor = req.params.contenedor;
        var user = req.user;
        var status = -1;
        var description = '';
        var newStatus = {
            AUD_USER: user.user,
            AUD_TIME: Date.now()
        };

        var freeDebt = FreeDebt.findOne({CONTAINER: contenedor, AUD_USER: user.email});
        freeDebt.exec(function (err, data) {
            if (err) {
                res.status(500).send({status: "ERROR", message: err.message, data: err});
            } else {
                if (data.length === 0) {
                    res.status(403).send({status: "ERROR", message: "No Existe el Libre Deuda para el Contenedor."});
                } else {
                    var lastStatus = data.STATUS[data.STATUS.length-1];

                    if (req.route.path.indexOf('disable') > 0) {
                        if (lastStatus.STATUS === DISABLED) {
                            description = 'Deshabilitado';
                        } else if (lastStatus.STATUS === INVOICED) {
                            description = 'Facturado';
                        } else {
                            status = DISABLED;
                        }
                    } else if (req.route.path.indexOf('enable')  > 0) {
                        if (lastStatus.STATUS === ENABLED) {
                            description = 'Habilitado';
                        } else if (lastStatus.STATUS === INVOICED) {
                            description = 'Facturado';
                        } else {
                            status = ENABLED;
                        }
                    } else if (req.route.path.indexOf('invoice')  > 0) {
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
                        data.save(function (err, rowAffected) {
                            res.status(200).send({status: "OK", data: data});
                        });
                    }

                }
            }
        });
    }

    function addFreeDebt (req, res) {
        var contenedor = req.body;
        var container = require("../lib/container.js");
        var timestamp = moment().toDate();

        var check = container(contenedor.CONTAINER);
        if (check) {

            contenedor.RETURN_TO[0].AUD_USER = req.user.user;
            contenedor.RETURN_TO[0].AUD_TIME = timestamp;
            contenedor.STATUS[0].AUD_USER = req.user.user;
            contenedor.STATUS[0].AUD_TIME = timestamp;
            contenedor.CLIENT[0].AUD_USER = req.user.user;
            contenedor.CLIENT[0].AUD_TIME = timestamp;
            FreeDebt.create(contenedor, function (err, data) {
                if (err) {
                    res.status(500).send({status: "ERROR", message: err.message, data: err});
                } else {
                    socket.emit('container', contenedor);
                    res.status(200).send({status: "OK", data: data});
                }
            });
        } else {
            res.status(403).send({status: "ERROR", message: `El contenedor ${contenedor.CONTAINER} no es valido` });
        }
    }


    router.get("/:contenedor", getFreeDebt);
    router.put("/:contenedor/disable", putFreeDebt);
    router.put("/:contenedor/enable", putFreeDebt);
    router.put("/:contenedor/invoice", putFreeDebt);
    router.post("/", addFreeDebt);

    return router;
}
