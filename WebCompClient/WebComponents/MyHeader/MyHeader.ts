import BaseComponent from '../BaseComponent/BaseComponent.js';
import { Component, Attrib } from '../BaseComponent/PropDecorator.js';
//import { log } from '../BaseComponent/Logger.js';

@Component('my-header')
export default class MyHeader extends BaseComponent {
	//public static tag = 'my-header';
	//public static _observedAttributes: string[] = ['title', 'my_cust_attrib'];

	// web component observed attributes (added automatically by @Attrib to BaseComponent)
	//static get observedAttributes() {
	//	return ['title', 'my-cust-attrib'];
	//}

	// props
	@Attrib public title!: string;
	@Attrib public my_cust_attrib!: string;

	// ctor
	constructor() {
		super();
	}
}
customElements.define(MyHeader.tag, MyHeader);
