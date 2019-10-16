import BaseComponent from '../BaseComponent/BaseComponent.js';
import { Component } from '../BaseComponent/Decorators.js';
import { log } from '../BaseComponent/Logger.js';
import '../MyTime/MyTime.js';	// use unnamed import to ensure MyTime loaded

@Component('html-page')
export default class HtmlPage extends BaseComponent {
	public PageName: string = '';
	public PageContent: string = '';

	constructor() {
		super();
	}

	protected async connectedCallback() {

		// note this will be called every time this component is inserted/reinserted into the DOM
		log.event('sub: HtmlPage.connectedCallback() called');

		// call base class and wait till complete
		await super.connectedCallback();

		// get slug & update component props/fields
		const slug = BaseComponent.Router.Slug;
		log.debug(`Router.Slug is '${slug}'`);
		this.PageName = slug;

		let response = await fetch(`/WebComponents/TestData/${this.PageName}.html`);
		this.PageContent = await response.text();

		// update component html
		this.SetElementContent('PageName');
		this.SetElementContent('PageContent');

		log.info('sub: HtmlPage.connectedCallback() base class completed');
	}
}
