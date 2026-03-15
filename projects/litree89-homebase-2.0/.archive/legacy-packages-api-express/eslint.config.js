/* eslint-env node */
const js = require("@eslint/js");
const globals = require("globals");
const nodePlugin = require("eslint-plugin-n");

module.exports = [
    js.configs.recommended,
    {
        files: ["**/*.js"],
        plugins: {
            n: nodePlugin,
        },
        languageOptions: {
            ecmaVersion: 2024,
            sourceType: "commonjs",
            globals: {
                ...globals.node,
                ...globals.commonjs,
                ...globals.es2024,
            },
        },
        rules: {
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "no-console": "off",
            "n/prefer-node-protocol": "error",
        },
    },
];
