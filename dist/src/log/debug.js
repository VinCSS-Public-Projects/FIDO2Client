"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const crypto_1 = require("crypto");
const signature = crypto_1.randomBytes(16).toString('base64');
class Logger {
    debug(...data) {
        process.env['FIDO2_CLIENT_DEBUG'] === 'TRUE' ? console.log.apply(console, [
            `[${new Date().toLocaleString()}]`,
            `[${(new Error(signature))
                .stack // Grabs the stack trace
                ?.split(`Error: ${signature}\n`)[1]
                .split('\n')[1] // Grabs third line
                .trim() // Removes spaces
                .substring(3) // Removes three first characters ("at ")
                // .replace(__dirname ? __dirname : '', '') // Removes script folder path
                .replace(/\s\(/, ' ') // Removes first parentheses and replaces it with " at "
                .replace(/\)/, '')}]`,
            '[LOG]',
            ...data
        ]) : undefined;
    }
    error(...data) {
        console.log.apply(console, [
            `[${new Date().toLocaleString()}]`,
            `[${(new Error(signature))
                .stack // Grabs the stack trace
                ?.split(`Error: ${signature}\n`)[1]
                .split('\n')[1] // Grabs third line
                .trim() // Removes spaces
                .substring(3) // Removes three first characters ("at ")
                // .replace(__dirname ? __dirname : '', '') // Removes script folder path
                .replace(/\s\(/, ' ') // Removes first parentheses and replaces it with " at "
                .replace(/\)/, '')}]`,
            '[ERR]',
            ...data
        ]);
    }
    warn(...data) {
        console.log.apply(console, [
            `[${new Date().toLocaleString()}]`,
            `[${(new Error(signature))
                .stack // Grabs the stack trace
                ?.split(`Error: ${signature}\n`)[1]
                .split('\n')[1] // Grabs third line
                .trim() // Removes spaces
                .substring(3) // Removes three first characters ("at ")
                // .replace(__dirname ? __dirname : '', '') // Removes script folder path
                .replace(/\s\(/, ' ') // Removes first parentheses and replaces it with " at "
                .replace(/\)/, '')}]`,
            '[WAR]',
            ...data
        ]);
    }
}
exports.logger = new Logger();
//# sourceMappingURL=debug.js.map