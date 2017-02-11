
module.exports = function(sequelize, DataTypes) {
    var reward = sequelize.define('reward', {
        reward_idx : { type : DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true}
        , user_idx : { type : DataTypes.INTEGER.UNSIGNED}
        , challenge_idx : { type : DataTypes.INTEGER.UNSIGNED}
        , fish_idx : { type : DataTypes.INTEGER.UNSIGNED}
        , reward_count : { type : DataTypes.INTEGER.UNSIGNED}
    }, {
        // created time, update time 자동 추가 여부
        timestamps: true,
        tableName: 'reward'
    });
    return reward;
};