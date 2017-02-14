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
            res.status(200).json(new ResultModel('S', 'Seccessfully Registered !'));
        })
        .catch(function (err) {
            console.log('Unable to connect to the database:', err);
        });
});

router.post('/test', function(req, res){
  var buser = req.body;
  console.log(buser);
  models.challenge.create(buser).then(function () {
      res.status(200).json(new ResultModel('S', 'Seccessfully Registered !'));
  }, function(err) {
      res.status(400).json(new ResultModel('F', err.message, null));
  })
});

router.get('/test', function (req, res) {
    models.challenge.findAll({where : {user_idx : '3'}}).then(function (ret) {
        res.status(200).json(new ResultModel('S', null, ret));
    }, function(err) {
        res.status(400).json(new ResultModel('F', err.message, null));
    })
})

router.get('/test2/:id', function (req, res) {
    models.challenge.findById(req.params.id).then(function (ret) {
        if(ret == null) { }
        res.status(200).json(new ResultModel('S', null, ret));
    }, function(err) {
        res.status(400).json(new ResultModel('F', err.message, null));
    })
})

module.exports = router;
