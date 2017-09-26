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

            var user = params.user.data;

            if (params.id_cliente !== undefined) {
                match.ID_CLIENT = params.id_cliente;
            }
            if (params.id !== undefined) {
                match._id = params.id;
            }
            if (user.group === 'TER') {
                match.TERMINAL = user.terminal;
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
                    STATUS_FIRST: {'$first': '$STATUS'},
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
                    USER: '$STATUS_FIRST.AUD_USER',
                    VENCE: '$EXPIRATION'
                }}
            ];

            this.model.aggregate(param)
                .exec((err, data) => {
                    if (err) {
                        result = Error.ERROR("MONGO-ERROR").data(err.message);
                        reject(result);
                    } else {
                        /** Libre deuda inexistente para este contenedor. */
                        result = Error.ERROR("AGP-0001").data({CONTENEDOR: contenedor});
                        if (data.length === 0) {
                            reject(result);
                        } else {
                            let lde = data[0];

                            if (user.group === 'AGE' && user.email !== lde.USER) {
                                reject(result);
                            } else {
                                result = {
                                    status: "OK",
                                    message: "El Libre Deuda es Válido",
                                    data: lde
                                };
                                resolve(result);
                            }
                        }
                    }
                });
        });
    }

    returnToLde (params) {
        return new Promise((resolve, reject) => {
            var moment = require("moment");
            var result;
            var contenedor = params.contenedor;
            var match = {CONTAINER: contenedor};
            var toDay = moment(moment().format("YYYY-MM-DD")).toDate();

            var user = params.user.data;

            if (params.id_cliente !== undefined) {
                match.ID_CLIENT = params.id_cliente;
            }
            if (params.id !== undefined) {
                match._id = params.id;
            }
            //if (user.group === 'TER') {
            //    match.TERMINAL = user.terminal;
            //}
            var param = [
                {$project: {
                    ID: '$_id',
                    CONTAINER: true,
                    ID_CLIENT: true,
                    TERMINAL: true,
                    STATUS_LAST: {$arrayElemAt: ['$STATUS', -1]},
                    RETURN_TO: {$arrayElemAt: ['$RETURN_TO', -1]}
                }},
                {$match: match},
                {$match: {'STATUS_LAST.STATUS': 3}},
                {$project: {
                    TERMINAL: '$TERMINAL',
                    CONTENEDOR: '$CONTAINER',
                    LUGAR_DEV: '$RETURN_TO.PLACE',
                    FECHA_DEV: '$RETURN_TO.DATE_TO'
                }}
            ];

            this.model.aggregate(param)
                .exec((err, data) => {
                    if (err) {
                        result = Error.ERROR("MONGO-ERROR").data(err.message);
                        reject(result);
                    } else {
                        /** Libre deuda inexistente para este contenedor. */
                        result = Error.ERROR("AGP-0001").data({CONTENEDOR: contenedor});
                        if (data.length === 0) {
                            reject(result);
                        } else {
                            let lde = data[0];

                            if (user.group === 'AGE' && user.email !== lde.USER) {
                                reject(result);
                            } else {
                                result = {
                                    status: "OK",
                                    message: "El Contenedor ya ha sido entregado.",
                                    data: lde
                                };
                                resolve(result);
                            }
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
                    let ID = data.data.ID;
                    this.model.findOne({_id: ID})
                        .exec((err, lde) => {
                            if (err) {
                                result = Error.ERROR("MONGO-ERROR").data(err.message);
                                reject(result);
                            } else {
                                if (lde.STATUS[0].AUD_USER !== params.user.USUARIO) {
                                    result = Error.ERROR("AGP-0008").data();
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
                            }
                        });
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
                        var lastStatus = lde.STATUS;
                        if (lastStatus.STATUS !== 9) {
                            result = Error.ERROR("AGP-0001").data({CONTENEDOR: lde.CONTENEDOR});
                            reject(result);
                        } else {
                            this.model.findOne({_id: lde.ID}, (err, lde) => {
                                if (err) {
                                    result = Error.ERROR("MONGO-ERROR").data(err.message);
                                    reject(result);
                                } else {
                                    if (lde.STATUS[0].AUD_USER !== params.user.USUARIO) {
                                        result = Error.ERROR("AGP-0008").data();
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
                                }
                            });
                        }
                });
        });
    }

    forwardLde (params) {
        return new Promise((resolve, reject) => {
            var result;
            var async = require("async");

            var user = params.user.data;

            if (user.group !== 'FOR') {
                result = Error.ERROR("AGP-0008").data({CONTENEDOR: params.contenedor});
            } else {
                let task,
                    tasks = [];
                this.getLdes(params, {skip: 0, limit: 10000})
                    .then(dataLdes => {

                        if (dataLdes.status === "OK" && dataLdes.totalCount > 0) {
                            dataLdes.data.forEach(item => {
                                task = (callbackAsync) => {
                                    let parametro = {
                                        contenedor: item.CONTENEDOR,
                                        cuit: params.cuit,
                                        user: params.user
                                    };
                                    this.checkLde(parametro)
                                        .then(lde => {

                                            if (lde.data.length <= 0) {
                                                result = Error.ERROR("AGP-0008").data({CONTENEDOR: params.contenedor});
                                                callbackAsync(null, result);
                                            } else {
                                                lde = lde.data;
                                                var lastStatus = lde.STATUS;
                                                if (lastStatus !== 0 && lastStatus !== 3) {
                                                    result = Error.ERROR("AGP-0001").data({CONTENEDOR: params.contenedor});
                                                    callbackAsync(null, result);
                                                } else {
                                                    this.model.findOne({_id: lde.ID})
                                                        .exec((err, lde) => {
                                                            if (err) {
                                                                result = Error.ERROR("MONGO-ERROR").data(err.message);
                                                                callbackAsync(null, result);
                                                            } else {
                                                                var aud_date = new Date();
                                                                var clientFirst = lde.CLIENT[0];
                                                                if (clientFirst.CUIT === user.cuit) {
                                                                    let client = {
                                                                        CUIT: params.cuit,
                                                                        AUD_TIME: aud_date,
                                                                        AUD_USER: params.user.USUARIO
                                                                    };
                                                                    lde.CLIENT.push(client);

                                                                    let return_to = {};

                                                                    /** El forwarder puede cambiar la fecha de devolución solo con una fecha anterior
                                                                     * a la fecha original de devolución del AG Marítimo
                                                                     * */
                                                                    if (params.fecha_dev) {
                                                                        var placeFirst = lde.RETURN_TO[0];
                                                                        var placeLast = lde.RETURN_TO[lde.RETURN_TO.length - 1];
                                                                        if (placeFirst.DATE_TO >= params.fecha_dev) {
                                                                            return_to.DATE_TO = params.fecha_dev;
                                                                            return_to.PLACE = placeLast.PLACE;
                                                                            return_to.AUD_USER = params.user.USUARIO;
                                                                            return_to.AUD_TIME = aud_date;
                                                                            lde.RETURN_TO.push(return_to);
                                                                        } else {
                                                                            result = Error.ERROR("AGP-0007").data({FECHA_DEV: placeFirst.DATE_TO});
                                                                            callbackAsync(null, result);
                                                                        }
                                                                    }

                                                                    lde.save((err, dataSaved) => {
                                                                        if (err) {
                                                                            result = Error.ERROR("MONGO-ERROR").data(err.message);
                                                                            callbackAsync(null, result);
                                                                        } else {
                                                                            let cuit = dataSaved.CLIENT[dataSaved.CLIENT.length - 1].CUIT;
                                                                            let returnTo = dataSaved.RETURN_TO[dataSaved.RETURN_TO.length - 1];
                                                                            let fecha_dev = returnTo.DATE_TO;
                                                                            let lugar_dev = returnTo.PLACE;
                                                                            result = {
                                                                                status: "OK",
                                                                                message: `El Libre Deuda ha sido Habilitado para el CUIT ${cuit}`,
                                                                                data: {
                                                                                    ID: dataSaved._id,
                                                                                    CUIT: cuit,
                                                                                    FECHA_DEV: fecha_dev,
                                                                                    LUGAR_DEV: lugar_dev
                                                                                }
                                                                            };
                                                                            callbackAsync(null, result);
                                                                        }
                                                                    });
                                                                } else {
                                                                    result = Error.ERROR("AGP-0014").data({
                                                                        email: user.email,
                                                                        cuit: user.cuit
                                                                    });
                                                                    callbackAsync(null, result);
                                                                }
                                                            }
                                                        });
                                                }
                                            }
                                        })
                                        .catch(err => {
                                            callbackAsync(null, err);
                                        });

                                };
                                tasks.push(task);
                            });

                            async.parallel(tasks, (err, data) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    let response;
                                    if (data.length === 1) {
                                        response = data[0];
                                    } else {
                                        response = {
                                            status: "OK",
                                            data: data
                                        };
                                    }
                                    resolve(response);
                                }
                            });
                        }
                    })
                    .catch(err => {
                        reject(err);
                    });
            }
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
            var mongoose = require('mongoose');

            match = {
                CONTENEDOR: contenedor
            };
            if (params.id_cliente !== undefined) {
                match.ID_CLIENT = params.id_cliente;
            }
            if (params.id !== undefined) {
                match._id = mongoose.Types.ObjectId(params.id);
            }

            param = [
                {$project: {
                    ID: '$_id',
                    TERMINAL: true,
                    BUQUE: '$SHIP',
                    VIAJE: '$TRIP',
                    BL: true,
                    VENCE: '$EXPIRATION',
                    CONTENEDOR: '$CONTAINER',
                    ID_CLIENT: true,
                    CLIENT: true,
                    STATUS: {$arrayElemAt: ['$STATUS', -1]},
                    RETURN_TO: {$arrayElemAt: ['$RETURN_TO', -1]}
                }},
                {$match: match}
            ];
            this.model.aggregate(param)
                .exec((err, data) => {
                    if (err) {
                        result = Error.ERROR("MONGO-ERROR").data(err.message);
                        reject(result);
                    } else {
                        result = {
                            status: "OK",
                            data: data
                        };
                        resolve(result);
                    }
                });
        });
    }

    getLdes (params, options) {
        return new Promise((resolve, reject) => {
            var result;
            var param,
                match = {},
                sort = {'_id': -1};

            var user = params.user.data;

            if (options.sort) {
                sort = options.sort;
            }

            if (user.group === 'AGE') {
                match = {
                    $or: [ {'STATUS': 0}, {'STATUS': 9}],
                    'USER': params.user.USUARIO
                };
            } if (user.group === 'ADM') {
                match = {
                    $or: [ {'STATUS': 0}, {'STATUS': 9}]
                };
            } else if (user.group === 'TER') {
                match = {
                    $or: [ {'STATUS': 0}, {'STATUS': 3}],
                    TERMINAL: user.terminal
                };
            } else if (user.group === 'FOR') {
                match = {
                    'STATUS': 0,
                    'CUIT_FIRST': user.cuit
                };
                if (params.bl !== undefined) {
                    match.BL = params.bl;
                }
                if (params.contenedor !== undefined) {
                    match.CONTENEDOR = params.contenedor;
                }
            }

            param = [
                {$project: {
                    TERMINAL: true,
                    SHIP: true,
                    TRIP: true,
                    BL: true,
                    EXPIRATION: true,
                    CONTAINER: true,
                    ID_CLIENT: true,
                    CLIENT_FIRST: {$arrayElemAt: ['$CLIENT', 0]},
                    CLIENT_LAST: {$arrayElemAt: ['$CLIENT', -1]},
                    STATUS_FIRST: {$arrayElemAt: ['$STATUS', 0]},
                    STATUS_LAST: {$arrayElemAt: ['$STATUS', -1]},
                    RETURN_TO: {$arrayElemAt: ['$RETURN_TO', -1]}
                }},
                {$project: {
                    TERMINAL: true,
                    BUQUE: '$SHIP',
                    VIAJE: '$TRIP',
                    CONTENEDOR: '$CONTAINER',
                    BL: true,
                    ID_CLIENT: true,
                    VENCE: '$EXPIRATION',
                    CUIT_FIRST: '$CLIENT_FIRST.CUIT',
                    CUIT: '$CLIENT_LAST.CUIT',
                    LUGAR_DEV: '$RETURN_TO.PLACE',
                    FECHA_DEV: '$RETURN_TO.DATE_TO',
                    STATUS: '$STATUS_LAST.STATUS',
                    USER: '$STATUS_FIRST.AUD_USER'
                }},
                {$match: match},
                {$sort: sort},
                {$skip: parseInt(options.skip)},
                {$limit: parseInt(options.limit)}
            ];
            this.model.aggregate(param)
                .then(data => {
                    param = [
                        {$project: {
                            TERMINAL: true,
                            SHIP: true,
                            TRIP: true,
                            BL: true,
                            EXPIRATION: true,
                            CONTAINER: true,
                            ID_CLIENT: true,
                            CLIENT_FIRST: {$arrayElemAt: ['$CLIENT', 0]},
                            CLIENT_LAST: {$arrayElemAt: ['$CLIENT', -1]},
                            STATUS_FIRST: {$arrayElemAt: ['$STATUS', 0]},
                            STATUS_LAST: {$arrayElemAt: ['$STATUS', -1]},
                            RETURN_TO: {$arrayElemAt: ['$RETURN_TO', -1]}
                        }},
                        {$project: {
                            TERMINAL: true,
                            BUQUE: '$SHIP',
                            VIAJE: '$TRIP',
                            CONTENEDOR: '$CONTAINER',
                            BL: true,
                            ID_CLIENT: true,
                            VENCE: '$EXPIRATION',
                            CUIT_FIRST: '$CLIENT_FIRST.CUIT',
                            CUIT: '$CLIENT_LAST.CUIT',
                            LUGAR_DEV: '$RETURN_TO.PLACE',
                            FECHA_DEV: '$RETURN_TO.DATE_TO',
                            STATUS: '$STATUS_LAST.STATUS',
                            USER: '$STATUS_FIRST.AUD_USER'
                        }},
                        {$match: match},
                        {$group: {_id: '$id._id', totalCount: {$sum: 1}}
                        }
                    ];
                    this.model.aggregate(param)
                    .then(dataTotalCount => {
                            let totalCount = 0;
                            totalCount = (dataTotalCount.length > 0) ? dataTotalCount[0].totalCount : 0;
                            result = {
                                status: "OK",
                                totalCount: totalCount,
                                data: data
                            };
                            resolve(result);
                        })
                        .catch(err => {
                            result = Error.ERROR("MONGO-ERROR").data(err.message);
                            reject(result);
                        });
                })
                .catch(err => {
                    result = Error.ERROR("MONGO-ERROR").data(err.message);
                    reject(result);
                });

        });
    }

    changePlace (params) {
        return new Promise((resolve, reject) => {
            var result;
            var user = params.user.data;

            var param = {
                CONTAINER: params.contenedor,
                ID_CLIENTE: params.id_cliente,
                _id: params.id,
                LUGAR_DEV: params.lugar_dev,
                FECHA_DEV: params.fecha_dev
            };

            this.getLde(params)
            .then(data => {
                    /** Libre deuda inexistente para este contenedor. */
                    if (data.data.length === 0) {
                        result = Error.ERROR("AGP-0001").data({
                            CONTENEDOR: params.contenedor,
                            ID_CLIENT: params.ID_CLIENTE
                        });
                        reject(result);
                    } else {
                        data = data.data.filter(item => (item.STATUS.STATUS === 3 || item.STATUS.STATUS === 0));
                        let lde = data[0];
                        this.model.find({_id: lde.ID}, (err, data) => {
                            if (err) {
                                console.error(err);
                                result = Error.ERROR("MONGO-ERROR").data(err.message);
                                reject(result);
                            } else {
                                let lde = data[0];
                                /** Si no recibe lugar o fecha de devolucion se utiliza la ultima que tenia*/
                                let lastReturn = lde.RETURN_TO[lde.RETURN_TO.length-1];
                                if (user.group === 'FOR' && user.cuit === lde.CUIT) {
                                    /**La fecha de devolucion no puede ser menor a la fecha original*/
                                    if (lastReturn.DATE_TO < params.fecha_dev) {
                                        result = Error.ERROR("AGP-0007");
                                        reject(result);
                                    } else {
                                        let newReturn_To = {
                                            PLACE: lastReturn.PLACE,
                                            DATE_TO: (params.fecha_dev !== undefined) ? params.fecha_dev : lastReturn.DATE_TO,
                                            AUD_TIME: new Date(),
                                            AUD_USER: params.user.USUARIO
                                        };
                                        lde.RETURN_TO.push(newReturn_To);
                                        lde.save((err, data) => {
                                            if (err) {
                                                console.error(err);
                                                result = Error.ERROR("MONGO-ERROR").data(err.message);
                                                reject(result);
                                            } else {
                                                resolve({
                                                    status: "OK",
                                                    data: data
                                                });
                                            }
                                        });
                                    }
                                } else {
                                    if (user.group === 'AGE') {
                                        let newReturn_To = {
                                            PLACE: (params.lugar_dev) ? params.lugar_dev : lastReturn.PLACE,
                                            DATE_TO: (params.fecha_dev !== undefined) ? params.fecha_dev : lastReturn.DATE_TO,
                                            AUD_TIME: new Date(),
                                            AUD_USER: params.user.USUARIO
                                        };
                                        lde.RETURN_TO.push(newReturn_To);
                                        lde.save((err, data) => {
                                            if (err) {
                                                console.error(err);
                                                result = Error.ERROR("MONGO-ERROR").data(err.message);
                                                reject(result);
                                            } else {
                                                resolve({
                                                    status: "OK",
                                                    data: data
                                                });
                                            }
                                        });
                                    }
                                }

                            }
                        });
                    }
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

    getLdes (params, options) {
        return this.clase.getLdes(params, options);
    }

    /**
     * Obtiene un JSON del Libre Deuda Electrónico verificando que éste se encuentre activo.
     *
     * @param {Object} params - Objeto Filtro.
     * @param {String} params.contenedor - Contenedor a verificar
     * @param {String} params.id - Id del sistema AGP - Optional
     * @param {String} params.id_cliente - Id del sistema del cliente - Optional
     * @param {String} params.user - Usuario que realiza la consulta
     * @api public
     */
    checkLde (params) {
        return this.clase.checkLde(params);
    }
    returnToLde (params) {
        return this.clase.returnToLde(params);
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