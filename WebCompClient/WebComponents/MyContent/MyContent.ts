import BaseComponent from '../BaseComponent/BaseComponent.js';
import { Component, PropOut3 } from '../BaseComponent/PropDecorator.js';
import { log } from '../BaseComponent/Logger.js';

@Component('my-content')
export default class MyContent extends BaseComponent {

	@PropOut3 public x: number = 7;
	@PropOut3() public y: number = 11;
	@PropOut3('total', 'mult') public a: number = 3;
	@PropOut3('total', 'mult') public b: number = 5;

	// computed properties
	public get total(): number { return this.a + this.b	}
	public get mult(): number { return this.a * this.b }
	public readonly pi: number = Math.PI;

	constructor() {
		super();
	}

	protected async connectedCallback() {
		log.event('sub: MyContent.connectedCallback() called');

		// add events after html template has been loaded
		await super.connectedCallback();	// wait till DOM has finished initialising

		let slug = BaseComponent.Router.Slug;
		let requiredRoute = BaseComponent.Router.findRoute(slug);
		if (requiredRoute.tag !== this.TagName) /*|| requiredRoute.slug |= BaseComponent.Router.Slug)*/
		{
			log.highlight('Wrong route loaded by static index.html - trying to reload correct route:');
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
