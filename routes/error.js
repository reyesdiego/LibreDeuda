/**
 * Created by diego on 14/11/16.
 */
//@ts-check

"use strict";

module.exports = () => {
    var express = require("express");
    var router = express.Router();
    var Error = require("../include/error.js");

    let getErrors = (req, res) => {
        var code = req.query.code;
        var result;

        if (code) {
            result = Error.getErrors(code);
        } else {
            result = Error.getErrors();
        }
        res.status(200).send({
            status: "OK",
            data: result
        });
    };

    router.get("/", getErrors);

    return router;
};