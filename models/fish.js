'use strict';

module.exports = function(sequelize, DataTypes) {
    var fish = sequelize.define('fish', {
        fish_idx : { type : DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true}
        , fish_size : { type : DataTypes.INTEGER.UNSIGNED}
        , fish_type : { type : DataTypes.STRING(45)}
    }, {
        classMethods : {}
        , instanceMethods : {}
        // created time, update time 자동 추가 여부
        , timestamps: false
        , tableName: 'fish'
        , collate: 'utf8_unicode_ci'
    });
    return fish;
};