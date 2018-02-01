/**
 * Created by diego on 23/09/16.
 */
//@ts-check

"use strict";

module.exports = (socket) => {
    var express = require("express");
    var router = express.Router();
    var moment = require("moment");

    const _Ctvp = require("../lib/ctvp.js");
    const Ctvp = new _Ctvp();

    const add = (req, res) => {
        var ctvp = req.body;
        var container = require("../include/container.js");

        let checkContainer = container(ctvp.CONTENEDOR);

        ctvp.STATUS = {
            STATUS: 0,
            AUD_USER: req.user.USUARIO,
            AUD_TIME: moment().toDate()
        };

        Ctvp.add(ctvp)
            .then(data => {
                if (checkContainer === false) {
                    data.message = "El Contenedor no es válido por su dígito verificador";
                }
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    };

    const getCtvp = (req, res) => {
        var params = { contenedor: req.params.contenedor };

        Ctvp.check(params)
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    };

    const getCtvps = (req, res) => {

        Ctvp.get()
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    };

    const invoice = (req, res) => {

        var ctvp = req.body;

        var params = {
            contenedor: ctvp.CONTENEDOR,
            user: req.user
        };

        Ctvp.invoice(params)
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });

    };

    router.post("/", add);
    router.get("/", getCtvps);
    router.get("/:contenedor", getCtvp);
    router.put("/invoice", invoice);

    return router;
};