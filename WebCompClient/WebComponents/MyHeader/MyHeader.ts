import BaseComponent from '../BaseComponent/BaseComponent.js';
import { Component, Attrib } from '../BaseComponent/Decorators.js';
//import { log } from '../BaseComponent/Logger.js';

@Component('my-header')
export default class MyHeader extends BaseComponent {

	// web component observed attributes (added automatically by @Attrib to MyHeader._observedAttributes[])
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
