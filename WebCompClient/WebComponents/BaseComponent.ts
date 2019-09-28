// see https://html.spec.whatwg.org/multipage/custom-elements.html
// and https://html.spec.whatwg.org/multipage/custom-elements.html#customelementregistry
//
//	Web Components API functions
//	============================
//	window.customElements.define(name, constructor)
//	window.customElements.define(name, constructor, { extends: baseLocalName })
//	window.customElements.whenDefined(name)
//	window.customElements.get(name)
//	window.customElements.upgrade(root)
//

interface IPushState {
	htmlTag: string,
	targetElement: string,
	url: string
}

interface IComponent {
	//htmlTag: string;				// component tag (key)
	htmlElement: string;			// DOM element
	instance: BaseComponent;	// class ref
	url: string;							// url
}

export default class BaseComponent extends HTMLElement
{
	// Note that TypeScript is unable to reference derived class static members from the base class without some casting, so
	// you need to do this:
	//	(this.constructor as any).MyStaticProperty (derived class copy, not base class copy)
	//
	//	see https://github.com/Microsoft/TypeScript/issues/3841
	//	and possible workaround: https://github.com/Microsoft/TypeScript/issues/3841#issuecomment-337560146

	// static properties (get/set)
	// In TypeScript 3.6 there is no way of accessing the derived type static property within a base class static method without using <any> casting
	// see https://github.com/microsoft/TypeScript/issues/5863
	// ES6 proposal has been added: link???

	// static fields
	private static urlChangedEventAdded: boolean = false;
	private static _components: Map<string, IComponent> = new Map<string, IComponent>();

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

	// non-static properties
	protected _shadRoot: Nullable<ShadowRoot> = null;
	protected get ShadRoot(): Nullable<ShadowRoot> { return this._shadRoot }
	protected set ShadRoot(value) { this._shadRoot = value }

	// ctor
	constructor(tagName: string) {
		super();	// call HTMLElement ctor

		// add single global event to track url changes (can't move to after class def due to 'this' ref)
		if (!BaseComponent.urlChangedEventAdded) {
			// one url event handler for all components
			console.log("Added global event handler for events 'locationchange', 'popstate', 'pushstate' to window object");
			window.addEventListener('locationchange', this.onUrlChanged.bind(this));
			window.addEventListener('popstate', this.onPopstate.bind(this));
			window.addEventListener('pushstate', this.onPushstate.bind(this));
			BaseComponent.urlChangedEventAdded = true;
		}

		// log ctor call
		console.log(`${this.constructor.name} ctor() called`);

		// store component info in map so we can retrieve it later
		let component: IComponent = { htmlElement: 'main', instance: this, url: 'home' };
		console.log(`Looking for existing html component ${tagName}`);
		let existingComponent = BaseComponent._components.get(tagName);
		if (existingComponent == null) {
			console.log(`Html component ${tagName} not found, adding to hash map`);
			BaseComponent._components.set(tagName, component);
		}
		else {
			let msg = `Html component ${tagName} already exists, aborting ctor`;
			alert(msg);	// this shouldn't be happening
			console.log(msg);
			return;
		}

		// this.ShadRoot is initialised to null and remains that way until template has been loaded and attached to DOM
		//this.ShadRoot = null;

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

		// if this component has already been initialised, then do nothing
		if (this.ShadRoot != null) {
			console.log(`Component ${this.TagName} is already initialised, exiting connectedCallback`);
			return;
		}

		if (!customElements.whenDefined(this.TagName)) {
			alert(`${this.TagName} is not [yet?] registered, have you called customElements.define('${this.TagName}', '${this.constructor.name}')`);
			return;
		}

		// connectedCallback and all descendents must be awaited otherwise intialisation/binding will fail
		console.log(`Component ${this.TagName} NOT initialised, awaiting html template load...`);
		await this.loadTemplate();

		// call addEventListener for every event in html
	}

	protected async disconnectedCallback() {
		// call removeEventListener for every event in html
		console.log(`${this.constructor.name}.disconnectedCallback() called`);
	}

	protected async adoptedCallback() {
		alert(`${this.constructor.name}.adoptedCallback() called`);
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

	//private GetPropValue(propName: string): this[keyof this] {
	private GetPropValue(propName: string): this[keyof this] {
		let propKey = propName as keyof this;
		if (!(propKey in this)) {
			alert(`HTML Template Error: Property/field '${propKey}' does not exist in component ${this.constructor.name}`);
			//return '<no such prop/field';
		}
		let propValue = this[propKey];
		return propValue;
	}

	private AddDataBinding(htmlTemplate: string): string {
		//
		// Note matchAll not offically available until 2020, but allegedly can be polyfilled by TypeScript:
		//	https://stackoverflow.com/questions/55499555/property-matchall-does-not-exist-on-type-string

		// substitute all {{property}} items for <span id="field-n"> elements to allow one-way binding from Typescript properties to html elements
		let interpolateHtml = htmlTemplate.replace(/{{\w+}}/gm, (key: string/*, value: any*/): string => {
			let propName: string = key.substring(2, key.length - 2);
			let propValue = this.GetPropValue(propName);
			let spanString = `<span id="wcf-${propName}">${propValue}</span>`;
			return spanString;
		});

		// perform one-time substitution of all [[property]] items with current property value
		interpolateHtml = interpolateHtml.replace(/\[\[\w+\]\]/gm, (key: string/*, value: any*/): string => {
			let propName: string = key.substring(2, key.length - 2);
			let propValue = this.GetPropValue(propName);
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
				console.log("Deferring component creation to connectedCallback(): " + errMsg);
			return;
		}

		// at this point the template has been loaded and found in current document, so we create a new shadow node and attach a cloned copy of the template
		const templateContent = template.content;
		this.ShadRoot = this.attachShadow({ mode: 'open' });
		this.ShadRoot.appendChild(templateContent.cloneNode(true));
		console.log(`HTML template has been attached for ${this.TagName}`);

		// now that DOM node has been added, parse and add event handlers
		this.ParseAndAttachEvents(template.innerHTML);
	}

	// load specified web component into target html tag and set slug to specfied value
	public loadComponent(htmlTag: string, targetElement: string, slug: string, setState: boolean = true) {
		console.log(`Attempting to load component ${htmlTag} into element <${targetElement}> and then set url to /${slug}`);

		// see if this component has already been created
		let componentToInsert: BaseComponent;
		let existingComponent = BaseComponent._components.get(htmlTag);
		if (existingComponent == null) {
			// not found, create new instance of component
			let componentClass = window.customElements.get(htmlTag);
			console.log(`Creating new component '${componentClass.constructor.name}'`);
			componentToInsert = new componentClass(htmlTag);
		}
		else {
			// already exists, re-use old component
			console.log(`Found existing component ${htmlTag}`);
			componentToInsert = existingComponent.instance;
		}

		// get ref to target HTML element container
		let parent = document.querySelector<HTMLElement>(targetElement);
		if (parent == null) {
			alert(`Could not find element ${targetElement} in current document`);
			return;
		}

		let componentToReplace = parent.firstChild;
		if (componentToReplace == null) {
			alert(`Element ${targetElement} has no child element to replace`);
			return;
		}

		// update DOM with correct component
		parent.replaceChild(componentToInsert, componentToReplace);

		// handle url changed events (don't do this if user clicked Back/Forwards buttons)
		if (setState) {
			let pushState: IPushState = { htmlTag: htmlTag, targetElement: targetElement, url: slug };
			console.log(`Calling history.pushstate(${JSON.stringify(pushState)})`);
			history.pushState(pushState, 'title', `/${slug}`);
		}
	}

	//
	// url changed events
	//

	// Back/Forwards browser buttons
	protected onPopstate(ev: PopStateEvent) {
		let ps: IPushState = ev.state;
		if (ps == null) {
			console.log('onPopstate(), pushstate is null');
			return;
		}
		console.log(`Popstate event fired: ${JSON.stringify(ps)}`);
		this.loadComponent(ps.htmlTag, ps.targetElement, ps.url, false);	// false = don't push state using history API
	}

	// this only detects user changing url in browser???
	protected onUrlChanged(ev: Event) {
		alert('url changed');
		console.log(ev);
	}

	// Note - not triggered by calling history.pushState()
	protected onPushstate(ev: Event) {
		alert('pushstate changed');
		console.log(ev);
	}

}
