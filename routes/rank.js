'use strict';

var express = require('express');
var router = express.Router();
var async = require('async');
var models = require('../models');
var auth = require('./auth');

var resultModel = function (status, reason, data) {
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

router.get('/ranks', getRank);
router.get('/ranks/:user_idx', getMyRank);

function getRank(req, res) {
    async.waterfall([
            async.constant(req)
            , auth.isAuth
            , rankList
        ]
        , function (err, result) {
            resultFunc(err, result, res);
        })
}

function getMyRank(req, res) {
    async.waterfall([
            async.constant(req)
            , auth.isAuth
            , myRank
        ]
        , function (err, result) {
            resultFunc(err, result, res);
        })
}

function rankList(req, callback) {
    // 오프셋이 1 이면 랭크가 1부터 검색이 되어야함. 따라서 -1 을 해줌 (offset은 0 부터 시작이므로)
    if (req.query.offset == null || req.query.offset == 0) {
        req.query.offset = 0;
    } else {
        req.query.offset--;
    }
    var cond = {
        order: [['user_playtime', 'DESC']]
        , attributes: ['user_idx', 'user_playtime']
        , offset: parseInt(req.query.offset)
        , limit: 10
    };
    models.user_info.findAll(cond).then(function (ret) {
        for (var i in ret) {
            ret[i].dataValues.rank = cond.offset + ++i;
        }
        callback(null, ret);
    }, function (err) {
        callback(err);
    })
}

function myRank(req, callback) {
    var cond = {
        order: [['user_playtime', 'DESC']]
        , attributes: ['user_idx', 'user_playtime']
        , limit: 10
    };
    var data = {user_idx: req.params.user_idx, rank: ''};
    for (var i = 0; true; i++) {
        console.log('is loop?');
        cond.offset = i * 10;
        models.user_info.findAll(cond).then(function (ret) {
            for (var k in ret) {
                console.log(i*10 +k);
                if (ret[k].user_idx == req.params.user_idx) {
                    data.rank = i * 10 + k + 1;
                    console.log('!!!!!');
                    console.log(data);
                    break;
                }
            }
        }), function (err) {
            callback(err);
        };
        if(data.rank != ''){
            console.log('ㅇㅇㅇㅇㅇ');
            break;
        }
    }
    console.log(data);
    callback(null, data);
}

module.exports = router;