const path = require('path');
const fse = require('fs-extra');

const files = [
    'README.md',
    'LICENSE',
    'src/config/config.json',
];

function resolveBuildPath(file) {
    return path.resolve(__dirname, '../dist/', path.basename(file));
}

function copyFile(file) {
    const fileparts = file.split('/');
    let subdir = '';
    // console.log(fileparts);
    let libPath = '';
    if (fileparts.length > 1) {
        subdir = `/${fileparts[1]}`;
        libPath = path.resolve(__dirname, `../dist/${subdir}`, path.basename(file));
    } else {
        libPath = resolveBuildPath(subdir + file);
    }
    console.log(libPath);
    return new Promise(resolve =>
        fse.copy(file, libPath, (err) => { if (err) throw err; resolve(); })).then(() => console.log(`Copied ${file} to ${libPath}`));
}

function createPackageFile() {
    return new Promise((resolve) => {
        fse.readFile(path.resolve(__dirname, '../package.json'), 'utf8', (err, data) => {
            if (err) {
                throw err;
            }

            resolve(data);
        });
    })
        .then(data => JSON.parse(data))
        .then((packageData) => {
            const {
                author,
                version,
                description,
                keywords,
                repository,
                license,
                bugs,
                homepage,
                peerDependencies,
                dependencies,
            } = packageData;

            const minimalPackage = {
                name: 'sirs-api',
                author,
                version,
                description,
                main: './index.js',
                keywords,
                repository,
                license,
                bugs,
                homepage,
                peerDependencies,
                dependencies,
            };

            return new Promise((resolve) => {
                const libPath = path.resolve(__dirname, '../dist/package.json');
                const data = JSON.stringify(minimalPackage, null, 2);
                fse.writeFile(libPath, data, (err) => {
                    if (err) throw (err);
                    console.log(`Created package.json in ${libPath}`);
                    resolve();
                });
            });
        });
}

Promise.all(files.map(file => copyFile(file)))
    .then(() => createPackageFile());
