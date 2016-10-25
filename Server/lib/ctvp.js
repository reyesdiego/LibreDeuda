/**
 * Created by diego on 26/09/16.
 */

'use strict';

class ctvpMongoDb {
    constructor (model) {
        this.model = model;
    }

    add (params) {
        return new Promise((resolve, reject) => {
            this.model.create(params, (err, data) => {
                if (err) {
                    reject({status: "ERROR", message: err.message, data: err});
                } else {
                    let result = {status: "OK", data: data};
                    resolve(result);
                }
            });
        });
    }

    check (params) {
        return new Promise((resolve, reject) => {
            var result;
            var contenedor = params.contenedor;
            var match = {CONTENEDOR: contenedor};

            var param = [
                {$match: match},
                {$unwind: '$STATUS'},
                {$sort: {'STATUS.AUD_TIME': -1}}
            ];

            this.model.aggregate(param)
                .exec((err, data) => {
                    if (err) {
                        result = {
                            status: "ERROR",
                            message: err.message,
                            data: err};
                        reject(result);
                    } else {
                        if (data.length === 0) {
                            result = {
                                status: "ERROR",
                                message: "No existe Control de Tránsito Vehicular para este Contenedor."};
                            reject(result);
                        } else {
                            let ctvp = data[0];
                            ctvp.ID = ctvp._id;
                            delete ctvp._id;
                            delete ctvp.__v;
                            if (ctvp.STATUS.STATUS === 0) {
                                result = {
                                    status: "OK",
                                    message: "El Control Vehicular es Válido",
                                    data: ctvp
                                };
                                resolve(result);
                            } else {
                                result = {
                                    status: "ERROR",
                                    message: "El Control de Tránsito Vehicular para este Contenedor ya ha sido utilizado."};
                                reject(result);
                            }

                        }
                    }
                });
        });
    }

    invoice (params) {
        return new Promise((resolve, reject) => {
            var moment = require('moment');

            this.check(params)
                .then(data => {
                    this.model.find({_id: data.data.ID}, (err, ctvp) => {
                        if (err) {
                            reject({status: "ERROR", message: err.message});
                        } else {
                            let newSatus = {
                                STATUS: 3,
                                AUD_USER: params.user.USUARIO,
                                AUD_TIME: moment().toDate()
                            };
                            ctvp[0].STATUS.push(newSatus);
                            ctvp[0].save((err, ctvpSaved) => {
                                if (err) {
                                    reject({status: "ERROR", message: err.message});
                                } else {
                                    resolve({
                                        status: "OK",
                                        data: ctvpSaved});
                                }
                            });
                        }
                    });
                })
                .catch(err => {
                    reject({status: "ERROR", message: err.message});
                });
        });
    };

}

class ctvp {
    constructor (connection) {
        if (connection !== undefined) {
            this.connection = connection;
            //this.clase = new GateOracle(this.connection);
        } else {
            this.connection = require('../models/ctvp.js');
            this.clase = new ctvpMongoDb(this.connection);
        }
    }

    add (params) {
        return this.clase.add(params);
    }

    check (params) {
        return this.clase.check(params);
    }

    invoice (params) {
        return this.clase.invoice(params);
    }
}

module.exports = ctvp;