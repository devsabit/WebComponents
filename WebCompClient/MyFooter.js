export default class MyFooter extends HTMLElement {
    constructor() {
        super();
        const templateName = '#my-footer';
        const template = document.querySelector(templateName);
        if (template == null) {
            alert(`Cannot find template with id #${templateName} in index.html`);
            return;
        }
        const templateContent = template.content;
        this.attachShadow({ mode: 'open' }).appendChild(templateContent.cloneNode(true));
    }
}
//# sourceMappingURL=MyFooter.js.map