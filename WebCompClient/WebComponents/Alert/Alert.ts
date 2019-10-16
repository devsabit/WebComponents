import BaseComponent from '../BaseComponent/BaseComponent.js';
import { Component } from '../BaseComponent/Decorators.js';
import { log } from '../BaseComponent/Logger.js';

@Component('my-alert')
export default class Alert extends BaseComponent {
	// [1] You can have parameters in your constructor if this component is created by your own TypeScript code
	// [2] You cannot use ctor parameters if it's created by the browser from static html, e.g:
	//	<my-alert title="My title" content="My content"></my-alert>
	//
	// If you choose the second option, you'll need to use custom attributes and map them with the @Attrib decorator.
	// See the MyTime component for an example of this
	constructor(public title: string, public content: string) {
		super();
	}

	protected async connectedCallback() {
		// note this will be called every time this component is inserted/reinserted into the DOM
		log.func('sub: Alert.connectedCallback() called');

		// call base class and wait till complete
		await super.connectedCallback();

		log.func('sub: Alert.connectedCallback() completed');
	}
}
