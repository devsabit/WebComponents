import BaseComponent from '../BaseComponent/BaseComponent.js';
//import { log } from '../BaseComponent/Logger.js';

export default class MyFooter extends BaseComponent {
	public static tag = 'my-footer';
	copyright: string = `(c) Widget Ltd ${new Date().getFullYear()}`;
	constructor() {
		super();
	}
}
customElements.define(MyFooter.tag, MyFooter);
