import BaseComponent from '../BaseComponent/BaseComponent.js';
import { Attrib } from '../BaseComponent/PropDecorator.js';

export default class MyHeader extends BaseComponent {

	// web component observed attributes
	static get observedAttributes() {
		return ['title', 'my-cust-attrib'];
	}

	// props
	@Attrib public title!: string;
	@Attrib public my_cust_attrib!: string;

	// ctor
	constructor() {
		super('my-header');
	}
}
