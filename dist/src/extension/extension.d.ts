export interface IExtension<T> {
    make(...args: any[]): this;
    get(...args: any[]): this;
    build(): Promise<T>;
}
