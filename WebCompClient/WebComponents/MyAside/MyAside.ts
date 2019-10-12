import BaseComponent from '../BaseComponent/BaseComponent.js';
import { Component } from '../BaseComponent/PropDecorator.js';
//import { log } from '../BaseComponent/Logger.js';

@Component('my-aside')
export default class MyAside extends BaseComponent {
	constructor() {
		super();
	}
}
