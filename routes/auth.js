'use strict';

var jwt = require('jsonwebtoken');
var models = require('../models');
var SECRET = 'charm_token';
var EXPIRES = '1d';

// JWT 토큰 생성 함수
function signToken(idx) {
    return jwt.sign({user_idx: idx}, SECRET, {expiresIn: EXPIRES});
}

function isAuth(req, callback) {
    if (req.headers.authorization == null) {
        callback({message: 'Need Auth Token'})
    }
    else {
        jwt.verify(req.headers.authorization, SECRET, function (err, decoded) {
            if (err) {
                callback(err);
            } else if (decoded == null) {
                callback({message: 'Token not valid'})
            } else {
                req.headers.user_idx = decoded.user_idx;
                models.user_info.findById(decoded.user_idx).then(function () {
                    callback(null, req)
                }), function (err) {
                    callback(err);
                }
            }
        });
    }
}


exports.signToken = signToken;
exports.isAuth = isAuth;