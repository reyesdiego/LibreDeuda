/**
 * Created by diego on 09/05/16.
 * @module Account
 */
'use strict';

class Account {
    constructor () {
        this.model = require("../models/account");
        this.Error = require('../include/error.js');
    }

    static get STATUS() {
        return {
            DISABLED: 9,
            ENABLED: 2,
            NEW: 0,
            PENDING: 1
        };
    }
    static set STATUS(value) {
        throw ({status: "ERROR", http_status: 500, message: "La propiedad STATUS es de Solo Lectura"});
    }

    register (user) {
        return new Promise((resolve, reject) => {
            user.status = 0;
            var newUser = new this.model(user);
            newUser.save((err, data) => {
                if (err) {
                    if (err.code === 11000) {
                        reject({
                            status: "ERROR",
                            code: err.code,
                            message: `La cuenta ${user.email} yá existe.`,
                            http_status: 500
                        });
                    } else {
                        reject(this.Error.ERROR("MONGO-ERROR").data(err));
                    }
                } else {
                    resolve({
                        status: 'OK',
                        data: data
                    });
                }
            });
        });
    }

    setStatus (id, status) {
        return new Promise((resolve, reject) => {
            this.model.findOne({_id: id})
            .exec((err, account) => {
                if (err) {
                    reject(this.Error.ERROR("MONGO-ERROR").data(err));
                } else {
                    account.status = status;
                    account.dateUpdated = new Date();
                    account.save((err, data) => {
                        if (err) {
                            reject(this.Error.ERROR("MONGO-ERROR").data(err));
                        } else {
                            resolve({
                                status: 'OK',
                                data: data
                            });
                        }
                    });
                }
            });
        });
    }

    getAccount (user, password) {
        return new Promise((resolve, reject) => {
            this.model.findOne({email: user})
                .lean()
                .exec((err, dataAccount) => {
                    if (err) {
                        reject(this.Error.ERROR("MONGO-ERROR").data(err));
                    } else {
                        if (!dataAccount) {
                            reject(this.Error.ERROR("AGP-0010").data({USUARIO: user}));
                        } else {
                            if (dataAccount.password !== password) {
                                reject(this.Error.ERROR("AGP-0011").data({USUARIO: user, CLAVE: password}));
                            } else {
                                resolve({status: "OK", data: dataAccount });
                            }
                        }
                    }
                });
        });
    }

    /**
     * @return {Object}
     * */
    toString () {
        return "Account object";
    }
}

module.exports = Account;
