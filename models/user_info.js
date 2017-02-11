
module.exports = function(sequelize, DataTypes) {
    var user_info = sequelize.define('user_info', {
        user_idx : { type : DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true}
        , user_nickname : { type : DataTypes.STRING(45), unique : ture}
        , user_playtime : { type : DataTypes.TIME}
        , user_type : { type : DataTypes.VARCHAR(5)}
        , usertype_idx : { type : DataTypes.INTEGER.UNSIGNED}
    }, {
        // created time, update time 자동 추가 여부
        timestamps: true,
        tableName: 'user_info'
    });
    return user_info;
};