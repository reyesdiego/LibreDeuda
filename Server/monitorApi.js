/**
 * Created by diego on 19/05/16.
 */

var http = require("https");
var pm2 = require("pm2");
var fs = require("fs");
var path = require("path");
var interval = 7000;

var optionsget = {
    host: "10.10.0.223", //process.argv[2], // here only the domain name (no http/https !)
    port: 8086,//process.argv[3],
    path: "/",
    method: "GET",
    timeout: 20,
    rejectUnauthorized: false
};

setInterval(function () {
    "use strict";
    var reqGet = http.request(optionsget, function (res) {
        /*
         let mailer,
         to= ["reyesdiego@hotmail.com", "dreyes@puertobuenosaires.gob.ar"];
         if (res.statusCode === 200) {
         mailOptions.status = true;
         if (emailSent === 2) {
         mailer = new mail.mail(mailOptions);
         mailer.send(to, "Servicio AGP Reestablecido", JSON.stringify(optionsget), function (err, message) {
         if (err) {
         console.log("Error enviando email. %j, %s", err, new Date());
         } else {
         console.log('emailSent %s a %s - %s', emailSent, to, new Date());
         }
         });
         }
         emailSent = 0;
         console.log('+');
         } else {
         console.log("Se Cayo: ", res.statusCode);
         }
         var chunk1;
         res.on('data', function (chunk) {
         chunk1 += chunk;
         });
         res.on('end', function () { });
         */
    });

    reqGet.end();

    reqGet.on("error", function (e) {

        pm2.connect(function (err) {
            if (err) {
                console.error(err);
                process.exit(2);
            } else {

                pm2.restart("LibreDeuda", function (err) {
                    pm2.disconnect();
                });
            }
        });

        //var mailer = new mail.mail(mailOptions),
        //    to = ["reyesdiego@hotmail.com", "dreyes@puertobuenosaires.gob.ar"];
        //if (mailOptions.status) {
        //    mailer.send(to, "Servicio AGP detenido", JSON.stringify(optionsget), function (err, message) {
        //        var util     = require('util')
        //
        //        if (err) {
        //            console.log("Error enviando email. %j, %s", err, new Date());
        //        } else {
        //            emailSent++;
        //            console.log('emailSent %s a %s - %s', emailSent, to, new Date());
        //            if (emailSent === 2) {
        //                console.log("\nEnvio de Alertas Finalizado hasta tanto se reinicie el servicio %s\n", new Date());
        //                mailOptions.status = false;
        //
        //            }
        //        }
        //    });
        //}

    });

}, interval);

