/**
 * Created by diego on 09/05/16.
 */

'use strict';

class ldeMongoDb {
    constructor (model) {
        this.model = model;
    }

    checkLde (params, callback) {
        var result;
        var contenedor = params.contenedor;
        var match = {CONTAINER: contenedor};
        var toDay = new Date();

        if (params.ID_CLIENTE !== undefined) {
            match.ID_CLIENT = params.id_cliente;
        }
        var param = [
            {$match: match
            },
            {$unwind: '$STATUS'},
            {$unwind: '$RETURN_TO'},
            {$unwind: '$CLIENT'},
            {$sort: {'STATUS.AUD_TIME': 1, 'RETURN_TO.AUD_TIME': 1}},
            {$group: {
                _id: {
                    _id: '$_id'},
                TERMINAL: {'$first': '$TERMINAL'},
                SHIP: {'$first': '$SHIP'},
                TRIP: {'$first': '$TRIP'},
                CONTAINER: {'$first': '$CONTAINER'},
                BL: {'$first': '$BL'},
                ID_CLIENT: {'$first': '$ID_CLIENT'},
                STATUS: {'$last': '$STATUS'},
                RETURN_TO: {'$last': '$RETURN_TO'},
                CLIENT: {'$last': '$CLIENT'},
                EXPIRATION: {'$first': '$EXPIRATION'}
            }},
            {$match: {'STATUS.STATUS': 0, $or: [{EXPIRATION: 0}, {EXPIRATION: 1, 'RETURN_TO.DATE_TO': {$gte: toDay}}] }},
            {$project: {
                '_id': false,
                ID: '$_id._id',
                TERMINAL: true,
                SHIP: true,
                TRIP: true,
                CONTAINER: true,
                BL: true,
                ID_CLIENT: true,
                STATUS: true,
                RETURN_TO: true,
                CLIENT: true,
                EXPIRATION: true
            }}
        ];

        this.model.aggregate(param)
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
                    let lde = data[0];
                    result = {
                        status: "OK",
                        message: "El Libre Deuda es Válido",
                        data: {
                            ID: lde.ID,
                            BUQUE: lde.SHIP,
                            VIAJE: lde.TRIP,
                            CONTENEDOR: lde.CONTAINER,
                            BL: lde.BL,
                            ID_CLIENTE: lde.ID_CLIENT,
                            CUIT: lde.CLIENT.CUIT,
                            EMAIL_CLIENT: lde.CLIENT.EMAIL_CLIENT,
                            LUGAR_DEV: lde.RETURN_TO.PLACE,
                            FECHA_DEV: lde.RETURN_TO.DATE_TO,
                            STATUS: lde.STATUS.STATUS,
                            TERMINAL: lde.TERMINAL,
                            VENCE: lde.EXPIRATION
                        }
                    };
                    callback(undefined, result);
                }
            }
        });
    }

    disableLde (params, callback) {
        var result;
        this.checkLde(params, (err, data) => {
            if (err) {
                result = {
                    status: "ERROR",
                    message: err.message,
                    data: err
                };
                callback(result);
            } else {
                if (data.status === 'OK') {
                    let ID = data.data.ID;
                    this.model.findOne({_id: ID})
                        .exec((err, lde) => {
                            if (err) {
                                result = {
                                    status: "ERROR",
                                    message: err.message,
                                    data: err
                                };
                                callback(result);
                            } else {
                                var aud_date = new Date();
                                var status = {
                                    STATUS: 9,
                                    AUD_TIME: aud_date,
                                    AUD_USER: params.user.USUARIO
                                };
                                lde.STATUS.push(status);

                                lde.save((err, dataSaved, rowsAffected) => {
                                    if (err) {
                                        result = {
                                            status: "ERROR",
                                            message: err.message,
                                            data: err
                                        };
                                        callback(result);
                                    } else {
                                        result = {
                                            status: "OK",
                                            message: `El Libre Deuda ha sido Anulado`,
                                            data: {
                                                ID: dataSaved._id,
                                                STATUS: status
                                            }
                                        }
                                        callback(undefined, result);
                                    }
                                });
                            }
                        });
                }
            }
        });
    }

    enableLde (params, callback) {
        var result;
        this.getLde(params, (err, lde) => {
            if (err) {
                result = {
                    status: "ERROR",
                    message: err.message,
                    data: err
                };
                callback(result);
            } else {
                if (lde.status === 'OK') {
                    lde = lde.data[0];
                    var lastStatus = lde.STATUS[lde.STATUS.length-1];
                    if (lastStatus.STATUS !== 9) {
                        callback({
                            status: "ERROR",
                            message: `No se encuentra Libre Deuda del Contenedor ${lde.CONTENEDOR} para habilitar`
                        });
                    } else {
                        this.model.findOne({_id: lde._id}, (err, lde) => {
                            let aud_date = new Date();
                            let status = {
                                STATUS: 0,
                                AUD_TIME: aud_date,
                                AUD_USER: params.user.USUARIO
                            };
                            lde.STATUS.push(status);
                            lde.save((err, dataSaved, rowsAffected) => {
                                if (err) {
                                    result = {
                                        status: "ERROR",
                                        message: err.message,
                                        data: err
                                    };
                                    callback(result);
                                } else {
                                    result = {
                                        status: "OK",
                                        message: "El Libre Deuda ha sido Habilitado",
                                        data: {
                                            ID: dataSaved._id,
                                            STATUS: status
                                        }
                                    };
                                    callback(undefined, result);
                                }
                            });
                        });
                    }
                }
            }
        });
    }

    forwardLde (params, callback) {
        var result;
        this.getLde(params, (err, lde) => {
            if (err) {
                result = {
                    status: "ERROR",
                    message: err.message,
                    data: err
                };
                return callback(result);
            } else {
                if (lde.status === 'OK') {
                    lde = lde.data[0];
                    var lastStatus = lde.STATUS[lde.STATUS.length - 1];
                    if (lastStatus.STATUS !== 0 && lastStatus.STATUS !== 3) {
                        callback({
                            status: "ERROR",
                            message: `No se encuentra Libre Deuda del Contenedor ${lde.CONTENEDOR}`
                        });
                    } else {
                        this.model.findOne({_id: lde._id})
                            .exec((err, lde) => {
                                if (err) {
                                    result = {
                                        status: "ERROR",
                                        message: err.message,
                                        data: err
                                    };
                                    return callback(result);
                                } else {
                                    var aud_date = new Date();
                                    let client = {
                                        CUIT: params.cuit,
                                        AUD_TIME: aud_date,
                                        AUD_USER: params.user.USUARIO
                                    };
                                    lde.CLIENT.push(client);

                                    let return_to = {};

                                    if (params.fecha_dev) {
                                        var placeFirst = lde.RETURN_TO[0];
                                        var placeLast = lde.RETURN_TO[lde.RETURN_TO.length - 1];
                                        if (placeFirst.DATE_TO > params.fecha_dev) {
                                            return_to.DATE_TO = params.fecha_dev;
                                            return_to.PLACE = placeLast.PLACE;
                                            return_to.AUD_USER = params.user.USUARIO;
                                            return_to.AUD_TIME = aud_date;
                                            lde.RETURN_TO.push(return_to);
                                        } else {
                                            return callback({
                                                status: "ERROR",
                                                message: `La nueva fecha de devolución no puede superar a la vigente ${place.DATE_TO}`
                                            });
                                        }
                                    }

                                    lde.save((err, dataSaved, rowsAffected) => {
                                        if (err) {
                                            result = {
                                                status: "ERROR",
                                                message: err.message,
                                                data: err
                                            };
                                            callback(result);
                                        } else {
                                            let cuit = dataSaved.CLIENT[dataSaved.CLIENT.length - 1].CUIT;
                                            let fecha_dev = dataSaved.RETURN_TO[dataSaved.RETURN_TO.length - 1].DATE_TO;
                                            result = {
                                                status: "OK",
                                                message: `El Libre Deuda ha sido Habilitado para el CUIT ${cuit}`,
                                                data: {
                                                    ID: dataSaved._id,
                                                    CUIT: cuit,
                                                    FECHA_DEV: fecha_dev
                                                }
                                            };
                                            callback(undefined, result);
                                        }
                                    });
                                }
                            });
                    }
                }
            }
        });
    }

    invoiceLde (params, callback) {
        var result;
        this.checkLde(params, (err, data) => {
            if (err) {
                result = {
                    status: "ERROR",
                    message: err.message,
                    data: err
                };
                callback(result);
            } else {
                if (data.status === 'OK') {
                    let ID = data.data.ID;
                    this.model.findOne({_id: ID})
                        .exec((err, lde) => {
                            if (err) {
                                result = {
                                    status: "ERROR",
                                    message: err.message,
                                    data: err
                                };
                                callback(result);
                            } else {

                                var aud_date = new Date();
                                var status = {
                                    STATUS: 3,
                                    AUD_TIME: aud_date,
                                    AUD_USER: params.user.USUARIO
                                };
                                lde.STATUS.push(status);

                                if (params.email) {
                                    let client = lde.CLIENT[lde.CLIENT.length -1];
                                    let newClient = {
                                        CUIT: client.CUIT,
                                        EMAIL_CLIENT: params.email,
                                        AUD_TIME: aud_date,
                                        AUD_USER: params.user.USUARIO
                                    };
                                    lde.CLIENT.push(newClient);
                                }
                                lde.save((err, dataSaved, rowsAffected) => {
                                    if (err) {
                                        result = {
                                            status: "ERROR",
                                            message: err.message,
                                            data: err
                                        };
                                        callback(result);
                                    } else {
                                        result = {
                                            status: "OK",
                                            message: `El Libre Deuda ha sido Entregado`,
                                            data: {
                                                ID: dataSaved._id,
                                                STATUS: status
                                            }
                                        };
                                        callback(undefined, result);
                                    }
                                });
                            }
                        });
                }
            }
        });
    }

    getLde (params, callback) {
        var result;
        var contenedor = params.contenedor;

        this.model.find({CONTAINER: contenedor})
            .exec((err, data) => {
                if (err) {
                    result = {
                        status: "ERROR",
                        message: err.message,
                        data: err
                    };
                    callback(result);
                } else {
                    result = {
                        status: "OK",
                        data: data
                    };
                    callback(undefined, result);
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

    checkLde (params) {
        var promise = new Promise((resolve, reject) => {
            this.clase.checkLde(params, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
        return promise;
    }

    disableLde (params) {
        var promise = new Promise((resolve, reject) => {
            this.clase.disableLde(params, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
        return promise;
    }

    enableLde (params) {
        var promise = new Promise((resolve, reject) => {
            this.clase.enableLde(params, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
        return promise;
    }

    forwardLde (params) {
        var promise = new Promise((resolve, reject) => {
            this.clase.forwardLde(params, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
        return promise;
    }

    invoiceLde (params) {
        var promise = new Promise((resolve, reject) => {
            this.clase.invoiceLde(params, (err, data) => {
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