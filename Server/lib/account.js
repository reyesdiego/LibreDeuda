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
                callback({status: "ERROR",
                    message: err.message,
                    data: err});
            } else {
                if (!dataAccount) {
                    callback({status: "ERROR", message: "El Usuario No Existe."});
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
