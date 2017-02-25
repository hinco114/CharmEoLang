'use strict';


var express = require('express');
var router = express.Router();
var models = require('../models');
var async = require('async');

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

///////////////////////////////////////////////////////////

router.post('/members/basic', creBasic);
router.post('/members/kakao', creKakao);
router.get('/members/', getAllUser);
router.get('/members/{:userIdx}', getUser);

// basic_user 생성 waterfall
function creBasic(req, res) {
    async.waterfall([
            async.constant(req)     // req를 첫번째 단계로 넘김
            , existBasicId          // BasicID 중복 검사
            , existNick             // Nickname 중복 검사
            , newBasicUser          // basic_user 생성
            , newUser               // user_info 생성
            , updateUserTypeIdx     // basic / kakao db에 user_idx 업데이트
        ]
        , function (err, result) {
            resultFunc(err, result, res)
        })
}

// kakao_user 생성 waterfall
function creKakao(req, res) {
    async.waterfall([
            async.constant(req)     // req를 첫번째 단계로 넘김
            , existToken          // kakao_token 중복 검사
            , existNick             // Nickname 중복 검사
            , newKakaoUser          // basic_user 생성
            , newUser               // user_info 생성
            , updateUserTypeIdx     // basic / kakao db에 user_idx 업데이트
        ]
        , function (err, result) {
            resultFunc(err, result, res)
        })
}


function getAllUser(req, res) {
    var data;
    if(req.query.offset != null) {
    }
}


function getUser(req, res) {

}

///////////////////////////////////////////////////////////

// BasicID 중복 검사 (중복이면 callback에 에러 전달)
function existBasicId(req, callback) {
    var where = {
        where: {basic_id: req.body.basic_id}
        , attributes: ['buser_idx']
    };
    models.basic_user.findOne(where).then(function (ret) {
        if (ret == null) {
            callback(null, req);
        } else {
            callback({message: 'ID Alread Exist'})
        }

    }, function (err) {
        callback(err);
    })
}

// Nickname 중복 검사 (중복이면 callback에 에러 전달)
function existNick(req, callback) { //존재하면 에러. (중복검사의 개념)
    var where = {
        where: {user_nickname: req.body.user_nickname}
        , attributes: ['user_idx']
    };
    models.user_info.findOne(where).then(function (ret) {
        if (ret == null) {
            callback(null, req);
        } else {
            callback({message: 'Nickname Alread Exist'})
        }

    }, function (err) {
        callback(err);
    })
}

// basic_user 생성
function newBasicUser(req, callback) {
    var basic = {
        basic_id: req.body.basic_id
        , basic_password: req.body.basic_password
    };
    models.basic_user.create(basic).then(function (ret) {
        var data = {
            usertype_idx: ret.buser_idx
            , user_type: 'basic'
        };
        callback(null, req, data);
    }, function (err) {
        callback(err.message);
    })
}

// kakao_user 생성
function newKakaoUser(req, callback) {
    var kakao = req.body;
    models.kakao_user.create(kakao).then(function (ret) {
        var data = {
            usertype_idx: ret.kakao_idx
            , user_type: 'kakao'
        };
        callback(null, req, data);
    }, function (err) {
        callback(err);
    })
}

// user_info 생성
function newUser(req, data, callback) {
    var member = {
        user_nickname: req.body.user_nickname
        , user_type: data.user_type
        , usertype_idx: data.usertype_idx
    };
    models.user_info.create(member).then(function (data) {
        callback(null, data);
    }, function (err) {
        callback(err.message);
    })
}

// basic / kakao db에 user_idx 업데이트
function updateUserTypeIdx(data, callback) {
    var target = {user_idx: data.user_idx};
    var where = {where: ''};
    if (data.user_type == 'basic') {
        where.where = {buser_idx: data.usertype_idx};
        models.basic_user.update(target, where).then(function (ret) {
            callback(null, target)
        }), function (err) {
            callback(err.message);
        }
    } else if (data.user_type == 'kakao') {
        where.where = {kakao_idx: data.usertype_idx};
        models.kakao_user.update(target, where).then(function (ret) {
            callback(null, target)
        }), function (err) {
            callback(err.message);
        }
    }
}

// toeken 중복여부 검사 (중복이면 callback에 에러 전달
function existToken(req, callback) {
    var where = {
        where: {kakao_token : req.body.kakao_token}
        , attributes : ['kakao_idx']
    };
    models.kakao_user.findOne(where).then(function (ret) {
        if(ret == null){
            callback(null, req)
        } else {
            callback({message:'Token Already Exist'})
        }
    })
}

///////////////////////////////////////////////////////////

module.exports = router;