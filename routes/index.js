'use strict';

var express = require('express');
var router = express.Router();
var models = require('../models');


var ResultModel = function(status, reason, data) {
    this.status = status;
    this.reason = reason;
    this.resultData = data;
};

/* GET home page. */
router.get('/', function(req, res) {
    models.sequelize
        .authenticate()
        .then(function(err) {
            console.log('Connection has been established successfully.');
            res.status(200).json(new ResultModel('S', 'Seccessfully Connected!'));
        })
        .catch(function (err) {
            console.log('Unable to connect to the database:', err);
        });
});

module.exports = router;
