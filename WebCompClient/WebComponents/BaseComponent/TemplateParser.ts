import BaseComponent from './BaseComponent.js';
import { log } from '../BaseComponent/Logger.js';

interface Ies6StringTemplate {
	staticStrings: ReadonlyArray<string>,
	templateValues: ReadonlyArray<string>,
}

export default class TemplateParser
{
	constructor(private component: BaseComponent) {
	}

	private isFunctionName(code: string): boolean {
		// check to see if code specifies a function name
		// see https://stackoverflow.com/questions/2008279/validate-a-javascript-function-name
		let regexFunctionName = RegExp(/^[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*$/);
		return regexFunctionName.test(code);
	}

	private AddEventHandler(id: string, eventName: string, code: string) {
		// find the html element to attach the handler to
		let el = this.component.GetShadowElement<HTMLElement>(id);
		if (el == null) {
			log.error(`BaseComponent.AddEventHandler(): HTML element ${id} was not found within component ${this.component.TagName}`);
			return;
		}

		// check to see if code specifies a function name
		if (this.isFunctionName(code)) {
			// JavaScript method name specified, use this as event handler
			let existingUserFn = this.component.getFunctionByName(code);
			el.addEventListener(eventName, existingUserFn.bind(this.component));
		}
		else {
			// not a JS function name, create anonymous handler and add specified code
			let componentName = this.component.constructor.name;
			//let newAnonFn = new Function("event", `log.event('@${event} anon handler fired (${componentName})'); ${code}`);
			let newAnonFn = new Function("event", `console.log('@${event} anon handler fired (${componentName})'); ${code}`);
			el.addEventListener(eventName, newAnonFn.bind(this.component));
		}
	}

	private ParseEvent(element: string) {
		//
		// input element format:
		//	<input type="number" value="[[a]]" id="input-a" @change="this.a = el.value">
		//
		// event handler format:
		//	<... @...="..." >
		//
		let idEnd = 0;
		let idStart = element.indexOf('id=') + 4;
		if (idStart != -1) {
			idEnd = element.indexOf('"', idStart);
		}
		let eventStart = element.indexOf('@') + 1;
		let eventEnd = element.indexOf('"', eventStart) - 1;

		let codeStart = eventEnd + 2;
		let codeEnd = element.indexOf('"', codeStart);

		let id: string = element.substring(idStart, idEnd);
		let event: string = element.substring(eventStart, eventEnd);
		let code: string = element.substring(codeStart, codeEnd);

		this.AddEventHandler(id, event, code);
	}

	private ParseAndAttachEvents(htmlTemplate: string) {
		// parse for @EventName event handlers
		htmlTemplate.replace(/<.+@.+>/gm, (key: string/*, value: any*/): string => {
			this.ParseEvent(key);
			return '';	// not interested in result
		});
	}

	private getAttribValue(attribNameValue: string): string {
		// extracts value from name="value" string
		let quote1 = attribNameValue.indexOf('"');
		let quote2 = attribNameValue.lastIndexOf('"');
		if (quote1 < 0 || quote2 < 0) {
			log.error(`Can't find both escaping double quotes for attribute ${attribNameValue} in component ${this.component.TagName}`);
			return '<error - not found>';
		}

		let attribValue = attribNameValue.substring(quote1 + 1, quote2);
		return attribValue;
	}

	private ParseInput(inputElement: string): string {
		log.info(`Parsing <input> element: ${inputElement}`);
		let names = this.getNameAttribs(inputElement);
		log.debug(`Found ${names.length} name attributes`);
		if (names.length === 0) {
			log.error(`HTML template parsing error in component ${this.component.TagName}. Missing name attribute in ${inputElement}`);
			return inputElement;	// give up
		}
		if (names.length > 1) {
			log.error(`HTML template parsing error in component ${this.component.TagName}. Duplicate name attribute(s) specified in ${inputElement}`);
			return inputElement;	// give up
		}

		let ids = this.getIdAttribs(inputElement);
		log.debug(`Found ${ids.length} ids attributes`);

		if (ids.length > 1) {
			log.error(`HTML template parsing error in component ${this.component.TagName}. Duplicate id attribute(s) specified in ${inputElement}`);
			return inputElement;	// give up
		}

		// should have exactly 1 name attrib and 0 or 1 id attribs
		if (ids.length === 0) {
			let id = `id="wci-${this.getAttribValue(names[0])}"`;	// generate id from name
			log.info(`Automatically appending ${id} to following <input> element:`);
			log.debug(inputElement);
			return inputElement.slice(0, -1) + ` ${id}>`;
		}

		// return untouched (already has name + id specified)
		return inputElement;
	}

	private parseInputElements(htmlTemplate: string): string {
		// parse <input ...> elements and add id elements where required (requires non-greedy match, i.e. stop after first '>')
		let result = htmlTemplate.replace(/<input[^>]+>/gm, (key: string): string => {
			return this.ParseInput(key);
		});

		return result;
	}

	private deKebab(kebab: string): string {
		return kebab.replace(/-/g, '_');
	}

	private extractPropName(propWithHandlerbars: string): string {
		let propName = propWithHandlerbars.slice(2, -2);
		propName = this.deKebab(propName);
		return propName;
	}

	private parseEs6Template(staticStrings: ReadonlyArray<string>, ...templateValues: ReadonlyArray<any>): Ies6StringTemplate {
		return { staticStrings, templateValues };
	}

	//private fmt(
	//	res: string,
	//	_curr: string,
	//	i: number) {
	//	log.debug(`res=${res}, this.templateValues[i-1]=${this.templateValues[i - 1]}, this.staticStrings[i]=${this.staticStrings[i]}`);
	//	return res + this.templateValues[i-1] + this.staticStrings[i];
	//}

	// note for n variable there there are (n + 1) static strings n values
	private formatEs6Template(staticStrings: ReadonlyArray<string>, templateValues: ReadonlyArray<any>) {
		return staticStrings.reduce((result: string, _, i: number) => result + templateValues[i-1] + staticStrings[i]);
	}

	private parseHandlerbar(htmlIn: string, regexTarget: RegExp, es6Template: Ies6StringTemplate) {
		let htmlOut = htmlIn.replace(regexTarget, (key: string): string =>
		{
			// [1]	`<span id="wcf-${propName}">${propValue}</span>`;
			// [2]	`${propValue}`
			let propName: string = this.extractPropName(key);
			let propValue: string = this.component.GetPropValue(propName) as string;
			let actualValues: string[] = [];

			// replace placeholder with real value
			let hasPropName: boolean = es6Template.templateValues.indexOf('{propName}') >= 0;
			if (hasPropName)
				actualValues.push(propName);

			// replace placeholder with real value
			let hasPropValue: boolean = es6Template.templateValues.indexOf('{propValue}') >= 0;
			if (hasPropValue)
				actualValues.push(propValue);

			let spanString = this.formatEs6Template(es6Template.staticStrings, actualValues);
			return spanString;
		});

		return htmlOut;
	}

	private stripComments(htmlIn: string): string {
		let htmlOut = htmlIn.replace(/<!--[\s\S]*?-->/g, '');
		return htmlOut;
	}

	private replaceOneWayHandlerbars(htmlIn: string): string {
		let propName = '{propName}';
		let propValue = '{propValue}';
		let htmlOut = this.parseHandlerbar(htmlIn, /{{[A-Za-z0-9_-]+}}/gm, this.parseEs6Template`<span id="wcf-${propName}">${propValue}</span>`);
		return htmlOut;
	}

	private replaceOneTimeHandlerbars(htmlIn: string): string {
		let propValue = '{propValue}';
		let htmlOut = this.parseHandlerbar(htmlIn, /\[\[[A-Za-z0-9_-]+\]\]/gm, this.parseEs6Template`${propValue}`);
		return htmlOut;
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	//private runTests() {
	//	let propName = '{propName}';
	//	let propValue = '{propValue}';
	//	let es6Template = this.parseEs6Template`<span id="wcf-${propName}">${propValue}</span>`;

	//	propName = 'copyright';
	//	propValue = '(c) 2019 Acme Ltd';

	//	// replace placeholder with real value
	//	let actualValues: string[] = [];
	//	let hasPropName: boolean = es6Template.templateValues.indexOf('{propName}') >= 0;
	//	if (hasPropName)
	//		actualValues.push(propName);

	//	// replace placeholder with real value
	//	let hasPropValue: boolean = es6Template.templateValues.indexOf('{propValue}') >= 0;
	//	if (hasPropValue)
	//		actualValues.push(propValue);

	//	let spanString = this.formatEs6Template(es6Template.staticStrings, actualValues);
	//	log.highlight(spanString);
	//}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	private parseHtmlTemplate(htmlTemplate: string): string {
		//
		// Note matchAll not offically available until 2020, but allegedly can be polyfilled by TypeScript:
		//	https://stackoverflow.com/questions/55499555/property-matchall-does-not-exist-on-type-string

		//this.runTests();

		// first strip any html comments from template
		let parsedHtml = this.stripComments(htmlTemplate);

		// replace [[field]] with ${this.field}
		parsedHtml = this.replaceOneTimeHandlerbars(parsedHtml);

		// replace {{field}} with <span id="wcf-<fieldName">${this.field}}</span>
		parsedHtml = this.replaceOneWayHandlerbars(parsedHtml);

		// substitute all {{property}} items for <span id="wcf-property"> elements to allow one-way binding from Typescript properties to html elements
		//interpolateHtml = interpolateHtml.replace(/{{[A-Za-z0-9_-]+}}/gm, (key: string/*, value: any*/): string => {
		//	let propName: string = key.substring(2, key.length - 2);

		//	// for custom attributes that are kebab-cased, change '-' to '_' so it will match with backing field
		//	propName = propName.replace(/-/g, '_');

		//	let propValue = this.component.GetPropValue(propName);
		//	let spanString = `<span id="wcf-${propName}">${propValue}</span>`;
		//	return spanString;
		//});

		// perform one-time substitution of all [[property]] items with current property value
		//interpolateHtml = interpolateHtml.replace(/\[\[[A-Za-z0-9_-]+\]\]/gm, (key: string/*, value: any*/): string => {
		//	let propName: string = key.substring(2, key.length - 2);

		//	// for custom attributes that are kebab-cased, change '-' to '_' so it will match with backing field
		//	propName = propName.replace(/-/g, '_');

		//	let propValue = this.component.GetPropValue(propName);
		//	let staticSub = `${propValue}`;
		//	return staticSub;
		//});

		// parse <input> elments and add id attribs where necessary
		parsedHtml = this.parseInputElements(parsedHtml);

		log.info(`Template parsing completed for component ${this.component.TagName}:`);
		log.debug(parsedHtml);
		return parsedHtml;
	}

	private async loadHtmlTemplate(): Promise<string> {
		let tagName: string = this.component.TagName;
		let templateFilename = `/WebComponents/${tagName}/${tagName}.html`;
		templateFilename = templateFilename.replace(/-/gm, '');	// remove kebab casing

		// get html template file
		let response = await fetch(templateFilename);
		if (response == null) {
			return log.error(`Cannot load template with id ${tagName} in ${templateFilename}`);
		}

		let html = await response.text();
		return html;
	}

	private insertTemplateIntoDocument(templateHtml: string): boolean {
		// insert modified html fragment into current html document
		let head = document.querySelector<HTMLHeadElement>('head');
		if (head == null) {
			log.error('<head> element not found in doc, aborting');
			return false;
		}
		head.insertAdjacentHTML('beforeend', templateHtml);
		return true;
	}

	// load html template from server and then clone and attach
	public async loadAndParseTemplate() {
		let html = await this.loadHtmlTemplate();
		let parsedTemplate = this.parseHtmlTemplate(html);
		this.insertTemplateIntoDocument(parsedTemplate);
		this.component.TemplateHtml = parsedTemplate;

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
				log.error("ERROR:" + errMsg)
			else
				log.info("Deferring component creation to connectedCallback(): " + errMsg);
			return;
		}

		// at this point the template has been loaded and found in current document, so we create a new shadow node and attach a cloned copy of the template
		const templateContent = template.content;
		this.component.ShadRoot = this.component.attachShadow({ mode: 'open' });
		this.component.ShadRoot.appendChild(templateContent.cloneNode(true));
		log.info(`HTML template has been attached for ${this.component.TagName}`);

		// now that DOM node has been added, parse and add event handlers
		this.ParseAndAttachEvents(template.innerHTML);
	}

	private getNameAttribs(inputEl: string): string[] {
		// Nulish coalescing requires TypeScript 3.7
		return inputEl.match(/name="[^"]+"/g) ?? [];
	}

	private getIdAttribs(inputEl: string): string[] {
		// Nulish coalescing requires TypeScript 3.7
		return inputEl.match(/id="[^"]+"/g) ?? [];
	}

}
