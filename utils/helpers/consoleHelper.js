// Node Packages
const {bgBlue, bgCyan, bgGreen, bgYellow, bgRed, gray, cyan} = require('chalk');

// JSON Files
const pkg = require('../../package.json');

// Functions
const welcome = async () => {
    spacer();
    console.log(cyan(`osu! Stream Background v${pkg.version}`));
    console.log(cyan(`By ${pkg.author}`));
    console.log(cyan('Type Ctrl+C to quit'));
    spacer();
    return;
};

const spacer = async () => {
    return console.log(gray('-----------------------------------'));
};

const info = async (str) => {
    return console.log(`${bgBlue.black.bold('INFO')} ${str}`);
};

const log = async (str) => {
    return console.log(`${bgCyan.black.bold('LOG')} ${str}`);
};

const success = async (str) => {
    return console.log(`${bgGreen.black.bold('SUCCESS')} ${str}`);
};

const warn = async (str) => {
    return console.log(`${bgYellow.black.bold('WARN')} ${str}`);
};

const error = async (str) => {
    return console.log(`${bgRed.black.bold('ERROR')} ${str}`);
};

// Export
module.exports = {welcome, spacer, info, log, success, warn, error};