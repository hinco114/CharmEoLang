'use strict';

var express = require('express');
var router = express.Router();
var async = require('async');
var models = require('../models');
var passport = require('passport');
// var auth = require('./auth');


//특정 유저의 리워드 조회
router.get('/rewards/:userIdx', rewardList);

function rewardList(req,res) {
    
    var user_id = req.params.user_id;
    var result = {
        status : null,
        reason : null,
        data : null
    }   
    models.reward.findAll(idx).then(function(ret){
		if(ret == null) {
			res.status(400);
			result.status = 'F';
			result.reason = 'not find reward';
			res.json(result);
		} else {
			console.log(ret);
			result.status = 'S';
            result.data = ret;
			res.json(result);
		}
	}, function(err) {
			console.log(err);
			res.status(400);
			result.status = 'F';
			result.reason = err.message;
			res.json(result);
		})
}






module.exports = router;