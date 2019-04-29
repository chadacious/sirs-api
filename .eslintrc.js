module.exports = {
    "extends": "airbnb-base",
    rules: {
        "linebreak-style": 0,
        "indent": ["error", 4],
        "eol-last": 0,
        'max-len': ["error", 150]
    },
    env: {
        jest: true,
    },
};