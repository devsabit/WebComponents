import BaseComponent from '../BaseComponent/BaseComponent.js';
import ObjectProxy from '../BaseComponent/ObjectProxy.js';
import ArrayProxy from '../BaseComponent/ArrayProxy.js';
import { Component, Output } from '../BaseComponent/Decorators.js';
import { log } from '../BaseComponent/Logger.js';

class Person {
	public constructor() { };
	public forename: string = 'Geoff';
	public surname: string = 'Wode';
}

@Component('my-content')
export default class MyContent extends BaseComponent {
	@Output public x: number = 7;
	@Output() public y: number = 11;
	@Output('total', 'mult') public a: number = 3;	// total and mult have dependencies on a
	@Output('total', 'mult') public b: number = 5;	// total and mult have dependencies on b
	@Output public c: string = '';
	@Output() public d: string = 'hello';

	// computed properties
	public get total(): number { return this.a + this.b	}
	public get mult(): number { return this.a * this.b }
	public readonly pi: number = Math.PI;

	// dealing with output that has many dependencies
	deps1 = class DependenciesInt {
		constructor(private parent: MyContent) {
		}

		public get sum(): number { return this.parent.a + this.parent.b }
		public get mult(): number { return this.parent.a * this.parent.b }
		public get div(): number { return this.parent.a / this.parent.b }
	}

	//public deps1: Constructor<DependenciesInt>;
	//@Output public deps2: DependenciesExt = new DependenciesExt();
	//@Output public deps3: DependenciesNamespace = new DependenciesNamespace();

	constructor() {
		super();

		let array = new Array<string>();
		array.push('Geoff');
		array.push('Wode');
		array.push('rules!');

		let proxy1 = new ArrayProxy<string>(array);
		//let proxy2 = ArrayProxy.createProxyFrom(String);

		let item: string | undefined;

		//let newLen: number;
		//newLen = proxy1.push('Wode');
		//log.info(`newLen=${newLen}`);

		//newLen = proxy1.push('rules!');
		//log.info(`newLen=${newLen}`);

		//item = proxy1.pop();
		//log.info(`item=${item}`);

		//newLen = proxy1.unshift('unshift 1');
		//log.info(`newLen=${newLen}`);

		//newLen = proxy1.push('Pushed');
		//log.info(`newLen=${newLen}`);

		//item = 'item 0';
		//proxy1[0] = item;	// fails with symbol?? idx
		item = proxy1[0];
		log.info(`proxy1[0]=${item}`);

		//item = proxy1[0];
		//log.info(`item=${item}`);

		//newLen = proxy1.unshift('unshift 2');
		//log.info(`newLen=${newLen}`);

		log.highlight(proxy1.join(','));

		//let proxy2 = new MyProxy<Array<string>>(array);
		//proxy2.push('Geoff 2');
		//proxy2.push('Wode 2');
		//proxy2.push('rules 2!');
		//log.highlight(proxy2.join(','));

		//let array2 = new Array<string>();
		//console.log(`person=${array2}`);
		type StringArray = Array<string>;
		let x: StringArray = new Array<string>();
		console.log(x);
		let proxy = ObjectProxy.createProxyFrom(Person);
		console.log(`proxy=${proxy}`);

		proxy.forename = 'Geoff 2';
		proxy.surname = 'Wode 2';
		console.log('proxy.forename = ${proxy.forename}');
		console.log('proxy.surname = ${proxy.surname}');

		let n: number = 2;
		console.log(`typeof n = ${typeof n}`);

		let b: boolean = true;
		console.log(`typeof b = ${typeof b}`);

		let s: string = 'hello';
		console.log(`typeof s = ${typeof s}`);

		let c: Person = new Person();
		console.log(`typeof c = ${typeof c}`);

		let a: Array<string> = ['array'];
		console.log(`typeof a = ${typeof a}`);
	}

	protected async connectedCallback() {
		log.event('sub: MyContent.connectedCallback() called');

		// add events after html template has been loaded
		await super.connectedCallback();	// wait till DOM has finished initialising

		let slug = BaseComponent.Router.Slug;
		let requiredRoute = BaseComponent.Router.findRoute(slug);
		if (requiredRoute.tag !== this.TagName) /*|| requiredRoute.slug |= BaseComponent.Router.Slug)*/
		{
			log.info('Wrong route loaded by static index.html - trying to reload correct route:');
			log.debug(requiredRoute);
			// wrong component loaded, so fire off reload
			BaseComponent.Router.loadComponent(requiredRoute, false);
		}

		log.info('sub: MyContent.connectedCallback() base class completed (allegedly)');
	}

	public increaseA(ev: Event) {
		let el: HTMLInputElement = ev.currentTarget as HTMLInputElement;
		log.event(`MyContent.increaseA() fired ${el}`);
		this.a = el.valueAsNumber;
	}

	public increaseB(ev: Event) {
		let el: HTMLInputElement = ev.currentTarget as HTMLInputElement;
		log.event(`MyContent.increaseB() fired ${el}`);
		this.b = el.valueAsNumber;
	}

	public onTotalChanged() {
		// call this when A or B changes and total also needs to be updated
	}
}

//class DependenciesExt extends MyContent {
//	constructor() {
//		super();
//	}

//	public get sum(): number { return this.a + this.b }
//	public get mult(): number { return this.a * this.b }
//	public get div(): number { return this.a / this.b }
//}

//export declare namespace MyContent {
//	export class DependenciesNamespace {
//		constructor(private parent: MyContent) { }

//		public get sum(): number { return this.parent.a + this.parent.b }
//		public get mult(): number { return this.parent.a * this.parent.b }
//		public get div(): number { return this.parent.a / this.parent.b }
//	}
//}
