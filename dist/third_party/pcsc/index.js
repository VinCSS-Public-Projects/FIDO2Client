"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NativeCardService = exports.NativeCard = void 0;
const bindings_1 = __importDefault(require("bindings"));
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const pcsc = bindings_1.default('pcsc.node');
class NativeCard {
    constructor(metadata) {
        this.card = new pcsc.card();
        this.card.open(metadata);
    }
    transmit(data) {
        return this.card.transmit(data);
    }
    close() {
        this.card.close();
    }
}
exports.NativeCard = NativeCard;
class NativeCardServiceController extends rxjs_1.Subject {
    constructor() {
        super();
        this.statusSubject = new rxjs_1.Subject();
        this.service = new pcsc.service();
        this.service.on('card', (card) => {
            this.next(card);
        });
        this.service.on('error', (e) => {
            this.error(e);
        });
    }
    start() {
        rxjs_1.interval(250).pipe(operators_1.takeUntil(this.statusSubject)).subscribe(x => {
            this.service.update();
        });
    }
    stop() {
        this.statusSubject.next();
    }
}
exports.NativeCardService = new NativeCardServiceController();
