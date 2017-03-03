'use strict';


var express = require('express');
var router = express.Router();
var models = require('../models');
var async = require('async');
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

///////////////////////////////////////////////////////////

router.post('/members/basic', creBasic);
router.post('/members/kakao', creKakao);
router.post('/members/login', login);
router.get('/members/:user_idx', getUser);
// router.get('/members', getUser);

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
            , existToken            // kakao_token 중복 검사
            , existNick             // Nickname 중복 검사
            , newKakaoUser          // basic_user 생성
            , newUser               // user_info 생성
            , updateUserTypeIdx     // basic / kakao db에 user_idx 업데이트
        ]
        , function (err, result) {
            resultFunc(err, result, res)
        })
}

function login(req, res) {
    async.waterfall([
            async.constant(req)
            , accPw
            , creToken
        ]
        , function (err, result) {
            resultFunc(err, result, res)
        })
}

// 특정유저 정보 얻기 (시간값이 현재 이상하게 리턴되는 현상)
function getUser(req, res) {
    async.waterfall([
        async.constant(req)
        , auth.isAuth
        , findUser
    ], function (err, data, result) {
        resultFunc(err, result, res)
    })
}

///////////////////////////////////////////////////////////

function findUser(req, callback) {
    var target;
    if (req.params.user_idx == null) {
        target = req.headers.user_idx;
    } else {
        target = req.params.user_idx;
    }
    models.user_info.findById(target).then(function (ret) {
        if (ret == null) {
            callback({message: 'User not found'});
        }
        else {
            var ct = new Date(ret.dataValues.createdAt);
            var ut = new Date(ret.dataValues.updatedAt);
            ct.setHours(ct.getHours() + 9);
            ut.setHours(ut.getHours() + 9);
            ret.dataValues.createdAt = ct;
            ret.dataValues.updatedAt = ut.toISOString();
            callback(null, req, ret);
        }
    }, function (err) {
        callback(err);
    })
}

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
        , basic_password: models.basic_user.makePass(req.body.basic_password)
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
    var context = {user_idx: data.user_idx};
    var where = {where: ''};
    if (data.user_type == 'basic') {
        where.where = {buser_idx: data.usertype_idx};
        models.basic_user.update(context, where).then(function (ret) {
            callback(null, context)
        }), function (err) {
            callback(err.message);
        }
    } else if (data.user_type == 'kakao') {
        where.where = {kakao_idx: data.usertype_idx};
        models.kakao_user.update(context, where).then(function (ret) {
            callback(null, context)
        }), function (err) {
            callback(err.message);
        }
    }
}

// kakao_token 중복여부 검사 (중복이면 callback에 에러 전달
function existToken(req, callback) {
    var where = {
        where: {kakao_token: req.body.kakao_token}
        , attributes: ['kakao_idx']
    };
    models.kakao_user.findOne(where).then(function (ret) {
        if (ret == null) {
            callback(null, req)
        } else {
            callback({message: 'Token Already Exist'})
        }
    })
}

function accPw(req, callback) {
    if (req.body.basic_id != null) {
        var target = {where: {basic_id: req.body.basic_id}};
        models.basic_user.findOne(target).then(function (ret) {
            if (ret.matchPass(req.body.pwval, ret.basic_password)) {
                callback(null, ret);
            } else {
                callback({message: 'Login Fail'});
            }
        }), function (err) {
            callback(err);
        }
    } else if (req.body.kakao_token != null) {
        var target = {where: {kakao_token: req.body.kakao_token}};
        models.kakao_user.findOne(target).then(function (ret) {
            callback(null, ret);
        }), function (err) {
            callback(err);
        }
    } else {
        callback({message: 'Login Fail'});
    }
}

function creToken(data, callback) {
    var decode = auth.signToken(data.user_idx);
    callback(null, {auth_token: decode});
}


///////////////////////////////////////////////////////////

module.exports = router;