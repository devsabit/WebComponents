import BaseComponent from '../BaseComponent.js';
import { PropOut } from '../PropDecorator.js';

export default class MyContent extends BaseComponent {

	//private _a: number = 1;
	//get a(): number { return this._a; }
	//set a(value: number) {
	//	this._a = Number(value);					// force numeric (for dynamic JS)
	//	super.SetElementContent("a");			// update html
	//	super.SetElementContent("total");	// update html
	//}
	@PropOut
	public a: number = 1;

	//private _b: number = 2;
	//get b() { return this._b; }
	//set b(value: number) {
	//	this._b = Number(value);					// force numeric (for dynamic JS)
	//	super.SetElementContent("b");			// update html
	//	super.SetElementContent("total");	// update html
	//}
	@PropOut
	public b: number = 2;

	public get total(): number { return this.a + this.b; }

	//private _proxy: Proxy;

	public updateTotal() {

	}

	constructor() {
		super('my-content');

		// revocable<T extends object>(target: T, handler: ProxyHandler<T>)

		//let target = { age: this.a };

		//let handler = {
		//	get: (obj: this, prop: keyof this) => obj[prop],
		//	set: (obj: this, prop: keyof this, value: any) => obj[prop] = value
		//}

		//const proxy = new Proxy(target, handler);
		//proxy.age = 120;

		//const proxy2 = new Proxy(this.a, {
		//	get: (obj: this, prop: keyof this) => obj[prop],
		//	set: (obj: this, prop: keyof this, value: this[keyof this]) =>
		//	{
		//		obj[prop] = value
		//	}
		//});

		//proxy2.x = 2;
	}

	protected async connectedCallback() {
		// note this may be called multiple times by DOM
		console.log('sub: MyContent.connectedCallback() called');

		// add events after html template has been loaded
		await super.connectedCallback();	// wait till DOM has finished initialising

		console.log('sub: MyContent.connectedCallback() base class completed (allegedly)');
	}

	public increaseA(ev: Event) {
		let el: HTMLInputElement = ev.currentTarget as HTMLInputElement;
		this.a = el.valueAsNumber;
		console.log(`increaseA(): ${el}`);
	}

	public increaseB(ev: Event) {
		let el: HTMLInputElement = ev.currentTarget as HTMLInputElement;
		this.b = el.valueAsNumber;
		console.log(`increaseA: ${el}`);
	}

}
