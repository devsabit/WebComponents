﻿import BaseComponent from '../BaseComponent/BaseComponent.js';
import { Attrib, PropOut } from '../BaseComponent/PropDecorator.js';
//import { log } from '../BaseComponent/Logger.js';

// Example usage: <my-time format="utc"></my-time>
// Note that self-closing tags are not supported for web components: <my-time /> will **NOT** work

export default class MyTime extends BaseComponent {
	public static tag = 'my-time';

	// props
	@Attrib public readonly format!: string;
	@PropOut public time!: string;

	// ctor
	constructor() {
		super();
	}

	protected async connectedCallback() {
		await super.connectedCallback();

		let format = this.format;
		let fmt = `(${format})`;
		if (format == undefined)	// if no format specified, default to local time
			format = 'local';

		switch (format) {
			case 'utc': this.time = new Date().toUTCString() + fmt;
				break;

			case 'local': this.time = new Date().toTimeString() + fmt;
				break;

			default:
				this.time = `Only format="utc" and format="local" are valid values for the my-time format attribute`;
		}
	}
}
customElements.define(MyTime.tag, MyTime);
