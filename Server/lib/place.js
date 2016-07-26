/**
 * Created by diego on 11/07/16.
 */

class PlaceMongoDb {
    constructor (model) {
        this.model = model;
    }

    getPlaces (id) {
        let promise = new Promise((resolve, reject) => {
            let param = {};
            if (id) {
                param._id = id;
            }

            this.model.find(param)
            .lean()
            .exec((err, data) => {
                if (err) {
                    let errReject = {
                        status: 'ERROR',
                        message: err.message,
                        data: err
                    };
                    reject(errReject);
                } else {
                    data.map(item => {
                        return {
                            ID: item._id,
                            NOMBRE: item.NOMBRE
                        };
                    });
                    if (id) {
                        data = (data[0]) ? data[0] : null;
                    }

                    let dataResolve = {
                        status: 'OK',
                        data: data
                    };
                    resolve(dataResolve);
                }
            });
        });
        return promise;
    }

}

class Place {
    constructor (connection) {
        if (connection !== undefined) {
            this.connection = connection;
            //this.clase = new GateOracle(this.connection);
        } else {
            this.connection = require('../models/place.js');
            this.clase = new PlaceMongoDb(this.connection);
        }
    }

    getPlace (id) {
        return this.clase.getPlaces(id);
    }

    getPlaces () {
        return this.clase.getPlaces();
    }

}

module.exports = Place;