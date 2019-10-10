import BaseComponent from '../BaseComponent/BaseComponent.js';
import { PropOut } from '../BaseComponent/PropDecorator.js';
//import { log } from '../BaseComponent/Logger.js';

export default class MyCounter extends BaseComponent {
	public static tag = 'my-counter';

	@PropOut public count: number = 345;

	constructor() {
		super();
	}
}
customElements.define(MyCounter.tag, MyCounter);
