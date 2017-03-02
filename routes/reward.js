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
};

function resultFunc(err, result, res) {
    if (err) {
        res.status(400).json(new resultModel('Fail', err.message, null));
    } else {
        res.status(200).json(new resultModel('Success', null, result));
    }
}

// 특정 유저의 리워드 조회
router.get('/rewards/:user_idx', userRewardList);
router.put('/rewards/:reward_idx', modifyMemo);

function userRewardList(req, res) {
    async.waterfall([
            async.constant(req)     // req를 첫번째 단계로 넘김
            , auth.isAuth          // BasicID 중복 검사
            , getUsersAllReward
        ]
        , function (err, result) {
            resultFunc(err, result, res)
        })
}

function modifyMemo(req, res) {
    async.waterfall([
            async.constant(req)     // req를 첫번째 단계로 넘김
            , auth.isAuth          // BasicID 중복 검사
            , updateMemo
        ]
        , function (err, result) {
            resultFunc(err, result, res)
        })
}

function getUsersAllReward(req, callback) {
    var target = {
        where: {
            user_idx: req.params.user_idx
        }
        , attributes: ['reward_idx', 'user_idx', 'challenge_idx', 'fish_idx', 'fish_memo']
    };
    models.reward.findAll(target).then(function (ret) {
        callback(null, ret);
    }), function (err) {
        callback(err);
    }
}

function updateMemo(req, callback) {
    if (req.body.fish_memo == null) {
        callback({message: 'No fish_memo value'});
    } else {
        models.reward.findById(req.params.reward_idx).then(function (ret) {
            ret.dataValues.fish_memo = req.body.fish_memo;
            ret.save().then(function (result) {
                callback(null, result);
            }), function (err) {
                callback(err);
            }
        }), function (err) {
            callback(err);
        }
    }
}

module.exports = router;