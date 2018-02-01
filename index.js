/**
 * Created by diego on 4/15/16.
 */
"use strict";

var config = require("./config/config.js");
var log4n = require('./include/log4node.js'),
    log = new log4n.log(config.log);

//var http = require("https");
var http = require("http");
var fs = require("fs");
var path = require("path");
var express = require("express");
var expressValidator = require("express-validator");
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
app.use(expressValidator({
    customValidators: {
        isArray: function(value) {
            return Array.isArray(value);
        },
        gte: function(param, num) {
            return param >= num;
        }
    }
}));

app.set('views', path.join(__dirname, '.', '/public'));
app.set('view engine', 'pug');
/** For Pug Views*/
app.locals.moment = require('moment');

app.all('/*', (req, res, next) => {
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

//var options = {
//    key: fs.readFileSync(path.join(__dirname, '', "/key.pem")),
//    cert: fs.readFileSync(path.join(__dirname, '', "/cert.pem"))
//};
//server = http.createServer(options, app);

server = http.createServer(app);

app.disable('x-powered-by');

socket = socket(server, {
    transports: [
        'websocket',
        'xhr-polling',
        'polling'
    ]
});


server.listen(port, () => {
    log.logger.info("#%s Nodejs %s Running on %s://localhost:%s", process.pid, process.version, 'http', port);
    /** Conecta a la base de datos MongoDb */
    require('local-mongoose')(config.mongo.url, config.mongo.options);
});
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        log.logger.error('El puerto %s está siendo utilizado por otro proceso. El proceso que intenta iniciar se abortará', port);
        process.exit();
    }
});

app.get('/killme', (req, res) => {
    server.close();
});

require("./routes/router.js")(app, socket, log);

process.on('exit', () => {
    log.logger.error('exiting');
});

process.on('uncaughtException', (err) => {
    log.logger.info("Caught exception: " + err);
});