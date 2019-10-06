import BaseComponent from './BaseComponent.js';

export default class TemplateParser
{
	constructor(private component: BaseComponent) {
	}

	private AddEventHandler(id: string, eventName: string, code: string) {
		// find the html element to attach the handler to
		let el = this.component.GetShadowElement<HTMLElement>(id);
		if (el == null) {
			alert(`BaseComponent.AddEventHandler(): HTML element ${id} was not found within component ${this.component.TagName}`);
			return;
		}

		// check to see if code specifies a function name
		// see https://stackoverflow.com/questions/2008279/validate-a-javascript-function-name
		let regexFunctionName = RegExp(/^[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*$/);
		if (regexFunctionName.test(code)) {
			// JavaScript method name specified, use this as event handler
			//let existingUserFn = this.component.getFunctionByName(code as keyof this);
			let existingUserFn = this.component.getFunctionByName(code);
			el.addEventListener(eventName, existingUserFn.bind(this.component));
		}
		else {
			// not a JS function name, create anonymous handler and add specified code
			let newAnonFn = new Function("event", code);
			el.addEventListener(eventName, newAnonFn.bind(this.component));
		}
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
		//
		// Note matchAll not offically available until 2020, but allegedly can be polyfilled by TypeScript:
		//	https://stackoverflow.com/questions/55499555/property-matchall-does-not-exist-on-type-string

		// substitute all {{property}} items for <span id="wcf-property"> elements to allow one-way binding from Typescript properties to html elements
		//let interpolateHtml = htmlTemplate.replace(/{{\w+}}/gm, (key: string/*, value: any*/): string => {
		let interpolateHtml = htmlTemplate.replace(/{{[A-Za-z0-9_-]+}}/gm, (key: string/*, value: any*/): string => {
			let propName: string = key.substring(2, key.length - 2);

			// for custom attributes that are kebab-cased, change '-' to '_' so it will match with backing field
			//if (propName.indexOf('-') >= 0)
			propName = propName.replace(/-/g, '_');

			//let propValue = this.GetPropValue(propName);
			let propValue = this.component.GetPropValue(propName);
			let spanString = `<span id="wcf-${propName}">${propValue}</span>`;
			return spanString;
		});

		// perform one-time substitution of all [[property]] items with current property value
		interpolateHtml = interpolateHtml.replace(/\[\[[A-Za-z0-9_-]+\]\]/gm, (key: string/*, value: any*/): string => {
			let propName: string = key.substring(2, key.length - 2);

			// for custom attributes that are kebab-cased, change '-' to '_' so it will match with backing field
			//if (propName.indexOf('-') >= 0)
			propName = propName.replace(/-/g, '_');

			let propValue = this.component.GetPropValue(propName);
			let staticSub = `${propValue}`;
			return staticSub;
		});

		console.log(interpolateHtml);
		return interpolateHtml;
	}

	// load html template from server and then clone and attach
	public async loadTemplate() {
		let tagName: string = this.component.TagName;
		let templateFilename = `/WebComponents/${tagName}/${tagName}.html`;
		templateFilename = templateFilename.replace(/-/gm, '');	// remove kebab casing

		// get html template file
		let response = await fetch(templateFilename);
		if (response == null) {
			alert(`Cannot load template with id ${tagName} in ${templateFilename}`);
			return;
		}
		let html = await response.text();
		this.component.TemplateHtml = this.AddDataBinding(html);

		// insert modified html fragment into current html document
		let head = document.querySelector<HTMLHeadElement>('head');
		if (head == null) {
			alert('<head> element not found in doc, aborting');
			return;
		}
		head.insertAdjacentHTML('beforeend', this.component.TemplateHtml);

		// now add template to doc
		this.cloneAndAttachTemplate(true);
	}

	// clone and attach to previously loaded html template (will silently fail if template not found, then retry when DOM element is loaded)
	public cloneAndAttachTemplate(showErrors: boolean) {
		const templateName = `#${this.component.TagName}`;
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
		this.component.ShadRoot = this.component.attachShadow({ mode: 'open' });
		this.component.ShadRoot.appendChild(templateContent.cloneNode(true));
		console.log(`HTML template has been attached for ${this.component.TagName}`);

		// now that DOM node has been added, parse and add event handlers
		this.ParseAndAttachEvents(template.innerHTML);
	}

	// allow component templates to call "this.loadTemplate(...)" and simply pass through to router
	public loadComponent(htmlTag: string, targetElement: string, slug: string, setState: boolean = true) {
		BaseComponent.router.loadComponent(htmlTag, targetElement, slug, setState);
	}

}
