import {
    tryGetSIRScaleVersions,
    tryLoadSIRScaleDefinition,
    tryUpsertSIRScaleVersion,
} from './sirScaleLogic/sirScale';
import requiresAuth from '../utils/checkAuthenticated';

export default {
    Query: {
        getSIRScaleVersions: (parent, { filterTypeId }, { models, user }) => tryGetSIRScaleVersions(filterTypeId, models, user),
        loadSIRScaleDefinition: (parent, { id }, { models, user }) => tryLoadSIRScaleDefinition(id, models, user),
    },
    Mutation: {
        upsertSIRScaleVersion: requiresAuth.createResolver(async (parent, { id, sirScaleVersionInput }, { models, user }) =>
            tryUpsertSIRScaleVersion(id, sirScaleVersionInput, models, user)),
    },
};
