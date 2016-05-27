/**
 * Created by diego on 7/3/15.
 */
module.exports = (url, options, log) => {
    'use strict';
    var mongoose = require('mongoose');

    if (options) {
        mongoose.connect(url, options);
    } else {
        mongoose.connect(url);
    }

    mongoose.connection.on('connected', () => {
        log.logger.info("Mongoose %s Connected to Database. %s", mongoose.version, url);
        global.mongoose.connected = true;
    });

    mongoose.connection.on('error', (err) => {
        log.logger.error("Database or Mongoose error. %s", err.stack);
    });
    mongoose.connection.on('disconnected', () => {
        log.logger.error("Mongoose default connection disconnected, el proceso %s se abortará", process.pid);
        process.exit();
    });

    global.mongoose = {
        connected: false,
        version: mongoose.version
    };

    process.on('SIGINT', () => {
        mongoose.connection.close(() => {
            log.logger.info("Mongoose default connection disconnected through app termination");
            process.exit();
        });
    });

}

