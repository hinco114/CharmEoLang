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


function endChall(req, res) {
    if (req.body.challenge_playchecker == 1) {
        async.waterfall([
                async.constant(req)
                , auth.isAuth
                , successChall
                , creReward
                , updatePlaytime
            ]
            , function (err, result) {
                resultFunc(err, result, res);
            })
    } else if (req.body.challenge_playchecker == -1) {
        async.waterfall([
                async.constant(req)
                , auth.isAuth
                , failedChall
            ]
            , function (err, result) {
                resultFunc(err, result, res);
            })
    }
}

function challList(req, res) {
    async.waterfall([
            async.constant(req)
            , auth.isAuth
            , getChall
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
        models.challenge.create(chall_info).then(function (ret) {
            var data = {challenge_idx: ret.challenge_idx};
            callback(null, data);
        }, function (err) {
            callback(err.message);
        })
    }
}

function failedChall(req, callback) {
    var chall_info = {challenge_playchecker: req.body.challenge_playchecker};
    var cond = {where: {challenge_idx: req.params.challenge_idx}};
    models.challenge.update(chall_info, cond).then(function () {
        callback(null, null);
    }), function (err) {
        callback(err);
    }
}


function successChall(req, callback) {
    var chall_info = {challenge_playchecker: req.body.challenge_playchecker};
    var cond = {where: {challenge_idx: req.params.challenge_idx}};
    models.challenge.update(chall_info, cond).then(function () {
        callback(null, req);
    }), function (err) {
        callback(err);
    }
}

function creReward(req, callback) {
    models.challenge.findById(req.params.challenge_idx).then(function (ret) {
        var pTime = ret.challenge_playtime;
        var reward = {
            user_idx: req.headers.user_idx
            , challenge_idx: req.params.challenge_idx
            , fish_idx: ''
        };
        if (pTime < 10) {
            reward.fish_idx = 1;
        }
        else if (pTime < 30) {
            reward.fish_idx = 2;
        }
        else if (pTime < 60) {
            reward.fish_idx = 3;
        }
        else {
            reward.fish_idx = 4;
        }
        models.reward.create(reward).then(function (ret2) {
            var data = {
                challenge_playtime: pTime
                , reward_idx: ret2.reward_idx
                , fish_idx: ret2.fish_idx
            }
            callback(null, req, data);
        }), function (err) {
            callback(err);
        };
    }), function (err) {
        callback(err);
    }
}


// 이것 말고 아래의 방법을 씀
/*
 function getChall(req, callback) {
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
 */

function getChall(req, callback) {
    var offset = req.query.offset;
    var gt = new Date();

    // 오늘의 요일값을 빼서 일요일을 기준으로 시작함 (offset 있으면 더 이전으로)
    gt.setDate(gt.getDate() - gt.getDay() - (7 * offset));

    // gt 날짜 + 7일 (아래 주석처리된부분도 같다
    var lt = new Date(Date.parse(gt.toISOString()) + 7 * 24 * 60 * 60 * 1000);
    // var lt = new Date(gt);
    // lt.setDate(gt.getMonth() + (gt.getDate() + 6));

    var cond = {
        where: {
            user_idx: req.params.user_idx
            , challenge_playchecker: 1
            , challenge_stime: {
                $lt: lt.toJSON().substring(0, 10)
                , $gte: gt.toJSON().substring(0, 10)
            }
        }
        , attributes: ['challenge_idx', 'challenge_stime', 'challenge_playtime']
        , order: ['challenge_stime']
    };
    models.challenge.findAll(cond).then(function (ret) {
        for (var i in ret) {
            var time = new Date(ret[i].challenge_stime);
            time.setHours(time.getHours() + 9);
            ret[i].challenge_stime = time.toISOString();
        }
        callback(null, ret);
    }), function (err) {
        callback(err)
    }
}

function updatePlaytime(req, data, callback) {
    models.user_info.findById(req.headers.user_idx).then(function (ret) {
        var time = ret.user_playtime;
        time += data.challenge_playtime;
        ret.user_playtime = time;
        ret.save().then(function (ret) {
            delete data.challenge_playtime;
            data.user_playtime = ret.user_playtime;
            callback(null, data);
        }), function (err) {
            callback(err)
        }
    });
}

module.exports = router;