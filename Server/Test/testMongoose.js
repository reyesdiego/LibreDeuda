/**
 * Created by diego on 25/09/17.
 */
"use strict";
var mongoose = require('local-mongoose')("mongodb://10.1.0.65:27017/free", {useMongoClient: true});

var place = require('../models/place.js');

place.find().then(data => {
    console.log(data);
});




