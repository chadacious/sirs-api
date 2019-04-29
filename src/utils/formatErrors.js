import pick from 'lodash/pick';

export default (e, models) => {
    if (models != null && e instanceof models.sequelize.ValidationError) {
        // _.pick({a: 1, b: 2}) => {a: 1}
        return e.errors.map(x => pick(x, ['path', 'message']));
    }
    return [{ path: 'unknown', message: e.message }];
};
