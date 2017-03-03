'use strict';

var bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = function (sequelize, DataTypes) {
    var basic_user = sequelize.define('basic_user', {
        buser_idx: {type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true}
        , user_idx: {type: DataTypes.INTEGER.UNSIGNED}
        , basic_id: {type: DataTypes.STRING(64), unique: true}
        , basic_password: {type: DataTypes.STRING(64)}
    }, {
        classMethods: {
            makePass: function (pass) {
                return bcrypt.hashSync(pass, saltRounds);
            }
        }
        , instanceMethods: {
            matchPass: function (pass, bp) {
                return bcrypt.compareSync(pass, bp)
            }
        }
        // created time, update time 자동 추가 여부
        , timestamps: false
        , tableName: 'basic_user'
        , collate: 'utf8_unicode_ci'
    });
    return basic_user;
};