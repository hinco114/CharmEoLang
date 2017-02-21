'use strict';

module.exports = function(sequelize, DataTypes) {
    var challenge = sequelize.define('challenge', {
        challenge_idx : { type : DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true}
        , user_idx : { type : DataTypes.INTEGER.UNSIGNED}
        , challenge_stime : { type : DataTypes.DATE}
        , challenge_playtime : { type : DataTypes.TIME}
        , challenge_playchecker : { type : DataTypes.BOOLEAN}
        , createdAt : { type : DataTypes.DATE}
        , updatedAt : { type : DataTypes.DATE}
    }, {
        classMethods : {}
        , instanceMethods : {}
        // created time, update time 자동 추가 여부
        , timestamps: true
        , tableName: 'challenge'
        , collate: 'utf8_unicode_ci'
    });
    return challenge;
};