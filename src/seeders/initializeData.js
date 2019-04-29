const fs = require('fs');
const Promise = require('bluebird');
const path = require('path');

module.exports = {
    up: queryInterface =>
        Promise
            .resolve()
            .then(() => fs.readFileSync(path.join(__dirname, './initialize-data.sql'), 'utf-8'))
            .then(async (initialSchema) => {
                // console.log('initializing...');
                try {
                    await queryInterface.sequelize.query(initialSchema);
                    // console.log(res);
                } catch (error) {
                    console.log(error);
                }
            })
            .catch((error) => {
                console.log('Error: ', error.message);
            }),
    // down: (queryInterface) => {
    //     // queryInterface.bulkDelete('FilterType');
    //     // queryInterface.bulkDelete('SIRScale');
    // },
};
