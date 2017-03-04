'use strict';

module.exports = function(sequelize, DataTypes) {
    var user_info = sequelize.define('user_info', {
        user_idx : { type : DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true}
        , user_nickname : { type : DataTypes.STRING(45), unique : true}
        , user_playtime : { type : DataTypes.INTEGER.UNSIGNED, defaultValue : 0}
        , fish_count : { type : DataTypes.INTEGER.UNSIGNED, defaultValue : 0}
        , user_type : { type : DataTypes.STRING(5)}
        , usertype_idx : { type : DataTypes.INTEGER.UNSIGNED}
        , createdAt : { type : DataTypes.DATE}
        , updatedAt : { type : DataTypes.DATE}
    }, {
        classMethods : {}
        , instanceMethods : {}
        // created time, update time 자동 추가 여부
        , timestamps: true
        , tableName: 'user_info'
        , collate: 'utf8_unicode_ci'
    });
    return user_info;
};