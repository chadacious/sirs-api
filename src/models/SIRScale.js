import constants from './constants';

export default (sequelize, DataTypes) => {
    const SIRScale = sequelize.define('SIRScale', {
        filterTypeId: DataTypes.INTEGER,
        version: DataTypes.STRING,
        description: DataTypes.STRING,
        jsonDefinition: DataTypes.JSON,
        publishedAt: DataTypes.DATE,
        deletedAt: {
            type: DataTypes.DATE,
            defaultValue: constants.MAX_DATE,
        },
    }, {
        indexes: [
            {
                name: 'ix_SIRScale_filterTypeId_version',
                fields: ['filterTypeId', 'version', 'deletedAt'],
                unique: true,
            },
        ],
    });

    SIRScale.associate = (models) => {
        SIRScale.belongsTo(models.FilterType, {
            foreignKey: 'filterTypeId',
        });
    };
    return SIRScale;
};