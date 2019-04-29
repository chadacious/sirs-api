
import Sequelize from 'sequelize';
import { log } from '@medlor/medlor-auth-token-lib';
import sequelizeConfig from '../config/config.json';

export const checkPrerequisiteTable = async (table, sequelize, options) => {
    const res = await sequelize.query(`SHOW TABLES LIKE '${table}';`, {
        logging: options.logging,
    });
    // console.log('table exists', res[0].length, '.');
    if (!res[0][0]) {
        log.error(`Prerequisite table does not exist: ${table}.`);
        // throw new Error(`Prerequisite table does not exist: ${table}.`);
    }
    log.info(`Prerequisite table ${table} exists.`);
    return true;
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export default async () => {
    let maxReconnects = 20;
    let connected = false;
    const { NODE_ENV } = process.env;

    const options = {
        dialect: sequelizeConfig[NODE_ENV].dialect,
        operatorsAliases: Sequelize.Op,
        host: sequelizeConfig[NODE_ENV].host,
        dialectOptions: sequelizeConfig[NODE_ENV].dialectOptions,
        define: {
            timestamps: true,
            paranoid: true,
            freezeTableName: true,
            charset: 'utf8',
            dialectOptions: sequelizeConfig[NODE_ENV].dialectOptions,
        },
        logging: false, // console.log,
    };

    if (sequelizeConfig[NODE_ENV].replication) {
        options.replication = sequelizeConfig[NODE_ENV].replication;
        // pull the pwd from the k8s secret
        options.replication.write.password = process.env.SERVER_PASSWORD;
        // eslint-disable-next-line no-param-reassign
        options.replication.read.forEach((read) => { read.password = process.env.SERVER_PASSWORD; });
    }
    // console.log(process.env);
    const sequelize = new Sequelize(
        sequelizeConfig[NODE_ENV].database,
        sequelizeConfig[NODE_ENV].username,
        process.env.SERVER_PASSWORD,
        options,
    );

    while (!connected && maxReconnects) {
        try {
            await sequelize.authenticate(); // eslint-disable-line
            connected = true;
        } catch (err) {
            console.log('No db connection: Will attempt tp reconnect in 5 seconds... '); // eslint-disable-line
            await sleep(5000); // eslint-disable-line
            maxReconnects -= 1;
        }
    }

    if (!connected) {
        return null;
    }

    const models = {
        FilterType: sequelize.import('./FilterType'),
        SIRScale: sequelize.import('./SIRScale'),
    };

    Object.keys(models).forEach((modelName) => {
        if ('associate' in models[modelName]) {
            models[modelName].associate(models);
        }
    });

    models.sequelize = sequelize;
    models.Sequelize = Sequelize;
    models.op = Sequelize.Op;

    return models;
};
