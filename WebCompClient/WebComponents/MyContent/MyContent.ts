import BaseComponent from '../BaseComponent.js';

export default class MyContent extends BaseComponent {

	private _a: number = 1;
	get a(): number { return this._a; }
	set a(value: number) {
		this._a = Number(value);					// force numeric (for dynamic JS)
		super.SetElementContent("a");			// update html
		super.SetElementContent("total");	// update html
	}

	private _b: number = 2;
	get b() { return this._b; }
	set b(value: number) {
		this._b = Number(value);					// force numeric (for dynamic JS)
		super.SetElementContent("b");			// update html
		super.SetElementContent("total");	// update html
	}

	public get total(): number { return this.a + this.b; }

	constructor() {
		super('my-content');
	}

	protected async connectedCallback() {
		// note this may be called multiple times by DOM
		console.log('sub: MyContent.connectedCallback() called');

		// add events after html template has been loaded
		await super.connectedCallback();	// wait till DOM has finished initialising

		console.log('sub: MyContent.connectedCallback() base class completed (allegedly)');
	}
}
