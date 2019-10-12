import BaseComponent from './WebComponents/BaseComponent/BaseComponent.js';
import { log } from './WebComponents/BaseComponent/Logger.js';

//async function checkComponentRegistered_OLD(tag: string) {
//	let ctor = await customElements.get(tag);
//	if (ctor == undefined) {
//		log.error(`Component registration failed for '${tag}'`);
//		log.error(`You need to either decorate your component class with @Component('${tag}') or add call customElements.define('${tag}', 'YourComponentClassName');`)
//	}
//	else {
//		log.info(`Component registration succeeded for '${tag}':`);
//		log.debug(ctor);
//	}
//}

async function checkComponentRegistered<T extends BaseComponent>(classDesc: Constructor<T>) {
	let tag = (classDesc as any).tag;	// this field is added by decorator, so TypeScript can't see it
	let ctor = await customElements.get(tag);
	if (ctor == undefined) {
		log.error(`Component registration failed for '${tag}'`);
		log.error(`You need to either decorate your component class with @Component('${tag}') or add call customElements.define('${tag}', '${classDesc.name}');`)
	}
	else {
		log.info(`Component registration succeeded for '${tag}':`);
		log.debug(ctor);
	}
}

import MyHeader from './WebComponents/MyHeader/MyHeader.js'
checkComponentRegistered(MyHeader);

import MyFooter from './WebComponents/MyFooter/MyFooter.js';
checkComponentRegistered(MyFooter);

import MyAside from './WebComponents/MyAside/MyAside.js';
checkComponentRegistered(MyAside);

import MyContent from './WebComponents/MyContent/MyContent.js';
checkComponentRegistered(MyContent);

import HtmlPage from './WebComponents/HtmlPage/HtmlPage.js';
checkComponentRegistered(HtmlPage);

import MyCounter from './WebComponents/MyCounter/MyCounter.js';
checkComponentRegistered(MyCounter);

import PersonForm from './WebComponents/PersonForm/PersonForm.js';
checkComponentRegistered(PersonForm);

import MyTime from './WebComponents/MyTime/MyTime.js';
checkComponentRegistered(MyTime);
