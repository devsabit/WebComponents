import BaseComponent from '../BaseComponent.js';

export default class Alert extends BaseComponent {

	public title: string = '';
	public content: string = '';

	constructor() {
		super('oo-alert');
	}

	protected async connectedCallback() {
		// note this will be called every time this component is inserted/reinserted into the DOM
		console.log('sub: Alert.connectedCallback() called');

		// call base class and wait till complete
		await super.connectedCallback();

		// init component data
		//this.page = ???;

		// update component html
		this.SetElementContent('title');
		this.SetElementContent('content');

		console.log('sub: Alert.connectedCallback() completed');
	}
}
