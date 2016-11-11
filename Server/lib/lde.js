/**
 * Created by diego on 09/05/16.
 */

'use strict';
var Error = require('../include/error.js');

class ldeMongoDb {
    constructor (model) {
        this.model = model;
    }

    add (params) {
        return new Promise((resolve, reject) => {
            this.model.create(params, function (err, data) {
                let result;
                if (err) {
                    result = Error.ERROR("MONGO-ERROR").data(err.message);
                    reject(result);
                } else {
                    result = {
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
                        result = Error.ERROR("MONGO-ERROR").data(err.message);
                        reject(result);
                    } else {
                        if (data.length === 0) {
                            /** Libre deuda inexistente para este contenedor. */
                            result = Error.ERROR("AGP-0001").data({CONTENEDOR: contenedor});
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
                                    result = Error.ERROR("MONGO-ERROR").data(err.message);
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
                                            result = Error.ERROR("MONGO-ERROR").data(err.message);
                                            reject(result);
                                        } else {
                                            result = {
                                                status: "OK",
                                                message: `El Libre Deuda ha sido Anulado correctamente.`,
                                                data: {
                                                    ID: dataSaved._id,
                                                    STATUS: status
                                                }
                                            };
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

    enableLde (params) {
        return new Promise((resolve, reject) => {
            var result;
            this.getLde(params)
            .catch(err => {
                    reject(err);
                })
            .then(data => {

                        lde = data.data[0];
                        var lastStatus = lde.STATUS[lde.STATUS.length-1];
                        if (lastStatus.STATUS !== 9) {
                            result = Error.ERROR("AGP-0001").data({CONTENEDOR: lde.CONTENEDOR});
                            reject(result);
                        } else {
                            this.model.findOne({_id: lde.ID.id}, (err, lde) => {
                                if (err) {
                                    result = Error.ERROR("MONGO-ERROR").data(err.message);
                                    reject(result);
                                } else {
                                    let aud_date = new Date();
                                    let status = {
                                        STATUS: 0,
                                        AUD_TIME: aud_date,
                                        AUD_USER: params.user.USUARIO
                                    };
                                    lde.STATUS.push(status);
                                    lde.save((err, dataSaved) => {
                                        if (err) {
                                            result = Error.ERROR("MONGO-ERROR").data(err.message);
                                            reject(result);
                                        } else {
                                            result = {
                                                status: "OK",
                                                message: "El Libre Deuda ha sido Habilitado correctamente.",
                                                data: {
                                                    ID: dataSaved._id,
                                                    STATUS: status
                                                }
                                            };
                                            resolve(result);
                                        }
                                    });
                                }
                            });
                        }
                });
        });
    }

    forwardLde (params) {
        return new Promise((resolve, reject) => {
            var result;
            this.checkLde(params)
                .then(lde => {
                    if (lde.data.length <= 0) {
                        result = Error.ERROR("AGP-0001").data({CONTENEDOR: params.contenedor});
                        reject(result);
                    } else {
                        lde = lde.data;
                        var lastStatus = lde.STATUS;
                        if (lastStatus !== 0 && lastStatus !== 3) {
                            result = Error.ERROR("AGP-0001").data({CONTENEDOR: params.contenedor});
                            reject(result);
                        } else {
                            this.model.findOne({_id: lde.ID})
                                .exec((err, lde) => {
                                    if (err) {
                                        result = Error.ERROR("MONGO-ERROR").data(err.message);
                                        reject(result);
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
                                                result = Error.ERROR("AGP-0007").data({FECHA_DEV: placeFirst.DATE_TO})
                                                return reject(result);
                                            }
                                        }

                                        lde.save((err, dataSaved) => {
                                            if (err) {
                                                result = Error.ERROR("MONGO-ERROR").data(err.message);
                                                reject(result);
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
                                                resolve(result);
                                            }
                                        });
                                    }
                                });
                        }
                    }
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    invoiceLde (params) {
        return new Promise((resolve, reject) => {
            var result;
            this.checkLde(params)
            .catch(err => {
                    reject(err);
                })
            .then(data => {
                    if (data.status === 'OK') {
                        let ID = data.data.ID;
                        this.model.findOne({_id: ID})
                            .exec((err, lde) => {
                                if (err) {
                                    result = Error.ERROR("MONGO-ERROR").data(err.message);
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
                                            result = Error.ERROR("MONGO-ERROR").data(err.message);
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
                        result = Error.ERROR("MONGO-ERROR").data(err.message);
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
            var result;
            this.getLde(params)
            .then(data => {
                    data = data.data.filter(item => (item.STATUS.STATUS === 3 || item.STATUS.STATUS === 0));
                    let lde = data[0];
                    this.model.find({_id: lde.ID.id}, (err, data) => {
                        if (err) {
                            result = Error.ERROR("MONGO-ERROR").data(err.message);
                            reject(result);
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
                                        result = Error.ERROR("MONGO-ERROR").data(err.message);
                                        reject(result);
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
        return this.clase.enableLde(params);
    }

    forwardLde (params) {
        return this.clase.forwardLde(params);
    }

    invoiceLde (params) {
        return this.clase.invoiceLde(params);
    }

    changePlace (params) {
        return this.clase.changePlace(params);
    }
}

module.exports = lde;