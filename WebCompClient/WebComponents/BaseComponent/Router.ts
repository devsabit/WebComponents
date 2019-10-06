import BaseComponent from './BaseComponent.js';

//interface IRoute { slug: string, component: typeof BaseComponent, url: string };

interface IPushState {
	htmlTag: string,
	targetElement: string,
	url: string
}

export interface IComponent {
	//htmlTag: string;				// component tag (key)
	htmlElement: string;			// DOM element
	instance: BaseComponent;	// class ref
	url: string;							// url
}

export class Router {

	// fields
	private _components: Map<string, IComponent> = new Map<string, IComponent>();

	//private routes: IRoute[];

	// props

	// ctor
	constructor() {
		//this.routes = [
		//	{ slug: '/', component: HtmlPage, url: 'http://www.nurofen.plus.com/home.json' },
		//	{ slug: '/*', component: HtmlPage, url: 'http://www.nurofen.plus.com/*.json' }
		//];

		// one url event handler for all components
		window.addEventListener('locationchange', this.onUrlChanged.bind(this));
		window.addEventListener('popstate', this.onPopstate.bind(this));
		window.addEventListener('pushstate', this.onPushstate.bind(this));
		console.log("Router initialised");
	}

	public addComponent(component: IComponent) {
		// store component info in map so we can retrieve it later
		let tagName: string = component.instance.TagName;
		console.log(`Looking for existing html component '${tagName}'`);
		let existingComponent = this._components.get(tagName);
		if (existingComponent == null) {
			console.log(`Html component ${tagName} not found, adding to hash map`);
			this._components.set(tagName, component);
		}
		else {
			// this shouldn't happen for current use cases
			let msg = `Html component ${tagName} already exists`;
			console.error(msg);
			alert(msg);
			return;
		}
	}

	// load specified web component into target html tag and set slug to specfied value
	public loadComponent(htmlTag: string, targetElement: string, slug: string, setState: boolean = true) {
		console.log(`Attempting to load component ${htmlTag} into element <${targetElement}> and then set url to /${slug}`);

		// see if this component has already been created
		let componentToInsert: BaseComponent;
		let existingComponent = this._components.get(htmlTag);
		if (existingComponent == null) {
			// not found, create new instance of component
			let componentClass = window.customElements.get(htmlTag);
			if (componentClass === undefined) {
				let msg = `Component '${htmlTag}' not found. Check component is registered with customElements.define(...) in app.ts`;
				console.error(msg);
				alert(msg);
				return;
			}
			console.log(`Creating new component '${componentClass.constructor.name}'`);
			componentToInsert = new componentClass(htmlTag);
		}
		else {
			// already exists, re-use old component
			console.log(`Found existing component ${htmlTag}`);
			componentToInsert = existingComponent.instance;
		}

		// get ref to target HTML element container
		let parent = document.querySelector<HTMLElement>(targetElement);
		if (parent == null) {
			alert(`loadComponent(): Could not find element ${targetElement} in current document`);
			return;
		}

		let componentToReplace = parent.firstChild;
		if (componentToReplace == null) {
			alert(`Element ${targetElement} has no child element to replace`);
			return;
		}

		// update DOM with correct component
		parent.replaceChild(componentToInsert, componentToReplace);

		// handle url changed events (don't do this if user clicked Back/Forwards buttons)
		if (setState) {
			let pushState: IPushState = { htmlTag: htmlTag, targetElement: targetElement, url: slug };
			console.log(`Calling history.pushstate(${JSON.stringify(pushState)})`);
			history.pushState(pushState, 'title', `/${slug}`);
		}
	}

	//
	// url changed events
	//

	// Back/Forwards browser buttons
	protected onPopstate(ev: PopStateEvent) {
		let ps: IPushState = ev.state;
		if (ps == null) {
			console.warn('onPopstate(), pushstate is null');
			return;
		}
		console.log(`Popstate event fired: ${JSON.stringify(ps)}`);
		this.loadComponent(ps.htmlTag, ps.targetElement, ps.url, false);	// false = don't push state using history API
	}

	// this only detects user changing url in browser???
	protected onUrlChanged(ev: Event) {
		alert('url changed');
		console.log(ev);
	}

	// Note - not triggered by calling history.pushState()
	protected onPushstate(ev: Event) {
		alert('pushstate changed');
		console.log(ev);
	}

}