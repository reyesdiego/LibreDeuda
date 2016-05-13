/**
 * Created by diego on 09/05/16.
 * @module Account
 */
'use strict';

class Account {
    constructor () {

    }
    getAccount (user, password, callback) {
        var Account = require("../models/account");

        var account = Account.findOne({email: user});
        account.exec(function (err, dataAccount) {
            if (err) {
                res.status(401).send({status: "ERROR",
                    message: err.message,
                    data: err});
            } else {
                if (!dataAccount) {
                    callback({status: "ERROR", message: "El Usuario es Inexistente."});
                } else {
                    if (dataAccount.password !== password) {
                        callback({status: "ERROR", message: "La Clave es Incorrecta."});
                    } else {
                        callback(undefined, {status: "OK", data: dataAccount });
                    }
                }
            }
        });
    }
}

module.exports = Account;