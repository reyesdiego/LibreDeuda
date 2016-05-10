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
                var statuses = Enumerable.from(data[0].STATUS)
                    .orderByDescending('$.AUD_TIME')
                    .select('value, idx => {STATUS: value.STATUS}')
                    .toArray();
                if (statuses[0].STATUS !== 'undefined' && statuses[0].STATUS === 9) {
                    result = {
                        status: "ERROR",
                        message: "Libre Deuda Anulado",
                        data: data};
                    res.status(403).send(result);
                } else {
                    result = {
                        status: "OK",
                        data: data};
                    res.status(200).send(result);
                }
            }
        });
    }

    function putFreeDebt (req, res) {
        var contenedor = req.params.contenedor;
        var user = req.user;

        var freeDebt = FreeDebt.findOne({CONTAINER: contenedor, AUD_USER: user.email});
        freeDebt.exec(function (err, data) {
            if (err) {
                res.status(500).send({status: "ERROR", message: err.message, data: err});
            } else {
                if (data.length < 1) {
                    res.status(403).send({status: "ERROR", message: "No Existe el Libre Deuda para el Contenedor."});
                } else {
                    res.status(200).send({status: "OK", data: data});
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
    router.post("/", addFreeDebt);

    return router;
}
