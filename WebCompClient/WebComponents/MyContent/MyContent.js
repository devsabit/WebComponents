var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import BaseComponent from '../BaseComponent.js';
export default class MyContent extends BaseComponent {
    constructor() {
        super('my-content');
        this._a = 1;
        this._b = 2;
    }
    get a() { return this._a; }
    set a(value) {
        this._a = Number(value);
        super.SetElementContent("a");
        super.SetElementContent("total");
    }
    get b() { return this._b; }
    set b(value) {
        this._b = Number(value);
        super.SetElementContent("b");
        super.SetElementContent("total");
    }
    get total() { return this.a + this.b; }
    connectedCallback() {
        const _super = Object.create(null, {
            connectedCallback: { get: () => super.connectedCallback }
        });
        return __awaiter(this, void 0, void 0, function* () {
            console.log('sub: MyContent.connectedCallback() called');
            yield _super.connectedCallback.call(this);
            console.log('sub: MyContent.connectedCallback() base class completed (allegedly)');
        });
    }
}
//# sourceMappingURL=MyContent.js.map