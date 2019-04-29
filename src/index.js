import express from 'express';
import { ApolloServer, makeExecutableSchema } from 'apollo-server-express';
import path from 'path';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import { addAuthTokens } from '@medlor/medlor-auth-token-lib';
import childProcess from 'child_process';
import chalk from 'chalk';
import dotenv from 'dotenv';

import getModels from './models';

const { NODE_ENV } = process.env;
dotenv.config({ path: `./.env.${NODE_ENV}` });
if (NODE_ENV !== 'production') dotenv.config({ path: './.env' }); // load in lcoal secret values when not in production

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './schema')));

const resolvers = mergeResolvers(fileLoader(path.join(__dirname, './resolvers')));

const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

const {
    PORT,
    SECRET,
    SECRET2,
    ALLOWED_ORIGINS,
} = process.env;

const app = express();

// allow access to the images folder to serve static content
app.use(express.static('public'));

// app.use(cors({
//     origin: (origin, callback) => {
//         // log.trace(`For now. Allow all origins including: ${origin}`);
//         // allow requests with no origin (like mobile apps or curl requests)
//         // console.log(origin, 'ALLOWED_ORIGINS', ALLOWED_ORIGINS);
//         if (!origin) return callback(null, true);
//         if (ALLOWED_ORIGINS.indexOf(origin) === -1) {
//             const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
//             return callback(new Error(msg), false);
//             // return callback(null, true);
//         }
//         return callback(null, true);
//     },
//     credentials: true,
// }));

// get models for sequelize
getModels().then((models) => {
    const { FORCE_DB_SYNC } = process.env;

    if (!models) {
        console.log('Could not connect to database'); // eslint-disable-line
        return;
    }

    // use the middleware above to put the token in the header
    app.use(addAuthTokens({ models, SECRET, SECRET2 }));

    const graphqlEndpoint = '/graphql';

    const mockUser = { id: 1, activeProfileId: 1 };

    const server = new ApolloServer({
        schema,
        context: ({ req }) => ({
            models,
            user: NODE_ENV !== 'test' ? req.user : req.user || mockUser,
            SECRET,
            SECRET2,
            app,
        }),
        introspection: true,
        playground: true,
    });

    server.applyMiddleware({
        app,
        path: graphqlEndpoint,
        cors: {
            origin: (origin, callback) => {
                // allow requests with no origin (like mobile apps or curl requests)
                // console.log(origin);
                if (!origin) {
                    callback(null, true);
                    return;
                }
                // console.log('the origin is:', origin);
                if (ALLOWED_ORIGINS.indexOf(origin) === -1) {
                    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
                    console.log(msg);
                    callback(new Error(msg), false);
                    return;
                    // return callback(null, true);
                }
                callback(null, true);
            },
            credentials: true,
        },
    });
    if (FORCE_DB_SYNC === '1') {
        // eslint-disable-next-line
        console.log(chalk.black.bgYellow('Dropping and resyncing the database with sequelize schema...'));
    }

    // force: true will drop all the table and re-create them
    const db = models.sequelize;
    db.query(`SET FOREIGN_KEY_CHECKS = ${FORCE_DB_SYNC === '1' ? '0' : '1'}`).then(() =>
        db.sync({ force: FORCE_DB_SYNC === '1' })
            .then(() => {
                // Also check the environment var (passed in through package.json script) if we are set
                // to reseed a fresh database and run the seed command
                if (FORCE_DB_SYNC === '1') {
                    // eslint-disable-next-line
                    console.log(chalk.yellow('Seeding the database...'));
                    childProcess.execSync('sequelize db:seed:all', { cwd: __dirname, stdio: 'inherit' });
                }
            }).then(() => db.query('SET FOREIGN_KEY_CHECKS = 1')).then(() => {
                // As of version 4.22.6 of sequelize, the clause for comparing deletedAt is equals instead of greater than
                // which prevent deleting records into the future. Added this logic to compensate for that for now.
                // Note that if this will break the restore method of sequelize unless you revert back to the original defaultValue.
                Object.keys(models).forEach((model) => {
                    if (models[model].attributes && models[model].attributes.deletedAt) {
                        const { deletedAt } = models[model].attributes;
                        deletedAt.defaultValue = deletedAt.comparisonClause || { [models.sequelize.Op.gt]: models.sequelize.fn('NOW') };
                    }
                });
            }));

    app.listen(PORT);
});
