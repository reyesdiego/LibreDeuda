/**
 * Created by diego on 4/15/16.
 */
"use strict";

var config = require("./config/config.js");
var log4n = require('./include/log4node.js'),
    log = new log4n.log(config.log);

var http = require("https");
var fs = require("fs");
var path = require("path");
var express = require("express");
var compress = require('compression');
var methodOverride = require('method-override'),
    bodyParser = require('body-parser');
    //multer = require('multer');
var socket = require("socket.io");

var app = express();
var server;
var port = 8086;

app.use(compress({
    level : 8
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(multer());
app.use(methodOverride());
app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", 'X-Requested-With, Content-Type, token');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Request-Headers', 'Content-Type, token');
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');

    if ('OPTIONS' === req.method) {
        res.status(200).send();
    } else {
        next();
    }
});

var options = {
    key: fs.readFileSync(path.join(__dirname, '', "/key.pem")),
    cert: fs.readFileSync(path.join(__dirname, '', "/cert.pem"))
};
server = http.createServer(options, app);

socket = socket(server, {
    transports: [
        'websocket',
        'xhr-polling',
        'polling'
    ]
});

server.listen(port, function () {
    log.logger.info("#%s Nodejs %s Running on %s://localhost:%s", process.pid, process.version, 'http', port);
    /** Conecta a la base de datos MongoDb */
    require('./include/mongoose.js')(config.mongo.url, config.mongo.options, log);
});
server.on('error', function (err) {
    if (err.code === 'EADDRINUSE') {
        log.logger.error('El puerto %s está siendo utilizado por otro proceso. El proceso que intenta iniciar se abortará', port);
        process.exit();
    }
});

require("./routes/router.js")(app, socket);

process.on('exit', function () {
    log.logger.error('exiting');
});

process.on('uncaughtException', function (err) {
    log.logger.info("Caught exception: " + err);
});