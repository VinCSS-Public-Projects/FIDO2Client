"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pcsc = exports.NativeCard = exports.NativeCardServiceUpdateInterval = void 0;
const bindings_1 = __importDefault(require("bindings"));
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const PCSC = bindings_1.default('pcsc.node');
exports.NativeCardServiceUpdateInterval = 250;
class NativeCard {
    constructor(metadata) {
        this.card = new PCSC.card();
        this.card.open(metadata);
    }
    /**
     * Transmit data and get response from card.
     * @param data
     * @returns
     */
    transmit(data) {
        return this.card.transmit(data);
    }
    /**
     * Close native card interface.
     */
    close() {
        this.card.close();
    }
}
exports.NativeCard = NativeCard;
class NativeCardServiceController {
    constructor() {
        /**
         * Init service.
         */
        this.statusSubject = new rxjs_1.Subject();
        this.updateSubject = new rxjs_1.Subject();
        this.service = new PCSC.service();
        this.serviceSubject = new rxjs_1.Subject();
        /**
         * Add service listeners.
         */
        this.service.on('card', (card) => this.serviceSubject.next(card));
        this.service.on('error', (e) => this.serviceSubject.error(e));
        this.service.on('update', (delta) => this.updateSubject.next(delta));
    }
    /**
     * Emit consumed time (in ms) of last update.
     */
    get update() {
        return this.updateSubject.asObservable();
    }
    /**
     * Start native card service.
     */
    start() {
        rxjs_1.interval(exports.NativeCardServiceUpdateInterval).pipe(operators_1.takeUntil(this.statusSubject)).subscribe(() => {
            try {
                this.service.update();
            }
            catch (e) {
                this.serviceSubject.error(e);
            }
        });
    }
    /**
     * Stop native card service.
     */
    stop() {
        this.statusSubject.next();
    }
    get observable() {
        return this.serviceSubject.asObservable();
    }
}
exports.pcsc = new NativeCardServiceController();
//# sourceMappingURL=index.js.map