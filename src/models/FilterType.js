import constants from './constants';

export default (sequelize, DataTypes) => {
    const FilterType = sequelize.define('FilterType', {
        code: DataTypes.STRING(25),
        name: DataTypes.STRING(25),
        description: DataTypes.STRING,
        deletedAt: {
            type: DataTypes.DATE,
            defaultValue: constants.MAX_DATE,
        },
    }, {
        indexes: [
            {
                name: 'ix_FilterType_code_name',
                fields: ['code', 'name', 'deletedAt'],
                unique: true,
            },
        ],
    });

    FilterType.associate = (models) => {
        FilterType.hasMany(models.SIRScale, {
            foreignKey: 'filterTypeId',
        });
    };
    return FilterType;
};