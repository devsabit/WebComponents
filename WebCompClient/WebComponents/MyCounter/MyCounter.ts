import BaseComponent from '../BaseComponent/BaseComponent.js';
import { Component, PropOut } from '../BaseComponent/PropDecorator.js';
//import { log } from '../BaseComponent/Logger.js';

@Component('my-counter')
export default class MyCounter extends BaseComponent {

	@PropOut public count: number = 345;

	constructor() {
		super();
	}
}
