﻿import BaseComponent from '../BaseComponent/BaseComponent.js';

export default class MyFooter extends BaseComponent {
	copyright: string = `(c) Widget Ltd ${new Date().getFullYear()}`;
	constructor() {
		super('my-footer');
	}
}
