import BaseComponent from '../BaseComponent/BaseComponent.js';
import { log } from '../BaseComponent/Logger.js';

export default class HtmlPage extends BaseComponent {

	public static tag = 'html-page';
	public pageName: string = '';
	public pageContent: string = '';

	constructor() {
		super();
	}

	protected async connectedCallback() {
		// note this will be called every time this component is inserted/reinserted into the DOM
		log.info('sub: HtmlPage.connectedCallback() called');

		// call base class and wait till complete
		await super.connectedCallback();

		// get slug from url & update component props/fields
		let url = window.location.href;
		let lastSlash = url.lastIndexOf('/');
		this.pageName = url.substr(lastSlash + 1);
		let response = await fetch(`/WebComponents/TestData/${this.pageName}.html`);
		this.pageContent = await response.text();

		// update component html
		this.SetElementContent('pageName');
		this.SetElementContent('pageContent');

		log.info('sub: HtmlPage.connectedCallback() base class completed');
	}
}
customElements.define(HtmlPage.tag, HtmlPage);
