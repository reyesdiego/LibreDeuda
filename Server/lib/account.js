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
        var Error = require('../include/error.js');
        var result;

        Account.findOne({email: user})
        .lean()
        .exec((err, dataAccount) => {
            if (err) {
                result = Error.ERROR("MONGO-ERROR").data(err);
                callback(result);
            } else {
                if (!dataAccount) {
                    result = Error.ERROR("AGP-0010").data({USUARIO: user});
                    callback(result);
                } else {
                    if (dataAccount.password !== password) {
                        result = Error.ERROR("AGP-0011").data({USUARIO: user, CLAVE: password});
                        callback(result);
                    } else {
                        callback(undefined, {status: "OK", data: dataAccount });
                    }
                }
            }
        });
    }
}

module.exports = Account;
