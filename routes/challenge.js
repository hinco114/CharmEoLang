'use strict';

var express = require('express');
var router = express.Router();

var async = require('async');
var models = require('../models');
var passport = require('passport');
var bodyParser = require('body-parser');

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

//챌린지 생성
router.post('/challenges/', regisChall);

//시간 비교하는거 확인 필요!
//챌린지 종료
router.put('/challenges/:Cidx', completChall );

//시간이 디비시간이랑 안 맞음!
//특정 기간 입력해야함 
//특정회원의 특정기간 챌린지 조회
router.get('/challenges/:useridx', challList);


function regisChall(req, res){
    async.waterfall([
        async.constant(req)
        , newregisChall
    ]
    , function (err, result){
        resultFunc(err, result, res);
    })
} 

function newregisChall(req, callback) {
    var chall_info = req.body;
    var data;

  models.challenge.create(chall_info).then(function(ret) {
        data = ret;
        console.log(ret);
        callback(null, data);
    }, function(err) {
        callback(err.message);
    })
}

function completChall(req, res){
    async.waterfall([
        async.constant(req)
        , newcompletChall
    ]
    , function (err, result){
        resultFunc(err, result, res);
    })
}

function newcompletChall(req, callback){
    
    var chall_info = req.body;
    var where = {where: ''};
    var data = {fish_idx: {}};
    var date = new Date();
    
    console.log(date);
    
    if(chall_info.challenge_stime + chall_info.challenge_playtime < new Date()){
        
        chall_info.challenge_playchecker ++;
        //if 얼마나 참았는지 봄
        data.fish_idx = 1;
        where.where = {challenge_idx : chall_info.challenge_idx};
    
        models.challenge.update(chall_info, where).then(function(ret){
            callback(null, data);
        }), function(err){
            callback(err.message);
        }
    }
    else{
        chall_info.challenge_playchecker --;
        data.fish_idx = null;
        where.where = {challenge_idx : chall_info.challenge_idx};
                        
        models.challenge.update(chall_info, where).then(function(ret){
            callback(null, data);
        }), function(err){
            callback(err.message);
        }
    }
}

function challList(req, res){
    async.waterfall([
        async.constant(req)
        , newchallList
    ]
    , function (err, result){
        resultFunc(err, result, res);
    })
}

function newchallList(req, callback){
    var user_idx = req.params.useridx;
    var data;
    
    models.challenge.findAll({where : {user_idx: [user_idx]}}).then(function(ret){
        if(ret.length == 0){
            callback({message : 'There is no challenge'} );
        }
        else{
            data = ret;
            callback(null, data);
        }   
    }, function(err){
        callback(err);
    })
}



module.exports = router;
                                  
      
    
    
    
    
    
                                  
                                  
        
                                 
                                  
                                  

               
    
    
    
    
    
                                  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
