export default class BaseComponent extends HTMLElement
{
	// Note that TypeScript is unable to reference derived class static members from the base class without some casting, so
	// you need to do this:
	//	(this.constructor as any).MyStaticProperty (derived class copy, not base class copy)
	//
	//	see https://github.com/Microsoft/TypeScript/issues/3841
	//

	// static fields

	// non-static fields
	protected _shadRoot: Nullable<ShadowRoot> = null;
	protected get ShadRoot(): Nullable<ShadowRoot> { return this._shadRoot }
	protected set ShadRoot(value) { this._shadRoot = value }

	// static properties (get/set)
	// In TypeScript 3.6 there is no way of accessing the derived type static property within a base class static method without using <any> casting
	// see https://github.com/microsoft/TypeScript/issues/5863
	// ES6 proposal has been added: link???

	// html tag name
	protected static _tagName: string = "not used";
	protected get TagName(): string {
		return (this.constructor as any)._tagName;
	}
	protected set TagName(value: string) {
		(this.constructor as any)._tagName = value;
	}

	// template html
	protected static _templateHtml: string = "not used";
	protected get TemplateHtml(): string {
		return (this.constructor as any)._templateHtml;
	}
	protected set TemplateHtml(value: string) {
		(this.constructor as any)._templateHtml = value;
	}

	// ctor
	constructor(tagName: string) {
		super();	// call HTMLElement ctor

		console.log(`${this.constructor.name} ctor() called`);

		// create empty shadow node
		this.ShadRoot = this.attachShadow({ mode: 'open' });

		// store html tag and attempt template attach, but defer template loading to connectedCallback() if it's not already loaded into document
		this.TagName = tagName;		// e.g. my-header
		this.cloneAndAttachTemplate(false);
	}

	GetShadowElement<T extends HTMLElement>(id: string): HTMLElement {
		let shad = this.shadowRoot;
		if (shad == null) {
			alert('GetShadowElement(): this.shadowRoot is null')
			return new HTMLElement();
		}

		let el = shad.querySelector<T>(`#${id}`);
		if (el == null) {
			alert(`GetShadowElement(): element with id ${id} not found`);
			return new HTMLElement();
		}

		return el;
	}

	public SetElementContent(propName: keyof this) {
		let elName = `wcf-${propName}`;
		let elValue: string = String(this[propName]);

		let el = this.GetShadowElement<HTMLElement>(elName);
		el.innerHTML = elValue;
	}

	// DOM element loaded event
	protected async connectedCallback() {
		console.log(`super: ${this.constructor.name}.connectedCallback() called`);
		if (!customElements.whenDefined(this.TagName)) {
			alert(`${this.TagName} is not [yet?] registered, have you called customElements.define('${this.TagName}', '${this.constructor.name}')`);
			return;
		}

		// connectedCallback and all descendents must be awaited otherwise intialisation/binding will fail
		await this.loadTemplate();

		// call addEventListener for every event in html
	}

	protected async disconnectedCallback() {
		// call removeEventListener for every event in html
		alert('BaseComponent.disconnectedCallback() called');
	}

	private AddEventHandler(id: string, eventName: string, code: string) {
		let el = this.GetShadowElement<HTMLElement>(id);
		let callbackFn = new Function("ev", code);
		el.addEventListener(eventName, callbackFn.bind(this));
	}

	private ParseEvent(key: string) {
		//
		// <input type="number" value="[[a]]" id="input-a" @change="this.a = el.value">
		//
		let idEnd = 0;
		let idStart = key.indexOf('id=') + 4;
		if (idStart != -1) {
			idEnd = key.indexOf('"', idStart);
		}
		let eventStart = key.indexOf('@') + 1;
		let eventEnd = key.indexOf('"', eventStart) - 1;

		let codeStart = eventEnd + 2;
		let codeEnd = key.indexOf('"', codeStart);

		let id: string = key.substring(idStart, idEnd);
		let event: string = key.substring(eventStart, eventEnd);
		let code: string = key.substring(codeStart, codeEnd);

		this.AddEventHandler(id, event, code);
	}

	private ParseAndAttachEvents(htmlTemplate: string) {
		// parse for @EventName event handlers
		htmlTemplate.replace(/<.+@.+>/gm, (key: string/*, value: any*/): string => {
			this.ParseEvent(key);
			return '';	// not interested in result
		});

	}

	private AddDataBinding(htmlTemplate: string): string {

		// Note matchAll not offically available until 2020, but allegedly can be polyfilled by TypeScript:
		//	https://stackoverflow.com/questions/55499555/property-matchall-does-not-exist-on-type-string

		// substitute all {{property}} items for <span id="field-n"> elements to allow one-way binding from Typescript properties to html elements
		let interpolateHtml = htmlTemplate.replace(/{{\w+}}/gm, (key: string/*, value: any*/): string => {
			let propName: string = key.substring(2, key.length - 2);
			let propKey = propName as keyof this;
			let propValue = this[propKey];
			let spanString = `<span id="wcf-${propName}">${propValue}</span>`;
			return spanString;
		});

		// perform one-time substitution of all [[property]] items with current property value
		interpolateHtml = interpolateHtml.replace(/\[\[\w+\]\]/gm, (key: string/*, value: any*/): string => {
			let propName: string = key.substring(2, key.length - 2);
			let propKey = propName as keyof this;
			let propValue = this[propKey];
			let staticSub = `${propValue}`;
			return staticSub;
		});

		console.log(interpolateHtml);
		return interpolateHtml;
	}

	// load html template from server and then clone and attach
	private async loadTemplate() {
		//console.log(`Current path is : ${window.location.pathname}`);
		let templateFilename = `/WebComponents/${this.TagName}/${this.TagName}.html`;
		templateFilename = templateFilename.replace(/-/gm, '');	// remove kebab casing

		// get html template file
		let response = await fetch(templateFilename);
		if (response == null) {
			alert(`Cannot load template with id ${this.TagName} in ${templateFilename}`);
			return;
		}
		let html = await response.text();
		this.TemplateHtml = this.AddDataBinding(html);

		// insert modified html fragment into current html document
		let head = document.querySelector<HTMLHeadElement>('head');
		if (head == null) {
			alert('<head> element not found in doc, aborting');
			return;
		}
		head.insertAdjacentHTML('beforeend', this.TemplateHtml);

		// now add template to doc
		this.cloneAndAttachTemplate(true);
	}

	// clone and attach to previously loaded html template (will silently fail if template not found, then retry when DOM element is loaded)
	private cloneAndAttachTemplate(showErrors: boolean) {
		const templateName = `#${this.TagName}`;
		const template = document.querySelector<HTMLTemplateElement>(templateName);
		if (template == null) {
			let errMsg = `Cannot find template with id ${templateName} in current html document`;
			if (showErrors)
				alert("ERROR:" + errMsg)
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

		// now that DOM node has been added, parse and add events
		this.ParseAndAttachEvents(template.innerHTML);
	}
}
