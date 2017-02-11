
module.exports = function(sequelize, DataTypes) {
    var challenge = sequelize.define('challenge', {
        challenge_idx : { type : DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true}
        , user_idx : { type : DataTypes.INTEGER.UNSIGNED}
        , challenge_stime : { type : DataTypes.DATETIME}
        , challenge_playtime : { type : DataTypes.TIME}
        , challenge_playchecker : { type : DataTypes.BOOLEAN}
    }, {
        // created time, update time 자동 추가 여부
        timestamps: true,
        tableName: 'challenge'
    });
    return challenge;
};