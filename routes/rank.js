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

router.get('/ranks', rank);

function rank(req, res) {
    async.waterfall([
            async.constant(req)
            , auth.isAuth
            , rankList
        ]
        , function (err, result) {
            resultFunc(err, result, res);
        })
}

function rankList(req, callback) {
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
    }
    models.user_info.findAll(cond).then(function (ret) {
        for (var i in ret) {
            ret[i].dataValues.rank = cond.offset + ++i;
        }
        callback(null, ret);
    }, function (err) {
        callback(err);
    })
}


module.exports = router;