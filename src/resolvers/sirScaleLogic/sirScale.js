import formatErrors from '../../utils/formatErrors';
import permissions from '../../utils/permissions';

export const tryGetSIRScaleVersions = async (filterTypeId, models, user) => {
    try {
        const sirs = await models.SIRScale.findAll({
            attributes: [
                'id',
                'filterTypeId',
                'version',
                'description',
                'createdAt',
                'updatedAt',
            ],
            where: { filterTypeId },
        });
        return sirs;
    } catch (error) {
        return {
            ok: false,
            errors: formatErrors(error, models),
        };
    }
};

export const tryLoadSIRScaleDefinition = async (id, models, user) => {
    try {
        const sir = await models.SIRScale.findOne({ where: { id } });
        return sir;
    } catch (error) {
        return {
            ok: false,
            errors: formatErrors(error, models),
        };
    }
};

export const tryUpsertSIRScaleVersion = async (id, sirScaleVersionInput, models, user) => {
    try {
        // verify this user has permission to update this table
        if (!permissions((user || '').id, 'SIRScale', 'tryUpsertSIRScaleVersion')) {
            throw new Error(`User: ${(user || '').id} permmission denied for upsert of: SIRScale`);
        }
        const {
            filterTypeId,
            version,
            description,
            jsonDefinition,
            serializedDiagram,
            publishedAt,
        } = sirScaleVersionInput;

        let res = await models.SIRScale.findOne({ attributes: ['id'], where: { id } });
        if (!res) {
            res = await models.SIRScale.create({
                filterTypeId,
                version,
                description,
                jsonDefinition,
                serializedDiagram,
                publishedAt,
            });
            if (res[0] === 0) {
                return {
                    ok: false,
                    errors: [{
                        path: 'tryUpsertSIRScaleVersion',
                        message: `Unknown error updating SIR Scale entry. id: ${id}.`,
                    }],
                };
            }
        } else {
            const cols = { serializedDiagram };
            if (version) cols.version = version;
            if (description) cols.description = description;
            if (publishedAt) cols.publishedAt = publishedAt;
            if (filterTypeId) cols.filterTypeId = filterTypeId;
            if (jsonDefinition) cols.jsonDefinition = jsonDefinition;
            await models.SIRScale.update(cols, { where: { id } });
        }
        return { ok: true, id: res.dataValues.id };
    } catch (error) {
        return {
            ok: false,
            errors: formatErrors(error, models),
        };
    }
};