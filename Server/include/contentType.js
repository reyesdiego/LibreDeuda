/**
 * Created by diego on 11/11/16.
 */
"use strict";

var isApplicationJson = (req, res, next) => {
    var APPLICATION_JSON = "application/json";
    var contentType = req.headers["content-type"].toLowerCase();
    if (APPLICATION_JSON === contentType) {
        next();
    } else {
        var result = {
            status: "ERROR",
            message: "El Content-Type debe ser application/json"
        };
        res.status(415).send(result);
    }
};
module.exports.isApplicationJson = isApplicationJson;

var isTextPlain = (req, res, next) => {
    var TEXT_PLAIN = "text/plain";
    var contentType = req.headers["content_type"].toLowerCase();
    if (TEXT_PLAIN === contentType) {
        next();
    } else {
        var result = {
            status: "ERROR",
            message: "El Content-Type debe ser text/plain"
        };
        res.status(415).send(result);
    }
};
module.exports.isTextPlain = isTextPlain;
