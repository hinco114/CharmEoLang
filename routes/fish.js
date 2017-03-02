'use strict';


var express = require('express');
var router = express.Router();
var models = require('../models');
var async = require('async');
var auth = require('./auth');

var resultModel = function (status, reason, data) {
    this.status = status;
    this.reason = reason;
    this.data = data;
};

function resultFunc(err, result, res) {
    if (err) {
        res.status(400).json(new resultModel('Fail', err.message, null));
    } else {
        res.status(200).json(new resultModel('Success', null, result));
    }
}

///////////////////////////////////////////////////////////

router.post('/fishes/', creFish);
router.get('/fishes/', getAllFish);


// fish 생성 waterfall
function creFish(req, res) {
    async.waterfall([
            async.constant(req)     // req를 첫번째 단계로 넘김
            , newFish
        ]
        , function (err, result) {
            resultFunc(err, result, res)
        })
}

// fish 전체 조회 waterfall
function getAllFish(req, res) {
    async.waterfall([
            async.constant(req)     // req를 첫번째 단계로 넘김
            , auth.isAuth
            , findAllFish
        ]
        , function (err, result) {
            resultFunc(err, result, res)
        })
}

// 해당 물고기 생성
function newFish(req, callback) {
    var context = req.body;
    models.fish.create(context).then(function (ret) {
        var data = {
            fish_idx: ret.fish_idx
        };
        callback(null, data);
    }, function (err) {
        callback(err);
    })
}

// fish 찾기
function findAllFish(req, callback) {
    models.fish.findAll().then(function (ret) {
        if (ret == null) {
            callback({message: 'Fish not found'});
        }
        else {
            callback(null, ret);
        }
    }, function (err) {
        callback(err);
    })
}

module.exports = router;