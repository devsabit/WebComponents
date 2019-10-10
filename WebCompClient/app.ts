import { log } from './WebComponents/BaseComponent/Logger.js';

async function checkComponentRegistered(tag: string) {
	let ctor = await customElements.get(tag);
	if (ctor == undefined)
		log.error(`Component registration failed for '${tag}'`);
	else {
		log.info(`Component registration succeeded for '${tag}':`);
		log.debug(ctor);
	}
}

import MyHeader from './WebComponents/MyHeader/MyHeader.js'
checkComponentRegistered(MyHeader.tag);

import MyFooter from './WebComponents/MyFooter/MyFooter.js';
checkComponentRegistered(MyFooter.tag);

import MyAside from './WebComponents/MyAside/MyAside.js';
checkComponentRegistered(MyAside.tag);

import MyContent from './WebComponents/MyContent/MyContent.js';
checkComponentRegistered(MyContent.tag);

import HtmlPage from './WebComponents/HtmlPage/HtmlPage.js';
checkComponentRegistered(HtmlPage.tag);

import MyCounter from './WebComponents/MyCounter/MyCounter.js';
checkComponentRegistered(MyCounter.tag);

import PersonForm from './WebComponents/PersonForm/PersonForm.js';
checkComponentRegistered(PersonForm.tag);

import MyTime from './WebComponents/MyTime/MyTime.js';
checkComponentRegistered(MyTime.tag);
