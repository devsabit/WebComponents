import BaseComponent from './BaseComponent.js';
import { log, assert } from '../BaseComponent/Logger.js';

interface Ies6StringTemplate {
	staticStrings: ReadonlyArray<string>,
	templateValues: ReadonlyArray<string>,
}

export default class TemplateParser
{
	// fields and props
	private eventCount: number = 1;
	private inputCountMap = new Map<string, number>();

	constructor(private component: BaseComponent) {
	}

	private isFunctionName(code: string): boolean {
		// check to see if code specifies a function name
		// see https://stackoverflow.com/questions/2008279/validate-a-javascript-function-name
		let regexFunctionName = RegExp(/^[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*$/);
		return regexFunctionName.test(code);
	}

	private AddEventHandler(attribName: string, eventName: string, code: string) {
		// find the html element to attach the handler to
		//let el = this.component.GetShadowElementById<HTMLElement>(id);
		let els = this.component.getShadowElementsByAttribName(attribName);
		if (els.length == undefined) {
			log.error(`BaseComponent.AddEventHandler(): HTML element with attrib ${attribName} was not found within component ${this.component.TagName}`);
			return;
		}
		assert(els.length == 1);
		let el = els[0];

		// check to see if code specifies a function name
		if (this.isFunctionName(code)) {
			// JavaScript method name specified, use this as event handler
			let existingUserFn = this.component.getFunctionByName(code);
			el.addEventListener(eventName, existingUserFn.bind(this.component));
		}
		else {
			// not a JS function name, create anonymous handler and add specified code
			//let componentName = this.component.constructor.name;
			let logCode = `console.log('@' + event.type); console.log('Anon handler fired for ${this.component.constructor.name}');`;
			let newAnonFn = new Function("event", `${logCode} ${code}`) as EventListener;
			el.addEventListener(eventName, newAnonFn.bind(this.component));
		}
	}

	private getDataAttrib(element: string): string {
		// find data-wc?- attribute on element and return
		// <input> element will have a data-wci- prefix
		// other elements with events will have a data-wce- prefix
		let dataAttrib = element.match(/data-wc.-\w+/);
		assert(dataAttrib != null);
		return dataAttrib[0];
	}

	private parseEventsInElement(element: string) {
		//
		// input element format:
		//	<input type="number" value="[[a]]" name="a" @change="..." @click="...">

		const dataAttrib = this.getDataAttrib(element);

		let events: string[] = this.getEventsInElement(element);
		for (let event of events)
		{
			let eventName = this.getAttribName(event.slice(1));	// gets click from @click="this.count++"
			let code = this.getAttribValue(event);							// gets this.count++ from @click="this.count++"

			this.AddEventHandler(dataAttrib, eventName, code);
		}
	}

	private ParseAndAttachEvents(htmlTemplate: string) {
		// parse for @EventName event handlers
		htmlTemplate.replace(/<.+@.+>/gm, (key: string/*, value: any*/): string => {
			this.parseEventsInElement(key);
			return '';	// not interested in result
		});
	}

	private getAttribValue(attribNameValue: string): string {
		// extracts value from name="value" string
		let value = attribNameValue.match(/"[^"]*"/);
		assert(value != null);
		return value[0].slice(1, -1);	// remove quotes from match

		//let quote1 = attribNameValue.indexOf('"');
		//let quote2 = attribNameValue.lastIndexOf('"');
		//if (quote1 < 0 || quote2 < 0) {
		//	log.error(`Can't find both escaping double quotes for attribute ${attribNameValue} in component ${this.component.TagName}`);
		//	return '<error - not found>';
		//}

		//let attribValue = attribNameValue.substring(quote1 + 1, quote2);
		//return attribValue;
	}

	private getAttribName(attribNameValue: string): string {
		// extracts name from name="value" string
		let name = attribNameValue.match(/[^=]+=/);
		assert(name != null);
		return name[0].slice(0, -1);	// remove trailing = sign
	}

	private ParseInput(inputElement: string): string {
		log.info(`Parsing <input> element: ${inputElement}`);
		let names = this.getNameAttribs(inputElement);
		if (names.length !== 1)
			return inputElement;	// give up, errors will be reported by getNameAttribs()

		// append data attribute data-wci-{prop}n to input field
		let name = this.getAttribValue(names[0]) as keyof BaseComponent;	// convert from name="age" to: age
		let dataAttrib = this.component.getDataAttribWci(name);						// convert to input data attribute: data-wci-age

		// if we have radio buttons, multiple input fields will exist with the same name attribute, so need to give different data-wci- values
		let inputFieldCount: number|undefined = this.inputCountMap.get(dataAttrib);
		if (inputFieldCount == undefined)
			inputFieldCount = 1;
		let countString = (inputFieldCount === 1) ? '' : inputFieldCount.toString();
		this.inputCountMap.set(dataAttrib, ++inputFieldCount);

		// if we have duplicate name fields, append number to 2nd+ occurrences
		let dataAttribName = `${dataAttrib}${countString}`;
		return inputElement.slice(0, -1) + ` ${dataAttribName}>`;							// append to input element
	}

	private parseInputElements(htmlTemplate: string): string {
		// parse <input ...> elements and add id elements where required (requires non-greedy match, i.e. stop after first '>')
		let result = htmlTemplate.replace(/<input[^>]+>/gm, (key: string): string => this.ParseInput(key));
		return result;
	}

	private ParseTemplate(templateElement: string): string {
		log.info(`Parsing <template> element: ${templateElement}`);

		// append data attribute data-wci-{prop}n to input field
		let dataAttribName = this.component.getDataAttribWct();	// convert to input data attribute: data-wct-xxx-xxxx

		return templateElement.slice(0, -1) + ` ${dataAttribName}>`;							// append to input element
	}

	private parseTemplateElement(htmlTemplate: string): string {
		// parse <template> elements and add data-wct-... id attribute
		let result = htmlTemplate.replace(/<template>/gm, (key: string): string => this.ParseTemplate(key));
		return result;
	}

	private getEventsInElement(element: string) : string[]
	{
		// returns array of events in format @event="handling code or function name"
		let eventsFounds = element.match(/@[a-z]+[^=]*=[^"]*"[^"]+"/g);
		assert(eventsFounds != null);	// only elements with events get passed in
		return eventsFounds;
	}

	private ParseOther(element: string): string {
		// skip <input> and <template> elements, they have already been processed by parseInputElements() and parseTemplateElements()
		if (element.toLowerCase().startsWith('<input') || element.toLowerCase().startsWith('<template'))
			return element;

		log.info(`Parsing non-input element: ${element}`);

		// append data attribute data-wce-{event name}{eventCount} to field
		let firstEvent = this.getEventsInElement(element)[0];
		let eventName = this.getAttribName(firstEvent.slice(1));
		let dataAttrib = this.component.getDataAttribWce(eventName as keyof BaseComponent);
		let eventDataAttrib = `${dataAttrib}${this.eventCount++}`;
		return element.slice(0, -1) + ` ${eventDataAttrib}>`;		// append to input element
	}

	private parseOtherElements(htmlTemplate: string): string {
		// parse <xxx ...> elements and add data-wce-xxx attrib to any element with @<event> specified
		let result = htmlTemplate.replace(/<[^>]+@[^>]+>/gm, (key: string): string => {
			return this.ParseOther(key);
		});

		return result;
	}

	private deKebab(kebab: string): string {
		return kebab.replace(/-/g, '_');
	}

	private removeHandlebars(propWithHandlerbars: string): string {
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
			// [1]	`<span data-wco-${propName}>${propValue}</span>`;
			// [2]	`${propValue}`
			let propName: string = this.removeHandlebars(key);
			let dataAttrib: string = this.component.getDataAttribWco(propName as keyof BaseComponent);
			let propValue: string = this.component.GetPropValue(propName) as string;
			let actualValues: string[] = [];

			// replace es6 template placeholder with real value
			let hasPropName: boolean = es6Template.templateValues.indexOf('{propName}') >= 0;
			if (hasPropName)
				actualValues.push(propName);

			// replace es6 template placeholder with real value
			let hasDataAttrib: boolean = es6Template.templateValues.indexOf('{dataAttrib}') >= 0;
			if (hasDataAttrib)
				actualValues.push(dataAttrib);

			// replace es6 template placeholder with real value
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
		//let propName = '{propName}';
		let dataAttrib = '{dataAttrib}';
		let propValue = '{propValue}';

		let htmlOut = this.parseHandlerbar(htmlIn, /{{[A-Za-z0-9_.-]+}}/gm, this.parseEs6Template`<span ${dataAttrib}>${propValue}</span>`);

		return htmlOut;
	}

	private replaceOneTimeHandlerbars(htmlIn: string): string {
		let propValue = '{propValue}';
		let htmlOut = this.parseHandlerbar(htmlIn, /\[\[[A-Za-z0-9_.-]+\]\]/gm, this.parseEs6Template`${propValue}`);
		return htmlOut;
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	//private runTests() {
	//	let propName = '{propName}';
	//	let propValue = '{propValue}';
	//	let es6Template = this.parseEs6Template`<span id="wco-${propName}">${propValue}</span>`;

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

		// replace {{field}} with <span data-wco-<fieldName>${this.field}</span>
		parsedHtml = this.replaceOneWayHandlerbars(parsedHtml);

		// substitute all {{property}} items for <span id="wco-property"> elements to allow one-way binding from Typescript properties to html elements
		//interpolateHtml = interpolateHtml.replace(/{{[A-Za-z0-9_-]+}}/gm, (key: string/*, value: any*/): string => {
		//	let propName: string = key.substring(2, key.length - 2);

		//	// for custom attributes that are kebab-cased, change '-' to '_' so it will match with backing field
		//	propName = propName.replace(/-/g, '_');

		//	let propValue = this.component.GetPropValue(propName);
		//	let spanString = `<span id="wco-${propName}">${propValue}</span>`;
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

		// parse <template> elements and add unnique data-wct-... attribute
		parsedHtml = this.parseTemplateElement(parsedHtml);

		// parse <input> elments and add data-wci-... attribs to all inputs
		parsedHtml = this.parseInputElements(parsedHtml);

		// parse all other elements and add data-wci-... attribs to any elements with event(s)
		parsedHtml = this.parseOtherElements(parsedHtml);

		log.info(`Template parsing completed for component ${this.component.TagName}:`);
		log.template(parsedHtml);
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
		//const templateName = `#${this.component.TagName}`;
		const templateName = `[${this.component.getDataAttribWct()}]`;
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
		this.component.ShadRoot.appendChild(templateContent.cloneNode(true));
		log.info(`HTML template has been attached for ${this.component.TagName}`);

		// now that DOM node has been added, parse and add event handlers
		this.ParseAndAttachEvents(template.innerHTML);
	}

	private getNameAttribs(htmlEl: string): string[] {
		// Nulish coalescing requires TypeScript 3.7
		let names: string[] = htmlEl.match(/name="[^"]+"/g) ?? [];
		log.debug(`Found ${names.length} name attributes in element ${htmlEl}`);
		if (names.length === 0)
			log.error(`HTML template parsing error in component ${this.component.TagName}. Missing name attribute in ${htmlEl}`);
		if (names.length > 1)
			log.error(`HTML template parsing error in component ${this.component.TagName}. Duplicate name attribute(s) specified in ${htmlEl}`);

		return names;
	}

	//private getIdAttribs(inputEl: string): string[] {
	//	// Nulish coalescing requires TypeScript 3.7
	//	return inputEl.match(/id="[^"]+"/g) ?? [];
	//}

}
