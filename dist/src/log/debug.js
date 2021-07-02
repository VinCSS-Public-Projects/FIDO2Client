"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const chalk_1 = require("chalk");
class Logger {
    debug(...data) {
        console.log.apply(console, [
            chalk_1.bgHex('#807d7a')(new Date().toLocaleString()),
            chalk_1.bgHex('#0004ff')((new Error())
                .stack // Grabs the stack trace
                ?.split('\n')[2] // Grabs third line
                .trim() // Removes spaces
                .substring(3) // Removes three first characters ("at ")
                .replace(__dirname ? __dirname : '', '') // Removes script folder path
                .replace(/\s\(/, ' ') // Removes first parentheses and replaces it with " at "
                .replace(/\)/, '')),
            chalk_1.bgHex('#00f018')('LOG'),
            ...data
        ]);
    }
    error(...data) {
        console.log.apply(console, [
            chalk_1.bgHex('#807d7a')(new Date().toLocaleString()),
            chalk_1.bgHex('#0004ff')((new Error())
                .stack // Grabs the stack trace
                ?.split('\n')[2] // Grabs third line
                .trim() // Removes spaces
                .substring(3) // Removes three first characters ("at ")
                .replace(__dirname ? __dirname : '', '') // Removes script folder path
                .replace(/\s\(/, ' ') // Removes first parentheses and replaces it with " at "
                .replace(/\)/, '')),
            chalk_1.bgHex('#e82300')('ERR'),
            ...data
        ]);
    }
    warn(...data) {
        console.log.apply(console, [
            chalk_1.bgHex('#807d7a')(new Date().toLocaleString()),
            chalk_1.bgHex('#0004ff')((new Error())
                .stack // Grabs the stack trace
                ?.split('\n')[2] // Grabs third line
                .trim() // Removes spaces
                .substring(3) // Removes three first characters ("at ")
                .replace(__dirname ? __dirname : '', '') // Removes script folder path
                .replace(/\s\(/, ' ') // Removes first parentheses and replaces it with " at "
                .replace(/\)/, '')),
            chalk_1.bgHex('#fac802')('WAR'),
            ...data
        ]);
    }
}
exports.logger = new Logger();
