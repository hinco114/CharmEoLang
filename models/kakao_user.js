'use strict';

module.exports = function(sequelize, DataTypes) {
    var kakao_user = sequelize.define('kakao_user', {
        kakao_idx : { type : DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true}
        , user_idx : { type : DataTypes.INTEGER.UNSIGNED}
        , kakao_token : { type : DataTypes.STRING(64), unique : true}
    }, {
        classMethods : {}
        , instanceMethods : {}
        // created time, update time 자동 추가 여부
        , timestamps: false
        , tableName: 'kakao_user'
        , collate: 'utf8_unicode_ci'
    });
    return kakao_user;
};