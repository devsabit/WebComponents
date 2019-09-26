var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export default class BaseComponent extends HTMLElement {
    constructor(tagName) {
        super();
        this._shadRoot = null;
        console.log(`${this.constructor.name} ctor() called`);
        this.ShadRoot = this.attachShadow({ mode: 'open' });
        this.TagName = tagName;
        this.cloneAndAttachTemplate(false);
    }
    get ShadRoot() { return this._shadRoot; }
    set ShadRoot(value) { this._shadRoot = value; }
    get TagName() {
        return this.constructor._tagName;
    }
    set TagName(value) {
        this.constructor._tagName = value;
    }
    get TemplateHtml() {
        return this.constructor._templateHtml;
    }
    set TemplateHtml(value) {
        this.constructor._templateHtml = value;
    }
    GetShadowElement(id) {
        let shad = this.shadowRoot;
        if (shad == null) {
            alert('GetShadowElement(): this.shadowRoot is null');
            return new HTMLElement();
        }
        let el = shad.querySelector(`#${id}`);
        if (el == null) {
            alert(`GetShadowElement(): element with id ${id} not found`);
            return new HTMLElement();
        }
        return el;
    }
    SetElementContent(propName) {
        let elName = `wcf-${propName}`;
        let elValue = String(this[propName]);
        let el = this.GetShadowElement(elName);
        el.innerHTML = elValue;
    }
    connectedCallback() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`super: ${this.constructor.name}.connectedCallback() called`);
            if (!customElements.whenDefined(this.TagName)) {
                alert(`${this.TagName} is not [yet?] registered, have you called customElements.define('${this.TagName}', '${this.constructor.name}')`);
                return;
            }
            yield this.loadTemplate();
        });
    }
    disconnectedCallback() {
        return __awaiter(this, void 0, void 0, function* () {
            alert('BaseComponent.disconnectedCallback() called');
        });
    }
    AddEventHandler(id, eventName, code) {
        let el = this.GetShadowElement(id);
        let callbackFn = new Function("ev", code);
        el.addEventListener(eventName, callbackFn.bind(this));
    }
    ParseEvent(key) {
        let idEnd = 0;
        let idStart = key.indexOf('id=') + 4;
        if (idStart != -1) {
            idEnd = key.indexOf('"', idStart);
        }
        let eventStart = key.indexOf('@') + 1;
        let eventEnd = key.indexOf('"', eventStart) - 1;
        let codeStart = eventEnd + 2;
        let codeEnd = key.indexOf('"', codeStart);
        let id = key.substring(idStart, idEnd);
        let event = key.substring(eventStart, eventEnd);
        let code = key.substring(codeStart, codeEnd);
        this.AddEventHandler(id, event, code);
    }
    ParseAndAttachEvents(htmlTemplate) {
        htmlTemplate.replace(/<.+@.+>/gm, (key) => {
            this.ParseEvent(key);
            return '';
        });
    }
    AddDataBinding(htmlTemplate) {
        let interpolateHtml = htmlTemplate.replace(/{{\w+}}/gm, (key) => {
            let propName = key.substring(2, key.length - 2);
            let propKey = propName;
            let propValue = this[propKey];
            let spanString = `<span id="wcf-${propName}">${propValue}</span>`;
            return spanString;
        });
        interpolateHtml = interpolateHtml.replace(/\[\[\w+\]\]/gm, (key) => {
            let propName = key.substring(2, key.length - 2);
            let propKey = propName;
            let propValue = this[propKey];
            let staticSub = `${propValue}`;
            return staticSub;
        });
        console.log(interpolateHtml);
        return interpolateHtml;
    }
    loadTemplate() {
        return __awaiter(this, void 0, void 0, function* () {
            let templateFilename = `/WebComponents/${this.TagName}/${this.TagName}.html`;
            templateFilename = templateFilename.replace(/-/gm, '');
            let response = yield fetch(templateFilename);
            if (response == null) {
                alert(`Cannot load template with id ${this.TagName} in ${templateFilename}`);
                return;
            }
            let html = yield response.text();
            this.TemplateHtml = this.AddDataBinding(html);
            let head = document.querySelector('head');
            if (head == null) {
                alert('<head> element not found in doc, aborting');
                return;
            }
            head.insertAdjacentHTML('beforeend', this.TemplateHtml);
            this.cloneAndAttachTemplate(true);
        });
    }
    cloneAndAttachTemplate(showErrors) {
        const templateName = `#${this.TagName}`;
        const template = document.querySelector(templateName);
        if (template == null) {
            let errMsg = `Cannot find template with id ${templateName} in current html document`;
            if (showErrors)
                alert("ERROR:" + errMsg);
            else
                console.log("INFO: " + errMsg);
            return;
        }
        const templateContent = template.content;
        let shad = this.shadowRoot;
        if (shad == null)
            return;
        shad.appendChild(templateContent.cloneNode(true));
        console.log(`HTML template has been attached for ${this.TagName}`);
        this.ParseAndAttachEvents(template.innerHTML);
    }
}
BaseComponent._tagName = "not used";
BaseComponent._templateHtml = "not used";
//# sourceMappingURL=BaseComponent.js.map