import { bgHex } from 'chalk';

interface ILogger {
    debug(...data: any[]): void;
    warn(...data: any[]): void;
    error(...data: any[]): void;
}

class Logger implements ILogger {
    debug(...data: any[]): void {
        console.log.apply(
            console,
            [
                bgHex('#807d7a')(new Date().toLocaleString()),
                bgHex('#0004ff')((new Error())
                    .stack // Grabs the stack trace
                    ?.split('\n')[2] // Grabs third line
                    .trim() // Removes spaces
                    .substring(3) // Removes three first characters ("at ")
                    .replace(__dirname ? __dirname : '', '') // Removes script folder path
                    .replace(/\s\(/, ' ') // Removes first parentheses and replaces it with " at "
                    .replace(/\)/, '')), // Removes last parentheses),
                bgHex('#00f018')('LOG'),
                ...data
            ]
        );
    }

    error(...data: any[]): void {
        console.log.apply(
            console,
            [
                bgHex('#807d7a')(new Date().toLocaleString()),
                bgHex('#0004ff')((new Error())
                    .stack // Grabs the stack trace
                    ?.split('\n')[2] // Grabs third line
                    .trim() // Removes spaces
                    .substring(3) // Removes three first characters ("at ")
                    .replace(__dirname ? __dirname : '', '') // Removes script folder path
                    .replace(/\s\(/, ' ') // Removes first parentheses and replaces it with " at "
                    .replace(/\)/, '')), // Removes last parentheses
                bgHex('#e82300')('ERR'),
                ...data
            ]
        );
    }

    warn(...data: any[]): void {
        console.log.apply(
            console,
            [
                bgHex('#807d7a')(new Date().toLocaleString()),
                bgHex('#0004ff')((new Error())
                    .stack // Grabs the stack trace
                    ?.split('\n')[2] // Grabs third line
                    .trim() // Removes spaces
                    .substring(3) // Removes three first characters ("at ")
                    .replace(__dirname ? __dirname : '', '') // Removes script folder path
                    .replace(/\s\(/, ' ') // Removes first parentheses and replaces it with " at "
                    .replace(/\)/, '')), // Removes last parentheses
                bgHex('#fac802')('WAR'),
                ...data
            ]
        );
    }
}

export const logger = new Logger();