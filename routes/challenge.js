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

//챌린지 생성
router.post('/challenges/', regisChall);

//챌린지 종료
router.put('/challenges/:challenge_idx', endChall);

//내 사용량 조회
router.get('/challenges/:user_idx', challList);


function regisChall(req, res) {
    async.waterfall([
            async.constant(req)
            , auth.isAuth
            , newregisChall
        ]
        , function (err, result) {
            resultFunc(err, result, res);
        })
}

function newregisChall(req, callback) {
    if (!req.body.challenge_playtime) {
        callback({message: 'No challenge time'})
    } else {
        var chall_info = req.body;
        chall_info.user_idx = req.headers.user_idx;
        var data;
        models.challenge.create(chall_info).then(function (ret) {
            data = ret;
            callback(null, data);
        }, function (err) {
            callback(err.message);
        })
    }
}
function endChall(req, res) {
    async.waterfall([
            async.constant(req)
            , auth.isAuth
            , failedChall
            , successChall
            , creReward
        ]
        , function (err, result) {
            resultFunc(err, result, res);
        })
}

function failedChall(req, callback) {
    // 성공한 경우에는 이 단계 생략
    if (req.body.challenge_playchecker == 1) {
        callback(null, req, null)
    } else {
        var chall_info = {challenge_playchecker: req.body.challenge_playchecker};
        var cond = {where: {challenge_idx: req.params.challenge_idx}};
        models.challenge.update(chall_info, cond).then(function () {
            var data = {fish_idx: ''};
            callback(null, req, data);
        }), function (err) {
            callback(err);
        }
    }
}

function successChall(req, data, callback) {
    // 실패한 경우에는 이 단계 생략
    if (req.body.challenge_playchecker == -1) {
        callback(null, req, data)
    } else {
        var chall_info = {challenge_playchecker: req.body.challenge_playchecker};
        var cond = {where: {challenge_idx: req.params.challenge_idx}};
        models.challenge.update(chall_info, cond).then(function () {
            callback(null, req, null);
        }), function (err) {
            callback(err);
        }
    }
}

function creReward(req, data, callback) {
    // 실패한 경우에는 이 단계 생략
    if (data) {
        callback(null, data)
    } else {
        models.challenge.findById(req.params.challenge_idx).then(function (ret) {
            var pTime = ret.challenge_playtime;
            var reward = {
                user_idx: req.headers.user_idx
                , challenge_idx: req.params.challenge_idx
                , fish_idx: ''
            };
            if (pTime < '00:10:00') {
                reward.fish_idx = 1;
            }
            else if (pTime < '00:30:00') {
                reward.fish_idx = 2;
            }
            else if (pTime < '01:00:00') {
                reward.fish_idx = 3;
            }
            else {
                reward.fish_idx = 4;
            }
            models.reward.create(reward).then(function (ret) {
                callback(null, ret);
            }), function (err) {
                callback(err);
            };
        }), function (err) {
            callback(err);
        }
    }
}

function challList(req, res) {
    async.waterfall([
            async.constant(req)
            , auth.isAuth
            , newchallList
        ]
        , function (err, result) {
            resultFunc(err, result, res);
        })
}

function newchallList(req, callback) {
    var user_idx = req.params.user_idx;
    var offset = req.query.offset;
    if (offset == null || offset == 0) {
        offset = 1;
    }
    var before = new Date();
    var after = new Date();
    before.setDate(before.getDate() - (7 * (offset - 1)));
    after.setDate(after.getDate() - (7 * offset));
    models.challenge.findAll({where: ["user_idx = ? and " + "challenge_stime > ? and " + "challenge_stime < ?", user_idx, after, before]}).then(function (ret) {
        if (ret.length == 0) {
            callback({message: 'There is no challenge'});
        }
        else {
            callback(null, ret);
        }
    }), function (err) {
        callback(err.message);
    }
}


module.exports = router;