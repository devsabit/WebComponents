import BaseComponent from '../BaseComponent/BaseComponent.js';
import { Component } from '../BaseComponent/PropDecorator.js';
//import { log } from '../BaseComponent/Logger.js';

@Component('my-footer')
export default class MyFooter extends BaseComponent {
	copyright: string = `(c) Widget Ltd ${new Date().getFullYear()}`;
	constructor() {
		super();
	}
}
