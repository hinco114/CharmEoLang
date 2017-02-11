
module.exports = function(sequelize, DataTypes) {
    var kakao_user = sequelize.define('kakao_user', {
        kakao_idx : { type : DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true}
        , user_idx : { type : DataTypes.INTEGER.UNSIGNED}
        , kakao_token : { type : DataTypes.STRING(64), unique : ture}
    }, {
        // created time, update time 자동 추가 여부
        timestamps: false,
        tableName: 'kakao_user'
    });
    return kakao_user;
};