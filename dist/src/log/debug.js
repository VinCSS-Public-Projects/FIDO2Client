"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const chalk_1 = require("chalk");
const crypto_1 = require("crypto");
const signature = crypto_1.randomBytes(16).toString('base64');
class Logger {
    debug(...data) {
        process.env['FIDO2_CLIENT_DEBUG'] === 'TRUE' ? console.log.apply(console, [
            chalk_1.bgHex('#807d7a')(new Date().toLocaleString()),
            chalk_1.bgHex('#0004ff')((new Error(signature))
                .stack // Grabs the stack trace
                ?.split(`Error: ${signature}\n`)[1]
                .split('\n')[1] // Grabs third line
                .trim() // Removes spaces
                .substring(3) // Removes three first characters ("at ")
                // .replace(__dirname ? __dirname : '', '') // Removes script folder path
                .replace(/\s\(/, ' ') // Removes first parentheses and replaces it with " at "
                .replace(/\)/, '')),
            chalk_1.bgHex('#00f018')('LOG'),
            ...data
        ]) : undefined;
    }
    error(...data) {
        console.log.apply(console, [
            chalk_1.bgHex('#807d7a')(new Date().toLocaleString()),
            chalk_1.bgHex('#0004ff')((new Error(signature))
                .stack // Grabs the stack trace
                ?.split(`Error: ${signature}\n`)[1]
                .split('\n')[1] // Grabs third line
                .trim() // Removes spaces
                .substring(3) // Removes three first characters ("at ")
                // .replace(__dirname ? __dirname : '', '') // Removes script folder path
                .replace(/\s\(/, ' ') // Removes first parentheses and replaces it with " at "
                .replace(/\)/, '')),
            chalk_1.bgHex('#00f018')('LOG'),
            ...data
        ]);
    }
    warn(...data) {
        console.log.apply(console, [
            chalk_1.bgHex('#807d7a')(new Date().toLocaleString()),
            chalk_1.bgHex('#0004ff')((new Error(signature))
                .stack // Grabs the stack trace
                ?.split(`Error: ${signature}\n`)[1]
                .split('\n')[1] // Grabs third line
                .trim() // Removes spaces
                .substring(3) // Removes three first characters ("at ")
                // .replace(__dirname ? __dirname : '', '') // Removes script folder path
                .replace(/\s\(/, ' ') // Removes first parentheses and replaces it with " at "
                .replace(/\)/, '')),
            chalk_1.bgHex('#00f018')('LOG'),
            ...data
        ]);
    }
}
exports.logger = new Logger();
//# sourceMappingURL=debug.js.map