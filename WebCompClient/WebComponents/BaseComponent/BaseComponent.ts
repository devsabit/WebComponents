// Web Components Spec
// ===================
// see https://html.spec.whatwg.org/multipage/custom-elements.html
// and https://html.spec.whatwg.org/multipage/custom-elements.html#customelementregistry
//
// Web Components Articles
// =======================
// Good Overview article:		https://blog.usejournal.com/web-components-will-replace-your-frontend-framework-3b17a580831c
// Google recommendations:	https://developers.google.com/web/fundamentals/web-components/best-practices
// Bugs/shortcomings:				https://dev.to/webpadawan/beyond-the-polyfills-how-web-components-affect-us-today-3j0a
//
//	Web Components registration API
//	===============================
//	window.customElements.define(name, constructor)
//	window.customElements.define(name, constructor, { extends: baseLocalName })
//	window.customElements.whenDefined(name)
//	window.customElements.get(name)
//	window.customElements.upgrade(root)
//
//	Web Components lifecycle callbacks
//	==================================
//	connectedCallback()					called when added to DOM
//	disconnectedCallback()			called when removed from DOM
//	adoptedCallback()						called when moved to new document
//	attributeChangedCallback()	called when observed attributes change
//
//	static get observedAttributes()		returns string array of observed attributes

import { Router, IComponent } from './Router.js';
import TemplateParser from './TemplateParser.js';
import { log } from './Logger.js';

export default class BaseComponent extends HTMLElement
{
	// static properties (get/set)

	// Note that TypeScript is unable to reference derived class static members from the base class without some casting, so
	// you need to do this:
	//	(this.constructor as any).MyStaticProperty (accesses derived class copy, not base class copy)
	//
	//	see https://github.com/Microsoft/TypeScript/issues/3841
	//	and possible workaround: https://github.com/Microsoft/TypeScript/issues/3841#issuecomment-337560146

	// see https://github.com/microsoft/TypeScript/issues/5863
	// ES6 proposal has been added: link???

	// static fields
	//private static routerInitialised: boolean = false;

	// html tag name
	//protected static _tagName: string = "BaseComponent (not used)";
	protected static tag: string = "BaseComponent (not used)";
	public get TagName(): string {
		return (this.constructor as any).tag;
	}
	//public set TagName(value: string) {
	//	(this.constructor as any).tag = value;
	//}

	// template html
	protected static _templateHtml: string = "not used";
	public get TemplateHtml(): string {
		return (this.constructor as any)._templateHtml;
	}
	public set TemplateHtml(value: string) {
		(this.constructor as any)._templateHtml = value;
	}

	// non-static properties
	protected _shadRoot: Nullable<ShadowRoot> = null;
	public get ShadRoot(): Nullable<ShadowRoot> { return this._shadRoot }
	public set ShadRoot(value) { this._shadRoot = value }

	// router (singleton)
	public static router: Router = new Router();
	//protected router!: Router;

	// ctor
	constructor(/*tagName: string*/) {
		super();	// call HTMLElement ctor
		log.func(`${this.constructor.name} ctor() called`);

		// this.ShadRoot is initialised to null and remains that way until template has been loaded and attached to DOM
		//this.ShadRoot = null;

		let component: IComponent = { htmlElement: 'main', instance: this, slug: 'home' };
		BaseComponent.router.addComponent(component);

		let parser: TemplateParser  = new TemplateParser(this);
		parser.cloneAndAttachTemplate(false);
	}

	//public getFunctionByNameKey<K extends keyof this>(key: K): EventListener {
	//	return this[key] as unknown as EventListener;
	//}

	public getFunctionByName(funcName: string): EventListener {
		let funcKey = funcName as keyof this;
		return this[funcKey] as unknown as EventListener;
	}

	public GetPropValue(propName: string): this[keyof this] {
		let propKey = propName as keyof this;
		if (!(propKey in this)) {
			log.error(`HTML Template Error: Property/field '${propKey}' does not exist in component ${this.constructor.name}`);
			//return '<no such prop/field';
		}
		let propValue = this[propKey];
		return propValue;
	}

	GetShadowElement<T extends HTMLElement>(id: string): Nullable<T> {
		// when we initialise @PropOut properties, the static initialisation calls SetElementContent() -> GetShadowElement() before the ctor has created the shadow DOM
		let shad = this.shadowRoot;
		if (shad == null) {
			log.error('GetShadowElement(): this.shadowRoot is null');
			return null;
		}

		let el = shad.querySelector<T>(`#${id}`);
		if (el == null) {
			log.error(`GetShadowElement(): element with id ${id} not found`);
			return null;
		}

		return el;
	}

	public SetElementContent(propName: keyof this) {
		if (this.ShadRoot == null) {
			log.warn("SetElementContent(): ShadRoot is null, ignoring call");
			return;
		}

		let elName = `wcf-${propName}`;
		let elValue: string = String(this[propName]);

		let el = this.GetShadowElement<HTMLElement>(elName);
		if (el == null)
			log.error(`SetElementContent(): Could not find element ${elName} inside component ${this.constructor.name}`);
		else
			el.innerHTML = elValue;
	}

	// DOM element loaded event
	protected async connectedCallback() {
		log.event(`${this.constructor.name}.connectedCallback() called`);

		// if this component has already been initialised, then do nothing
		if (this.ShadRoot != null) {
			log.info(`Component ${this.TagName} is already initialised, exiting connectedCallback`);
			return;
		}

		if (!customElements.whenDefined(this.TagName)) {
			log.error(`${this.TagName} is not [yet?] registered, have you called customElements.define('${this.TagName}', '${this.constructor.name}') in the app.ts file?`);
			return;
		}

		// connectedCallback and all descendents must be awaited otherwise intialisation/binding will fail
		log.info(`Component ${this.TagName} NOT initialised, awaiting html template load...`);
		let parser: TemplateParser = new TemplateParser(this);
		await parser.loadAndParseTemplate();

		// call addEventListener for every event in html
	}

	// DOM element unloaded event
	protected async disconnectedCallback() {
		// call removeEventListener for every event in html
		log.event(`${this.constructor.name}.disconnectedCallback() called`);
	}

	//setProp<K extends keyof this>(propName: K, propValue: this[K]) {
	//	this[propName] = propValue;
	//}

	//getProp<K extends keyof this>(propName: K): this[K] {
	//	return this[propName];
	//}

	protected async attributeChangedCallback(
		custAttrName: keyof this,
		oldVal: this[keyof this],
		newVal: this[keyof this])
	{
		log.event(`attributeChangedCallback(): Attribute name : ${custAttrName}, old value: ${oldVal}, new value: ${newVal}`);
	}

	// not currently used by this class
	protected async adoptedCallback() {
		log.event(`{this.constructor.name}.adoptedCallback(): called`);
		log.error('Unxpected call to BaseComponent.adoptedCallback()');
	}

	public loadComponent(htmlTag: string, targetElement: string, slug: string, setState: boolean = true) {
		BaseComponent.router.loadComponent(htmlTag, targetElement, slug, setState);
	}

}
