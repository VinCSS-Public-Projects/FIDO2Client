interface ILogger {
    debug(...data: any[]): void;
    warn(...data: any[]): void;
    error(...data: any[]): void;
}
declare class Logger implements ILogger {
    debug(...data: any[]): void;
    error(...data: any[]): void;
    warn(...data: any[]): void;
}
export declare const logger: Logger;
export {};
