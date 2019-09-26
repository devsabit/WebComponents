import HtmlPage from './WebComponents/HtmlPage/HtmlPage.js';
;
export default class Router {
    constructor() {
        this.routes = [
            { slug: '/', component: HtmlPage, url: 'http://www.nurofen.plus.com/home.json' },
            { slug: '/*', component: HtmlPage, url: 'http://www.nurofen.plus.com/*.json' }
        ];
        window.addEventListener('popstate', this.popstateChanged);
    }
    popstateChanged(ev) {
        let slug = history.state;
        console.log(slug);
        console.log(ev);
        console.log(this.routes[0]);
    }
    Forwards() {
    }
    Backwards() {
    }
}
//# sourceMappingURL=Router.js.map