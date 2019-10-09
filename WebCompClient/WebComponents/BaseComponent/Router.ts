import BaseComponent from './BaseComponent.js';
import { log, assert } from '../BaseComponent/Logger.js';

interface IPushState {
	htmlTag: string,
	targetElement: string,
	url: string
}

export interface IComponent {
	//htmlTag: string;				// component tag (key)
	htmlElement: string;			// DOM element
	instance: BaseComponent;	// class ref
	slug: string;							// url
}

//interface IRoute {
//	slug: string,							// key
//	component: string,
//	url: string
//};

export class Router {

	// fields
	public defaultTag = '';
	public defaultDiv = '';

	private _components: Map<string, IComponent> = new Map<string, IComponent>();
	//private routes: Map<string, IComponent> = new Map<string, IComponent>();

	//private routes: IComponent[];

	// props

	// ctor
	constructor() {
		//		this._components.set('html-page', 

		this.defaultTag = 'html-page';
		this.defaultDiv = 'main';
		assert(this.defaultTag != undefined);		// demo of TS 3.7 assertion function

		//this.routes[] = [
		//	{ tag: 'my-content', div: 'main', slug: '/' },
		//	{ tag: 'html-page', div: 'main', slug: 'news' },
		//	{ tag: 'html-page', div: 'main', slug: 'contact' },
		//	{ tag: 'html-page', div: 'main', slug: 'about' },
		//	{ tag: 'my-counter', div: 'main', slug: 'counter' },
		//	{ tag: 'person-form', div: 'main', slug: 'input' }
		//];

		// one url event handler for all components
		window.addEventListener('locationchange', this.onUrlChanged.bind(this));
		window.addEventListener('popstate', this.onPopstate.bind(this));
		window.addEventListener('pushstate', this.onPushstate.bind(this));
		log.info("Router initialised");
	}

	public addComponent(component: IComponent) {
		// store component info in map so we can retrieve it later
		let tagName: string = component.instance.TagName;
		log.info(`Looking for existing html component '${tagName}'`);
		let existingComponent = this._components.get(tagName);
		if (existingComponent == null) {
			log.info(`Html component ${tagName} not found, adding to hash map`);
			this._components.set(tagName, component);
		}
		else {
			// this shouldn't happen for current use cases
			log.error(`Html component ${tagName} already exists`);
			return;
		}
	}

	// load specified web component into target html tag and set slug to specfied value
	public loadComponent(htmlTag: string, targetElement: string, slug: string, setState: boolean = true) {
		log.info(`Attempting to load component ${htmlTag} into element <${targetElement}> and then set url to /${slug}`);

		// see if this component has already been created
		let componentToInsert: BaseComponent;
		let existingComponent = this._components.get(htmlTag);
		if (existingComponent == null) {
			// not found, create new instance of component
			let componentClass = window.customElements.get(htmlTag);
			if (componentClass === undefined) {
				log.error(`${htmlTag} is not [yet?] registered, have you called customElements.define('${htmlTag}', <class name>) in the app.ts file?`);
				return;
			}
			log.info(`Creating new component '${componentClass.constructor.name}'`);
			componentToInsert = new componentClass(htmlTag);
		}
		else {
			// already exists, re-use old component
			log.info(`Found existing component ${htmlTag}`);
			componentToInsert = existingComponent.instance;
		}

		// get ref to target HTML element container
		let parent = document.querySelector<HTMLElement>(targetElement);
		if (parent == null) {
			log.error(`loadComponent(): Could not find element ${targetElement} in current document`);
			return;
		}

		let componentToReplace = parent.firstChild;
		if (componentToReplace == null) {
			log.error(`Element ${targetElement} has no child element to replace`);
			return;
		}

		// update DOM with correct component
		parent.replaceChild(componentToInsert, componentToReplace);

		// handle url changed events (don't do this if user clicked Back/Forwards buttons)
		if (setState) {
			let pushState: IPushState = { htmlTag: htmlTag, targetElement: targetElement, url: slug };
			log.info(`Calling history.pushstate(${JSON.stringify(pushState)})`);
			history.pushState(pushState, 'title', `/${slug}`);
		}
	}

	//
	// url changed events
	//

	// Back/Forwards browser buttons
	protected onPopstate(ev: PopStateEvent) {
		log.event('Router.onPopstate() called');

		let ps: IPushState = ev.state;
		if (ps == null) {
			log.warn('onPopstate(), pushstate is null, cannot go backwards any further');
			return;
		}
		log.debug(ps);

		this.loadComponent(ps.htmlTag, ps.targetElement, ps.url, false);	// false = don't push state using history API
	}

	// this only detects user changing url in browser???
	protected onUrlChanged(ev: Event) {
		log.event('Router.onUrlChanged() called');
		log.debug(ev);
		log.error('unexpected');
	}

	// Note - not triggered by calling history.pushState()
	protected onPushstate(ev: Event) {
		log.event('Router.onPushstate() called');
		log.debug(ev);
		log.error('unexpected call to onPushstate()');
	}

}