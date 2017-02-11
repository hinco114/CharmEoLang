var express = require('express');
var router = express.Router();
var async = require('async');
var models = require('../models');
var passport = require('passport');
var auth = require('./auth');


// 랭킹 조회
router.get('/ranks', ranksList);

function ranksList(req,res) {
    
    var user_id = req.params.user_id;
    var result = {
        status : null,
        reason : null,
        data[] : null
    }   
    models.rank.findAll(idx).then(function(ret){
        console.log(ret);
        result.status = 'S';
        data = ret;
		res.json(result);		
	}, function(err) {
			console.log(err);
			res.status(400);
			result.status = 'F';
			result.reason = err.message;
			res.json(result);
		})
}
    
    
}







module.exports = router;