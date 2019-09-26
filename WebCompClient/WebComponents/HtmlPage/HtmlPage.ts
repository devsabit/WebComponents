import BaseComponent from '../BaseComponent.js';

export default class HtmlPage extends BaseComponent {

	constructor() {
		super('html-page');
	}

	protected async connectedCallback() {
		// note this may be called multiple times by DOM
		console.log('sub: HtmlPage.connectedCallback() called');

		// add events after html template has been loaded
		await super.connectedCallback();	// wait till DOM has finished initialising

		console.log('sub: HtmlPage.connectedCallback() base class completed (allegedly)');
	}
}
