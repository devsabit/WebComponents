import BaseComponent from '../BaseComponent.js';

export default class MyCounter extends BaseComponent {

	private _count: number = 1;
	public get count() { return this._count; }
	public set count(value) {
		this._count = value;
		super.SetElementContent("count");
	}

	constructor() {
		super('my-counter');
	}

	protected async connectedCallback() {
		await super.connectedCallback();
	}
}
