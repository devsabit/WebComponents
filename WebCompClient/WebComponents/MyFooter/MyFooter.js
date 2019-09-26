import BaseComponent from '../BaseComponent.js';
export default class MyFooter extends BaseComponent {
    constructor() {
        super('my-footer');
        this.copyright = `(c) Widget Ltd ${new Date().getFullYear()}`;
    }
}
//# sourceMappingURL=MyFooter.js.map