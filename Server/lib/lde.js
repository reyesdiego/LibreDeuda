/**
 * Created by diego on 09/05/16.
 */

'use strict';

class ldeMongoDb {
    constructor (model) {
        this.model = model;
    }

    add (params) {
        return new Promise((resolve, reject) => {
            this.model.create(params, function (err, data) {
                if (err) {
                    reject({status: "ERROR", message: err.message, data: err});
                } else {
                    let result = {
                        status: "OK",
                        data: {
                            ID: data._id,
                            ID_CLIENTE: data.ID_CLIENT
                        }};
                    resolve(result);
                }
            });
        });
    }

    checkLde (params) {
        return new Promise((resolve, reject) => {
            var moment = require("moment");
            var result;
            var contenedor = params.contenedor;
            var match = {CONTAINER: contenedor};
            var toDay = moment(moment().format("YYYY-MM-DD")).toDate();

            if (params.ID_CLIENTE !== undefined) {
                match.ID_CLIENT = params.id_cliente;
            }
            if (params.ID !== undefined) {
                match._id = params.ID;
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
                        id: '$_id'},
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
                {$match: {'STATUS.STATUS': 0, $or: [{EXPIRATION: '0'}, {EXPIRATION: '1', 'RETURN_TO.DATE_TO': {$gte: toDay}}] }},
                {$project: {
                    '_id': false,
                    ID: '$_id.id',
                    TERMINAL: true,
                    SHIP: true,
                    TRIP: true,
                    CONTAINER: true,
                    BL: true,
                    ID_CLIENT: true,
                    CUIT: '$CLIENT.CUIT',
                    EMAIL_CLIENT: '$CLIENT.EMAIL_CLIENT',
                    LUGAR_DEV: '$RETURN_TO.PLACE',
                    FECHA_DEV: '$RETURN_TO.DATE_TO',
                    STATUS: '$STATUS.STATUS',
                    VENCE: '$EXPIRATION'
                }}
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
                                message: "No existe Libre Deuda para este Contenedor."};
                            reject(result);
                        } else {
                            let lde = data[0];
                            result = {
                                status: "OK",
                                message: "El Libre Deuda es Válido",
                                data: lde
                            };
                            resolve(result);
                        }
                    }
                });
        });
    }

    disableLde (params) {
        return new Promise((resolve, reject) => {
            var result;
            this.checkLde(params)
                .then(data => {
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
                                    reject(result);
                                } else {
                                    var aud_date = new Date();
                                    var status = {
                                        STATUS: 9,
                                        AUD_TIME: aud_date,
                                        AUD_USER: params.user.USUARIO
                                    };
                                    lde.STATUS.push(status);

                                    lde.save((err, dataSaved) => {
                                        if (err) {
                                            result = {
                                                status: "ERROR",
                                                message: err.message,
                                                data: err
                                            };
                                            reject(result);
                                        } else {
                                            result = {
                                                status: "OK",
                                                message: `El Libre Deuda ha sido Anulado`,
                                                data: {
                                                    ID: dataSaved._id,
                                                    STATUS: status
                                                }
                                            }
                                            resolve(result);
                                        }
                                    });
                                }
                            });
                    }
                })
                .catch(err => {
                    reject(err);
                });
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
                            lde.save((err, dataSaved) => {
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
                    if (lde.data.length>0) {
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
                    } else {
                        callback({
                            status: "ERROR",
                            message: `No se encuentra Libre Deuda del Contenedor`
                        });
                    }
                }
            }
        });
    }

    invoiceLde (params) {
        return new Promise((resolve, reject) => {
            var result;
            this.checkLde(params)
            .catch(err => {
                    result = {
                        status: "ERROR",
                        message: err.message,
                        data: err
                    };
                    reject(result);
                })
            .then(data => {
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
                                    reject(result);
                                } else {

                                    var aud_date = new Date();
                                    var status = {
                                        STATUS: 3,
                                        AUD_TIME: aud_date,
                                        AUD_USER: params.user.USUARIO
                                    };
                                    lde.STATUS.push(status);

                                    let newClient = {};
                                    if (params.email) {
                                        let client = lde.CLIENT[lde.CLIENT.length - 1];
                                        newClient = {
                                            CUIT: client.CUIT,
                                            EMAIL_CLIENT: params.email,
                                            AUD_TIME: aud_date,
                                            AUD_USER: params.user.USUARIO
                                        };
                                        lde.CLIENT.push(newClient);
                                    }
                                    lde.save((err, dataSaved) => {
                                        if (err) {
                                            result = {
                                                status: "ERROR",
                                                message: err.message,
                                                data: err
                                            };
                                            reject(result);
                                        } else {
                                            result = {
                                                status: "OK",
                                                message: `El Libre Deuda ha sido Entregado`,
                                                data: {
                                                    ID: dataSaved._id,
                                                    STATUS: status,
                                                    CLIENT: newClient
                                                }
                                            };
                                            resolve(result);
                                        }
                                    });
                                }
                            });
                    } else {
                        reject(data);
                    }
                });
            });
    }

    getLde (params) {
        return new Promise((resolve, reject) => {
            var result;
            var param, match;
            var contenedor = params.contenedor;

            match = {
                CONTAINER: contenedor
            };
            if (params.id_cliente !== undefined) {
                match.ID_CLIENT = params.id_cliente;
            }
            if (params.id !== undefined) {
                match._id = params.id;
            }

            param = [
                {$unwind: '$STATUS'},
                {$sort: {'STATUS.AUD_TIME': 1}},
                {$group: {
                    _id: {id: '$_id'},
                    TERMINAL: {'$first': '$TERMINAL'},
                    SHIP: {'$first': '$SHIP'},
                    TRIP: {'$first': '$TRIP'},
                    CONTAINER: {'$first': '$CONTAINER'},
                    BL: {'$first': '$BL'},
                    ID_CLIENT: {'$first': '$ID_CLIENT'},
                    STATUS: {'$last': '$STATUS'}
                }},
                {$match: match},
                {$project: {
                    //ID: '$_id.id',
                    TERMINAL: true,
                    SHIP: true,
                    TRIP: true,
                    CONTAINER: true,
                    BL: true,
                    ID_CLIENT: true,
                    STATUS: true
                }}
            ];
            this.model.aggregate(param)
                .exec((err, data) => {
                    if (err) {
                        result = {
                            status: "ERROR",
                            message: err.message,
                            data: err
                        };
                        reject(result);
                    } else {

                        result = {
                            status: "OK",
                            data: data.map(lde => ({
                                ID: lde._id,
                                ID_CLIENT: lde.ID_CLIENT,
                                CUIT: lde.CUIT,
                                CONTENEDOR: lde.CONTAINER,
                                TERMINAL: lde.TERMINAL,
                                BUQUE: lde.SHIP,
                                VIAJE: lde.TRIP,
                                BL: lde.BL,
                                VENCE: lde.EXPIRATION,
                                STATUS: lde.STATUS,
                                CLIENT: lde.CLIENT,
                                RETURN_TO: lde.RETURN_TO
                            }))
                        };
                        resolve(result);
                    }
                });
        });
    }

    changePlace (params) {
        return new Promise((resolve, reject) => {
            this.getLde(params)
            .then(data => {
                    data = data.data.filter(item => (item.STATUS.STATUS === 3 || item.STATUS.STATUS === 0));
                    let lde = data[0];
                    this.model.find({_id: lde.ID.id}, (err, data) => {
                        if (err) {
                            reject(err);
                        } else {
                            let lde = data[0];
                            /** Si no recibe lugar o fecha de devolucion se utiliza la ultima que tenia*/
                            let lastReturn = lde.RETURN_TO[lde.RETURN_TO.length-1];

                            /**La fecha de devolucion no puede ser menor a la fecha original*/
                            if (lde.RETURN_TO[0].DATE_TO < params.fecha_dev) {
                                reject({
                                    status: "ERROR",
                                    message: "La nueva fecha de devolución debe ser menos a la original."
                                });
                            } else {
                                let newReturn_To = {
                                    PLACE: (params.lugar_dev !== undefined) ? params.lugar_dev : lastReturn.PLACE,
                                    DATE_TO: (params.fecha_dev !== undefined) ? params.fecha_dev : lastReturn.DATE_TO,
                                    AUD_TIME: new Date(),
                                    AUD_USER: params.user.USUARIO
                                };
                                lde.RETURN_TO.push(newReturn_To);
                                lde.save((err, data) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(data);
                                    }
                                });
                            }
                        }
                    });
                })
            .catch(err => {
                    reject(err);
                });
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

    add (params) {
        return this.clase.add(params);
    }

    getLde (params) {
        return this.clase.getLde(params);
    }

    checkLde (params) {
        return this.clase.checkLde(params);
    }

    disableLde (params) {
        return this.clase.disableLde(params);
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
        return this.clase.invoiceLde(params);
    }

    changePlace (params) {
        return this.clase.changePlace(params);
    }
}

module.exports = lde;