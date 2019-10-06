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
	protected static _tagName: string = "not used";
	public get TagName(): string {
		return (this.constructor as any)._tagName;
	}
	public set TagName(value: string) {
		(this.constructor as any)._tagName = value;
	}

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

	// router
	public static router: Router = new Router();
	//protected router!: Router;

	// ctor
	constructor(tagName: string) {
		super();	// call HTMLElement ctor

		// add single global event to track url changes (can't move to after class def due to 'this' ref)
		//if (!BaseComponent.routerInitialised) {
		//	this.router = new Router();
		//	BaseComponent.routerInitialised = true;
		//}

		// log ctor call
		console.log(`${this.constructor.name} ctor() called`);

		// this.ShadRoot is initialised to null and remains that way until template has been loaded and attached to DOM
		//this.ShadRoot = null;

		// store html tag and attempt template attach, but defer template loading to connectedCallback() if it's not already loaded into document
		this.TagName = tagName;		// e.g. my-header

		let component: IComponent = { htmlElement: 'main', instance: this, url: 'home' };
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
			let msg = `HTML Template Error: Property/field '${propKey}' does not exist in component ${this.constructor.name}`;
			console.error(msg);
			alert(msg);
			//return '<no such prop/field';
		}
		let propValue = this[propKey];
		return propValue;
	}

	GetShadowElement<T extends HTMLElement>(id: string): Nullable<T> {
		// when we initialise @PropOut properties, the static initialisation calls SetElementContent() -> GetShadowElement() before the ctor has created the shadow DOM
		let shad = this.shadowRoot;
		if (shad == null) {
			alert('GetShadowElement(): this.shadowRoot is null')
			return null;
		}

		let el = shad.querySelector<T>(`#${id}`);
		if (el == null) {
			alert(`GetShadowElement(): element with id ${id} not found`);
			return null;
		}

		return el;
	}

	public SetElementContent(propName: keyof this) {
		if (this.ShadRoot == null) {
			console.warn("SetElementContent(): ShadRoot is null, ignoring call");
			return;
		}

		let elName = `wcf-${propName}`;
		let elValue: string = String(this[propName]);

		let el = this.GetShadowElement<HTMLElement>(elName);
		if (el == null)
			alert(`SetElementContent(): Could not find element ${elName} inside component ${this.constructor.name}`);
		else
			el.innerHTML = elValue;
	}

	// DOM element loaded event
	protected async connectedCallback() {
		console.log(`DOM event => ${this.constructor.name}.connectedCallback() called`);

		// if this component has already been initialised, then do nothing
		if (this.ShadRoot != null) {
			console.log(`Component ${this.TagName} is already initialised, exiting connectedCallback`);
			return;
		}

		if (!customElements.whenDefined(this.TagName)) {
			alert(`${this.TagName} is not [yet?] registered, have you called customElements.define('${this.TagName}', '${this.constructor.name}') in the app.ts file?`);
			return;
		}

		// connectedCallback and all descendents must be awaited otherwise intialisation/binding will fail
		console.log(`Component ${this.TagName} NOT initialised, awaiting html template load...`);
		let parser: TemplateParser = new TemplateParser(this);
		await parser.loadTemplate();

		// call addEventListener for every event in html
	}

	// DOM element unloaded event
	protected async disconnectedCallback() {
		// call removeEventListener for every event in html
		console.log(`DOM event => ${this.constructor.name}.disconnectedCallback() called`);
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
		let msg = `DOM event => attributeChangedCallback(): Attribute name : ${custAttrName}, old value: ${oldVal}, new value: ${newVal}`;
		console.log(msg);
	}

	// not currently used by this class
	protected async adoptedCallback() {
		let msg = `DOM event => {this.constructor.name}.adoptedCallback(): called`;
		console.log(msg);
		alert(msg);
	}

	public loadComponent(htmlTag: string, targetElement: string, slug: string, setState: boolean = true) {
		BaseComponent.router.loadComponent(htmlTag, targetElement, slug, setState);
	}

}
