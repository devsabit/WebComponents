import { log } from './Logger.js';
//
// for defs of ProxyHandler<T>, Proxy & ProxyConstructor, see the following:
// https://github.com/microsoft/TypeScript/blob/master/lib/lib.es2015.proxy.d.ts
//
class ProxyHandler<T extends object> implements ProxyHandler<T> {

	constructor() {
		log.highlight(`ArrayProxy.ProxyHandler.ctor() called`);
	}

	public get(targetObj: T, prop: keyof T, _receiver: any): any {
		//log.highlight(`ArrayProxyHandler.get called: target=${target}, prop=${String(prop)}, receiver=${receiver}`);
		const targetVal = targetObj[prop];
		if (typeof targetVal === 'function') {
			switch (prop) {
				case 'push':		// newLen: number = push(item: T...);
				case 'unshift':	// newLen: number = unshift(item: T...);
					return function (item: T) {
						let fn = Array.prototype[prop as any] as Function;
						let newLen: number = fn.apply(targetObj, arguments);
						log.highlight(`ArrayProxy.ProxyHandler.${prop} called: item=${item}, newLen=${newLen}`);
						return newLen;
					}

				case 'pop':		// item: T = pop();
				case 'shift': // item: T = shift();
					return function () {
						let fn = Array.prototype[prop as any] as Function;
						let item = fn.apply(targetObj, arguments);
						log.highlight(`ArrayProxy.ProxyHandler.${prop} called: item=${item}`);
						return item;
					}

				default:
					// pass other functions through to Array<T>
					log.highlight(`ArrayProxy.ProxyHandler.${prop} called`);
					return targetVal.bind(targetObj);
			}
		}

		// not a method, muust be field/property, so return value
		log.highlight(`ArrayProxy.ProxyHandler.get = ${targetVal}`);
		return targetVal;
	}

	public set(targetObj: T, prop: keyof T, value: any, _receiver: any): boolean {
		const targetVal = targetObj[prop];
		if (typeof targetVal !== 'function') {
			log.highlight(`ArrayProxy.ProxyHandler.set() target=${targetObj}, prop=${prop}, ${value}`);
			targetObj[prop] = value;
			return true;
		}

		// not sure why this would happen
		log.error(`ArrayProxy.ProxyHandler.set(): Unexpected targetVal type, typeof targetVal=${typeof targetVal}`);
		return false;
	}

	public apply(target: T, thisArg: any, args?: any) {
		log.info(`ArrayProxy.ProxyHandler.apply() called: target=${target}, thisArg=${thisArg}, args = ${args}`);
		log.error(`ArrayProxy.ProxyHandler.apply() called unexpectedly (not used currently)`);
	}
}

export default class ArrayProxy<T> extends Array<T> {

	constructor(array: Array<T>) {
		super();
		log.highlight(`ArrayProxy<T> ctor() called, _array is ${JSON.stringify(array)}`);
		let proxy = new Proxy<Array<T>>(array, new ProxyHandler<Array<T>>());
		return proxy;
	};

	//public static createProxyFrom<T>(ctor: Constructor<Array<T>>) {
	//	let target = new ctor();
	//	let proxy = new Proxy<Array<T>>(target, new ProxyHandler<Array<T>>());
	//	return proxy;
	//}
}
