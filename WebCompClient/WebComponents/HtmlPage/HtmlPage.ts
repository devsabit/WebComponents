import BaseComponent from '../BaseComponent.js';

export default class HtmlPage extends BaseComponent {

	public pageName: string = '';
	public pageContent: string = '';

	constructor() {
		super('html-page');
	}

	protected async connectedCallback() {
		// note this will be called every time this component is inserted/reinserted into the DOM
		console.log('sub: HtmlPage.connectedCallback() called');

		// call base class and wait till complete
		await super.connectedCallback();

		// load page html here
		let url = window.location.href;
		let lastSlash = url.lastIndexOf('/');

		// update component props/fields
		this.pageName = url.substr(lastSlash + 1);
		let response = await fetch(`/WebComponents/TestData/${this.pageName}.html`);
		this.pageContent = await response.text();

		// update component html
		this.SetElementContent('pageName');
		this.SetElementContent('pageContent');

		console.log('sub: HtmlPage.connectedCallback() base class completed');
	}
}
