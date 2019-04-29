import formatErrors from '../../utils/formatErrors';

export const tryGetFilterTypes = async (models) => {
    try {
        const filterTypes = await models.FilterType.findAll();
        return filterTypes;
    } catch (error) {
        return {
            ok: false,
            errors: formatErrors(error, models),
        };
    }
};
