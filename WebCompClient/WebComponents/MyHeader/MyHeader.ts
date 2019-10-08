import BaseComponent from '../BaseComponent/BaseComponent.js';
import { Attrib } from '../BaseComponent/PropDecorator.js';
//import { log } from '../BaseComponent/Logger.js';

export default class MyHeader extends BaseComponent {

	public static tag = 'my-header';

	// web component observed attributes
	static get observedAttributes() {
		return ['title', 'my-cust-attrib'];
	}

	// props
	@Attrib public title!: string;
	@Attrib public my_cust_attrib!: string;

	// ctor
	constructor() {
		super();
	}
}
customElements.define(MyHeader.tag, MyHeader);