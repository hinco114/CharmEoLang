'use strict';

var express = require('express');
var router = express.Router();
var async = require('async');
var models = require('../models');
var passport = require('passport');
// var auth = require('./auth');

var resultModel = function(status, reason, data) {
    this.status = status;
    this.reason = reason;
    this.data = data;
}

function resultFunc(err, result, res) {
    if (err) {
        res.status(400).json(new resultModel('Fail', err.message, null));
    } else {
        res.status(200).json(new resultModel('Success', null, result));
    }
}


// playtime으로 sort하는 과정 필요!
// 랭킹 조회
router.get('/ranks', ranksList);

// 내 랭킹 조회
router.get('/myranks/:user_idx', myRank);

function myRank(req, res){
    async.waterfall([
        async.constant(req)
        , newmyRank
    ]
    , function(err, result){
        resultFunc(err, result, res);
    })
}

function newmyRank(req, callback){
    var user_idx = req.params.user_idx;
    var data;
    models.user_info.findById(user_idx).then(function(ret){
        data = ret;
        callback(null, data);
    }, function(err){
        callback(err);
    })
    
}

function ranksList(req, res){
    async.waterfall([
        async.constant(req)
        ,newranksList
    ]
    , function(err, result){
        resultFunc(err, result, res);
    })
}

function newranksList(req, callback){
    var data;
    models.user_info.findAll().then(function(ret){
        data = ret;
        callback(null, data);
    }, function(err){
        callback(err);
    })
}


module.exports = router;