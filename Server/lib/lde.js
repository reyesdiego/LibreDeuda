/**
 * Created by diego on 09/05/16.
 */

'use strict';

class ldeMongoDb {
    constructor (model) {
        this.model = model;
    }

    getLde (params, callback) {
        var result;
        var contenedor = params.contenedor;
        var Enumerable = require("linq");

        this.model.aggregate([
            {   $match: {CONTAINER: contenedor}},
            {   $unwind: '$STATUS'},
            {   $project: {
                ID: '$_id',
                _id: false,
                CONTENEDOR: '$CONTAINER',
                STATUS: '$STATUS.STATUS',
                AUD_TIME: '$STATUS.AUD_TIME',
                }}
        ])
        .exec((err, data) => {
            if (err) {
                result = {
                    status: "ERROR",
                    message: err.message,
                    data: err};
                callback(result);
            } else {
                if (data.length === 0) {
                    result = {
                        status: "ERROR",
                        message: "No existe Libre Deuda para este Contenedor."};
                    callback(result);
                } else {
                    var statuses = Enumerable.from(data)
                        .orderByDescending('$.AUD_TIME')
                        .select('value, idx => {ID: value.ID, CONTENEDOR: value.CONTENEDOR, STATUS: value.STATUS}')
                        .toArray();
                    if (statuses[0].STATUS !== 'undefined' && statuses[0].STATUS === 9) {
                        result = {
                            status: "ERROR",
                            message: "El Libre Deuda ha sido Anulado",
                            data: statuses[0]};
                        callback(result);
                    } else {
                        result = {
                            status: "OK",
                            message: "El Libre Deuda es Válido",
                            data: statuses[0]
                        };
                        callback(undefined, result);
                    }
                }
            }
        });
    }
}

class lde {
    constructor (connection) {
        if (connection !== undefined) {
            this.connection = connection;
            //this.clase = new GateOracle(this.connection);
        } else {
            this.connection = require('../models/freeDebt.js');
            this.clase = new ldeMongoDb(this.connection);
        }
    }

    getLde (params) {
        var promise = new Promise((resolve, reject) => {
            this.clase.getLde(params, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
        return promise;
    }
}

module.exports = lde;