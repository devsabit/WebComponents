import { log } from './Logger.js';

class ProxyHandler<T extends object> implements ProxyHandler<T> {

	constructor() {
		log.highlight(`ArrayProxyHandler.ctor() called`);
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
						log.highlight(`ArrayProxy.${prop} called: item=${item}, newLen=${newLen}`);
						return newLen;
					}

				case 'pop':		// item: T = pop();
				case 'shift': // item: T = shift();
					return function () {
						let fn = Array.prototype[prop as any] as Function;
						let item = fn.apply(targetObj, arguments);
						log.highlight(`ArrayProxy.${prop} called: item=${item}`);
						return item;
					}

				default:
					// pass other functions through to Array<T>
					log.highlight(`ArrayProxy.${prop} called`);
					return targetVal.bind(targetObj);
			}
		}

		// not a method, muust be field/property, so return value
		log.highlight(`ArrayProxy.get = ${targetVal}`);
		return targetVal;
	}

	public set(targetObj: T, prop: keyof T, value: any, _receiver: any): boolean {
		const targetVal = targetObj[prop];
		if (typeof targetVal !== 'function') {
			log.highlight(`ArrayProxyHandler.set() target=${targetObj}, prop=${prop}, ${value}`);
			targetObj[prop] = value;
			return true;
		}

		// not sure why this would happen
		log.error(`Unexpected!`);
		return false;
	}

	//public apply(target: T, thisArg: any, args?: any) {
	//	log.error(`ArrayProxyHandler.apply called: target=${target}, thisArg=${thisArg}, args = ${args}`);
	//}
}

export default class ArrayProxy<T> extends Array<T> {
	constructor(array: Array<T>) {
		super();
		log.highlight(`ArrayProxy<T> ctor() called, _array is ${JSON.stringify(array)}`);
		let proxy = new Proxy<Array<T>>(array, new ProxyHandler<Array<T>>());
		return proxy;
	};
}
