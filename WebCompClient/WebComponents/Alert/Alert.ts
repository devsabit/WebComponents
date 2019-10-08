import BaseComponent from '../BaseComponent/BaseComponent.js';
import { log } from '../BaseComponent/Logger.js';

export default class Alert extends BaseComponent {

	public static tag = 'oo-alert';
	public title: string = '';
	public content: string = '';

	constructor() {
		super();
	}

	protected async connectedCallback() {
		// note this will be called every time this component is inserted/reinserted into the DOM
		log.func('sub: Alert.connectedCallback() called');

		// call base class and wait till complete
		await super.connectedCallback();

		// init component data
		//this.page = ???;

		// update component html
		this.SetElementContent('title');
		this.SetElementContent('content');

		log.func('sub: Alert.connectedCallback() completed');
	}
}
customElements.define(Alert.tag, Alert);
