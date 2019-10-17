import { log } from './Logger.js';

class ProxyHandler<T extends object> implements ProxyHandler<T> {

	// get?(target: T, p: PropertyKey, receiver: any): any;
	public get(targetObj: T, prop: keyof T, _receiver: any): any {
		const targetVal = targetObj[prop];
		if (typeof targetVal === 'function') {
			switch (prop) {
				//case 'someFunction':		// newLen: number = push(item: T...);
				//	return function (item: T) {
				//		let fn = Array.prototype[prop as any] as Function;
				//		let newLen: number = fn.apply(targetObj, arguments);
				//		log.highlight(`ArrayProxy.ProxyHandler.${prop} called: item=${item}, newLen=${newLen}`);
				//		return newLen;
				//	}

				default:
					// pass other functions through to Array<T>
					log.highlight(`ObjectProxy.ProxyHandler.${prop} called`);
					return targetVal.bind(targetObj);
			}
		}

		// not a method, muust be field/property, so return value
		log.highlight(`ObjectProxy.ProxyHandler.get = ${targetVal}`);
		return targetVal;
	}

	// set?(target: T, p: PropertyKey, value: any, receiver: any): boolean;
	public set(targetObj: T, prop: keyof T, value: any, _receiver: any): boolean {
		log.highlight(`ObjectProxy.ProxyHandler.set called: target=${targetObj}, prop=${String(prop)}, ${value}`);
		targetObj[prop] = value;
		return true;
	}
}

//function extendT<T extends { new(): T }>(ctor: new() => T): T {
//	// Create a new derived class from the component class
//	class DerivedComponent extends (<new () => any>ctor) {
//		constructor() {
//			super();
//		}
//	}
//	return <T><any>DerivedComponent;
//}

//function GenericExtend<TBase extends Constructor2>(Base: TBase) {
//	return class extends Base {
//	};
//}

export default class ObjectProxy {
	private constructor() {};

	public static createProxyFrom<T extends {}>(ctor: Constructor<T>) {
		let target = new ctor();
		let proxy = new Proxy<T>(target, new ProxyHandler<T>());
		return proxy;
	}
}
