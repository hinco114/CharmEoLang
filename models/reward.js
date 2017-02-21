'use strict';

module.exports = function(sequelize, DataTypes) {
    var reward = sequelize.define('reward', {
        reward_idx : { type : DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true}
        , user_idx : { type : DataTypes.INTEGER.UNSIGNED}
        , challenge_idx : { type : DataTypes.INTEGER.UNSIGNED}
        , fish_idx : { type : DataTypes.INTEGER.UNSIGNED}
        , createdAt : { type : DataTypes.DATE}
        , updatedAt : { type : DataTypes.DATE}
    }, {
        classMethods : {}
        , instanceMethods : {}
        // created time, update time 자동 추가 여부
        , timestamps: true
        , tableName: 'reward'
        , collate: 'utf8_unicode_ci'
    });
    return reward;
};