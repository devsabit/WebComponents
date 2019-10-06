import BaseComponent from '../BaseComponent/BaseComponent.js';
import { PropOut } from '../BaseComponent/PropDecorator.js';

export default class MyCounter extends BaseComponent {

	//private _count: number = 1;
	//public get count() { return this._count; }
	//public set count(value) {
	//	this._count = value;
	//	super.SetElementContent("count");
	//}

	@PropOut
	public count: number = 123;

	constructor() {
		super('my-counter');
	}

	protected async connectedCallback() {
		await super.connectedCallback();
	}
}
