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


//챌린지 종료(실패)
router.put('/challengesFailed', failedChall );

//챌린지 종료(성공)
router.put('/challengesSuccess', successChall);

/*
//챌린지 종료
router.put('/challenges/', completChall);

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
    var data = {fish_idx: {}};
    
    models.challenge.update(chall_info, {where: {challenge_idx : chall_info.challenge_idx}}).then(function(ret1){
        models.challenge.findById(chall_info.challenge_idx).then(function(ret2){
            if(ret2.challenge_playtime.getseconds < 600){
                data.fish_idx = 1;
                callback(null, data);
            }
            else if(ret2.challenge_playtime.getseconds < 1800){
                data.fish_idx = 2;
                callback(null, data);
            }
            else if(ret2.challenge_playtime.getseconds < 3600){
                data.fish_idx = 3;
                callback(null, data);
           }   
            else{
                data.fish_idx = 4;
                callback(null, data);
            }
        }), function(err1){
            callback(err1.message);
        }
    }),function(err2){
        callback(err2.message);
    }
}
// 시간 성공여부 검사를 서버에서 하는 경우
function newcompletChall(req, callback){
    
    var chall_info = req.body;
    var where = {where: ''};
    var data = {fish_idx: {}};
    var chall;
        
    models.challenge.findById(chall_info.challenge_idx).then(function(ret1){
        
        chall = ret1;
        
        //챌린지 성공 여부 검사
        if(chall.challenge_stime.getMilliseconds + chall.challenge_playtime.getMilliseconds < new Date().getMilliseconds){
            chall.challenge_playchecker ++;
            //if 얼마나 참았는지 봄            
            data.fish_idx = 1;
            where.where = {challenge_idx : chall.challenge_idx};
    
            models.challenge.update(chall.dataValues, where).then(function(ret2){
                callback(null, data);
            }), function(err){
                callback(err.message);
            }
        }
        else{
            chall.challenge_playchecker --;
            where.where = {challenge_idx : chall.challenge_idx};
            data.fish_idx = 0;
    
            models.challenge.update(chall.dataValues, where).then(function(ret2){
                callback(null, data);
            }), function(err){
                callback(err.message);
            }   
        }
    }) 
}
                                                
*/
 
//내 사용량 조회
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
function failedChall(req, res){
    async.waterfall([
        async.constant(req)
        , newfailedChall
    ]
    , function (err, result){
        resultFunc(err, result, res);
    })
}

function newfailedChall(req, callback){
    var chall_info = req.body;
    var data = {fish_idx: {}};
    chall_info.challenge_playchecker --;
    
    models.challenge.update(chall_info, {where : {challenge_idx : chall_info.challenge_idx}}).then(function(ret){
        callback(null, data);
    }),function(err){
        callback(err.message);
    }
}

function successChall(req, res){
    async.waterfall([
        async.constant(req)
        , newsuccessChall
    ]
    , function (err, result){
        resultFunc(err, result, res);
    })
}

function newsuccessChall(req, callback){
    var chall_info = req.body;
    var data = {fish_idx: {}};
    chall_info.challenge_playchecker ++;
    
    models.challenge.update(chall_info, {where: {challenge_idx : chall_info.challenge_idx}}).then(function(ret1){
        models.challenge.findById(chall_info.challenge_idx).then(function(ret2){
            if(ret2.challenge_playtime.getseconds < 600){
                data.fish_idx = 1;
                callback(null, data);
            }
            else if(ret2.challenge_playtime.getseconds < 1800){
                data.fish_idx = 2;
                callback(null, data);
            }
            else if(ret2.challenge_playtime.getseconds < 3600){
                data.fish_idx = 3;
                callback(null, data);
           }   
            else{
                data.fish_idx = 4;
                callback(null, data);
            }
        }), function(err1){
            callback(err1.message);
        }
    }),function(err2){
        callback(err2.message);
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

/*
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
        callback(err.message);
    })
}
*/
function newchallList(req, callback){
    var user_idx = req.params.useridx;
    var data;
    var stand = new Date();
    stand.setDate(stand.getDate() -7);          

    models.challenge.findAll({where: ["user_idx = ? and " + "challenge_stime < ?", user_idx, stand]}).then(function(ret){
        if(ret.length == 0){
            callback({message : 'There is no challenge'});
        }
        else{
            data = ret;
            callback(null, data);
        }
    }), function(err){
            callback(err.message);
    }
}


module.exports = router;
                                  
      
    
    
    
    
    
                                  
                                  
        
                                 
                                  
                                  

               
    
    
    
    
    
                                  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
