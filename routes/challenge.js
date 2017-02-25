'use strict';

var express = require('express');
var router = express.Router();

var async = require('async');
var models = require('../models');
var passport = require('passport');
var bodyParser = require('body-parser');


//챌린지 생성
router.post('/challenges/', regisChall);

//챌린지 종료
router.put('/challenges/{:Cidx}', completChall );

//특정회원의 특정기간 챌린지 조회
router.get('/challenges/{:useridx}', challList);



function regisChall(req, res) {
    var chall_info = req.body;
    var result = {
        challenge_idx : null,
        status : null,
        reason : null
    }
    
    models.challenge.create(chall_info).then(function(ret) {
        console.log(ret);
        result.challenge_idx = ret.challenge_idx;
        result.status = 'S';
        res.json(result);
    }, function(err) {
        console.log("Register failed");
        result.status = 'F';
        res.json(result);
    })
}

function completChall(req, res){
    var chall_info = req.body;
    var result = {
        fish_idx : null,
        status : null,
        reason : null
    }
    
    models.challenge.update(chall_info).then(function(ret) {
        console.log(ret);
        var now = new Date();
        var stime = new Date(ret.challenge_stime);
        var enduretime = now.getTime() - stime.getTime();
        
        if(enduretime > ret.challenge_goeltime){
            ret.challenge_playchecker = 1;     result.status = 'S';
            res.json(result);
        }
        else{            
            ret.challenge_playchecker = 0;
            result.status = 'F';
            res.json(result);
        }
    },function(err) {
            console.log(err);
            result.status = 'F';
            result.reason = 'Complete failed';
            res.json(result);
    })
}


function challList(req, res) {
    
    var user_idx = req.params.user_idx;
    var start_time = req.params.start_time;
    var end_time =req.params.end_time;
    var result = {
        status : null,
        reason : null,
        data : null
    } 
    
    // 보류요 ..
    models.challenge.findAll({ where :  { id: [user_id] } }).then(function(ret){
		if(ret.length == null) {
			res.status(400);
			result.status = 'F';
			result.reason = 'not find challenge';
			res.json(result);
		}     // 챌린지가 없음
        else {
			console.log(ret);
			result.status = 'S';
			result.report_info = ret;
			res.json(result);
		}     // 조회 성공
	}, function(err) {
			console.log(err);
			res.status(400);
			result.status = 'F';
			result.reason = err.message;
			res.json(result);
		})    // 조회 실패
}
    
    






module.exports = router;
                                  
      
    
    
    
    
    
                                  
                                  
        
                                 
                                  
                                  

               
    
    
    
    
    
                                  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
