'use strict';

module.exports = function(sequelize, DataTypes) {
    var fish = sequelize.define('fish', {
        fish_idx : { type : DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true}
        , user_nickname : { type : DataTypes.STRING(45), unique : true}
        , fish_size : { type : DataTypes.INTEGER.UNSIGNED}
        , fish_type : { type : DataTypes.STRING(45)}
    }, {
        // created time, update time 자동 추가 여부
        timestamps: false,
        tableName: 'fish'
    });
    return fish;
};