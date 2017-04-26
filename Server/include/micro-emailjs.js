/**
 * Created by diego on 08/03/17.
 */
"use strict";

const config = require("../config/config.js");
var seneca = require("seneca")();
seneca.client( config.microService.email.port, config.microService.email.host);

function promisify(err, data) {
    return new Promise((resolve, reject) => {
        if (err) {
            reject(err);
        } else {
            if (data.status === 'OK') {
                resolve({status: "OK",
                    data: data.data});
            } else {
                reject({status: "ERROR",
                    message: data.message,
                    data: data.data});
            }
        }
    });
}


const send = (to, subject, text, attachment) => {
    return new Promise((resolve, reject) => {
        seneca.act({role: "email", cmd: "send", to: to, subject: subject, text: text}, (err, data) => {
            promisify(err, data)
            .then(data => {
                    resolve(data);
                })
            .catch(err => {
                    reject(err);
                });
        });
    });
};

module.exports.send = send;