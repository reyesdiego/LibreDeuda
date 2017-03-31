/**
 * Created by diego on 08/03/17.
 */
"use strict";

const config = require("../config/config.js");
var seneca = require("seneca")();
seneca.client(config.microService.email.port, config.microService.email.host);

const send = (to, subject, text, attachment) => {
    return new Promise((resolve, reject) => {
        seneca.act({role: "email", cmd: "send", to: to, subject: subject, text: text}, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

module.exports.send = send;