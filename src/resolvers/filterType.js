import {
    tryGetFilterTypes,
} from './filterTypeLogic/filterType';

export default {
    Query: {
        allFilterTypes: (parent, args, { models }) => tryGetFilterTypes(models),
    },
};
