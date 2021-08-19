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
class NativeCardServiceController extends rxjs_1.Observable {
    constructor() {
        super(subscribe => {
            /**
             * Add service listeners.
             */
            this.service.on('card', (card) => subscribe.next(card));
            this.service.on('error', (e) => subscribe.error(e));
            this.service.on('update', (delta) => this.updateSubject.next(delta));
        });
        /**
         * Init service.
         */
        this.statusSubject = new rxjs_1.Subject();
        this.updateSubject = new rxjs_1.Subject();
        this.service = new PCSC.service();
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
            this.service.update();
        });
    }
    /**
     * Stop native card service.
     */
    stop() {
        this.statusSubject.next();
    }
}
exports.pcsc = new NativeCardServiceController();
