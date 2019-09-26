//
// see https://medium.com/@bryanmanuele/how-i-implemented-my-own-spa-routing-system-in-vanilla-js-49942e3c4573
//

import WebComponent from './BaseComponent.js';
import HtmlPage from './HtmlPage/HtmlPage.js';

interface IRoute { slug: string, component: typeof WebComponent, url: string };

export default class Router {

	// fields
	private routes: IRoute[];

	// props

	// ctor
	constructor() {
		this.routes = [
			{ slug: '/', component: HtmlPage, url: 'http://www.nurofen.plus.com/home.json' },
			{ slug: '/*', component: HtmlPage, url: 'http://www.nurofen.plus.com/*.json' }
		];

		window.addEventListener('popstate', this.popstateChanged);
	}

	// methods
	public popstateChanged(ev: Event) {
		// url has changed, do something
		let slug: string = history.state;
		console.log(slug);
		console.log(ev);
		console.log(this.routes[0]);
	}

	public Forwards() {
	}

	public Backwards() {
	}

}
