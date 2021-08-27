import { randomBytes } from 'crypto';

const signature = randomBytes(16).toString('base64');

interface ILogger {
    debug(...data: any[]): void;
    warn(...data: any[]): void;
    error(...data: any[]): void;
}

class Logger implements ILogger {
    debug(...data: any[]): void {
        process.env['FIDO2_CLIENT_DEBUG'] === 'TRUE' ? console.log.apply(
            console,
            [
                `[${new Date().toLocaleString()}]`,
                `[${(new Error(signature))
                    .stack // Grabs the stack trace
                    ?.split(`Error: ${signature}\n`)[1]
                    .split('\n')[1] // Grabs third line
                    .trim() // Removes spaces
                    .substring(3) // Removes three first characters ("at ")
                    // .replace(__dirname ? __dirname : '', '') // Removes script folder path
                    .replace(/\s\(/, ' ') // Removes first parentheses and replaces it with " at "
                    .replace(/\)/, '')}]`, // Removes last parentheses),
                '[LOG]',
                ...data
            ]
        ) : undefined;
    }

    error(...data: any[]): void {
        console.log.apply(
            console,
            [
                `[${new Date().toLocaleString()}]`,
                `[${(new Error(signature))
                    .stack // Grabs the stack trace
                    ?.split(`Error: ${signature}\n`)[1]
                    .split('\n')[1] // Grabs third line
                    .trim() // Removes spaces
                    .substring(3) // Removes three first characters ("at ")
                    // .replace(__dirname ? __dirname : '', '') // Removes script folder path
                    .replace(/\s\(/, ' ') // Removes first parentheses and replaces it with " at "
                    .replace(/\)/, '')}]`, // Removes last parentheses),
                '[ERR]',
                ...data
            ]
        );
    }

    warn(...data: any[]): void {
        console.log.apply(
            console,
            [
                `[${new Date().toLocaleString()}]`,
                `[${(new Error(signature))
                    .stack // Grabs the stack trace
                    ?.split(`Error: ${signature}\n`)[1]
                    .split('\n')[1] // Grabs third line
                    .trim() // Removes spaces
                    .substring(3) // Removes three first characters ("at ")
                    // .replace(__dirname ? __dirname : '', '') // Removes script folder path
                    .replace(/\s\(/, ' ') // Removes first parentheses and replaces it with " at "
                    .replace(/\)/, '')}]`, // Removes last parentheses),
                '[WAR]',
                ...data
            ]
        );
    }
}

export const logger = new Logger();