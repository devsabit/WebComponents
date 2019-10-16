//import { log } from './Logger.js';

//class MyProxyHandler<T extends object> implements ProxyHandler<T> {

//	constructor() {
//		log.highlight(`ArrayProxyHandler.ctor() called`);
//	}

//	// get?(target: T, p: PropertyKey, receiver: any): any;
//	public get(target: T, prop: keyof T, _receiver: any): any {
//		//log.highlight(`ArrayProxyHandler.get called: target=${target}, prop=${String(prop)}, receiver=${receiver}`);
//		const targetVal = target[prop];
//		if (typeof targetVal === 'function') {
//			// some method of Array class
//			if (['push', 'unshift'].includes(prop as string)) {
//				return function (el: any) {
//					let fn = Array.prototype[prop as any];
//					log.highlight(`ArrayProxy.apply called: el=${el}, target=${target}, target[${prop}] = ${fn}`);
//					fn.apply(target, arguments);
//				}
//			}
//			return targetVal.bind(target);
//		}

//		//// not a method, muust be field
//		//return targetVal;
//	}

//	// set?(target: T, p: PropertyKey, value: any, receiver: any): boolean;
//	public set(target: T, prop: PropertyKey, value: any, receiver: any): boolean {
//		log.highlight(`ArrayProxyHandler.set called: target=${target}, prop=${String(prop)}, ${value}, ${receiver}`);
//		return true;
//	}

//	//apply?(target: T, thisArg: any, argArray?: any): any;
//	public apply(target: T, thisArg: any, args: any) {
//		log.highlight(`ArrayProxyHandler.apply called: target=${target}, thisArg=${thisArg}, args = ${args}`);
//		//Array.prototype[thisArg].apply(target, args);
//	}
//}

//function extendT<T extends { new(): T }>(ctor: new() => T): T {
//	// Create a new derived class from the component class
//	class DerivedComponent extends (<new () => any>ctor) {
//		constructor() {
//			super();
//		}
//	}
//	return <T><any>DerivedComponent;
//}

//export default class MyProxy<T> {
//	constructor(object: T) {
//		//log.highlight(`ArrayProxy<T> ctor() called, _array is ${JSON.stringify(object)}`);
//		let c = extendT<T>(object);
//		let proxy = new Proxy<T>(object, new MyProxyHandler<T>());
//		return proxy;
//	};
//}
