import BaseComponent from '../BaseComponent/BaseComponent.js';
//import { log } from '../BaseComponent/Logger.js';

export default class MyAside extends BaseComponent {
	public static tag = 'my-aside';
	constructor() {
		super();
	}
}
customElements.define(MyAside.tag, MyAside);
