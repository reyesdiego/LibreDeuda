/**
 * Created by diego on 23/09/16.
 */

module.exports = (socket) => {
    "use strict";
    var express = require("express");
    var router = express.Router();
    var moment = require('moment');

    var Ctvp = require('../lib/ctvp.js');
    Ctvp = new Ctvp();

    let add = (req, res) => {
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

    let getCtvp = (req, res) => {
        var params = {contenedor: req.params.contenedor};

        Ctvp.check(params)
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    };

    let invoice = (req, res) => {

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
    router.get("/:contenedor", getCtvp);
    router.put("/invoice", invoice);

    return router;
};