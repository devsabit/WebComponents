import BaseComponent from '../BaseComponent/BaseComponent.js';
import { Component, Attrib, Output } from '../BaseComponent/Decorators.js';
//import { log } from '../BaseComponent/Logger.js';

// Example usage: <my-time format="utc"></my-time>
// Note that self-closing tags are not supported for web components: <my-time /> will **NOT** work

@Component('my-time')
export default class MyTime extends BaseComponent {

	// props
	@Attrib public readonly format!: string;	// set @Attrib properties to readonly to avoid accidental DOM updating
	@Output public time!: string;							// declares TS property called 'time' and binds it to {{time}} output field

	// ctor
	constructor() {
		super();
	}

	protected async connectedCallback() {
		await super.connectedCallback();

		let format = this.format; // take a copy of this, because it's a TypeScript property bound to a DOM attribute, not a TS property with a backing field
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
