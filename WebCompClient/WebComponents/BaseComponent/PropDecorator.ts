import BaseComponent from './BaseComponent.js';
import { log, assert } from '../BaseComponent/Logger.js';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//type Constructor<T> = {
//	new(...args: any[]): T
//};

// From the TC39 Decorators proposal
//interface ClassDescriptor {
//	kind: 'class';
//	elements: ClassElement[];
//	finisher?: <T>(clazz: Constructor<T>) => undefined | Constructor<T>;
//}

 // From the TC39 Decorators proposal
//interface ClassElement {
//	kind: 'field' | 'method';
//	key: PropertyKey;
//	placement: 'static' | 'prototype' | 'own';
//	initializer?: Function;
//	extras?: ClassElement[];
//	finisher?: <T>(clazz: Constructor<T>) => undefined | Constructor<T>;
//	descriptor?: PropertyDescriptor;
//}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// class decorator
export function Component(tagName: string) {
	return (ctor: Function) => {
		log.highlight(`Class decorator called for : ${tagName}`);
		log.dump(ctor);
		log.info(`Setting tag for ${ctor.name}.tag = ${tagName}`);
		BaseComponent.tag = tagName;		// this works
	}
}

//export function Component<T extends BaseComponent>(tagName: string): Function {
//	return (classDesc: Constructor<T> /*ClassDescriptor*/) => {
//		(ctor: Constructor<T>) => {
//			log.highlight(`Class decorator called for : ${tagName}`);
//			log.dump(ctor);
//			BaseComponent.tag = tagName;		// this works??
//			log.dump(classDesc);

//			//// not sure about the following code:
//			//BaseComponent._observedAttributes = [`${tagName}`];
//			//customElements.define(tagName, ctor.constructor);
//		}
//	}
//}

//export function Prop(target: Object, name: string)
//{
//	Object.defineProperty(target, name, {
//		get: function () { return this['_' + name]; },
//		set: function (value) {
//			log.info(`${this.constructor.name}.${name} = ${value}`);
//			this['_' + name] = value;
//		},
//		enumerable: true,
//		configurable: true
//	});
//}

export function PropOut(target: Object, propName: string) {
	Object.defineProperty(target, propName, {
		get: function () { return this['_' + propName]; },
		set: function (value) {
			log.info(`${this.constructor.name}.${propName} = ${value}`);
			this['_' + propName] = value;
			this.SetElementContent(propName);
		},
		enumerable: true,
		configurable: true
	})
}

export function Attrib<T extends BaseComponent>(target: T, fieldName: string) {
	const kebabName: string = fieldName.replace(/_/g, '-');
	log.highlight(`@Attrib called, fieldName=${fieldName}`);

	// if not present, create static _observedAttributes field and initialise with {fieldName}
	// if it already exists, add {fieldName} to the list
	if (!target.hasOwnProperty('_observedAttributes')) {
		log.highlight(`Class ${target.constructor.name} does not have own property '_observedAttributes', attempting to define now`);
		//let propValues: string[] = ['bacon', target.constructor.name, fieldName];
		let propValues: string[] = [fieldName];
		log.highlight(`propValue = ${propValues}`);
		Object.defineProperty(target, '_observedAttributes', { value: propValues });
	}
	else {
		let obsAttrs: string[];
		let obj = (target as any)._observedAttributes;
		assert(obj != null, `Can't find _observedAttributes on ${target.constructor.name}`)
		log.info(`target._observedAttributes has a value`);
		log.info(`typeof obj=${typeof obj}`);
		log.dump(obj);
		obsAttrs = obj as unknown as string[];
		assert(obsAttrs != null, `obsAttrs is null`);
		obsAttrs.push(kebabName);	// add to list of watched attributes so that we get the attributeChangedCallback() event call
	}

	// also remember to create the property for this attribute
	Object.defineProperty(target, fieldName, {
		get: function () {
			const attribName: string = fieldName.replace(/_/g, '-');	// kebab-case custom attribute name
			let value = (this as HTMLElement).getAttribute(attribName);
			if (value == undefined)
				log.warn(`Could not find attribute '${attribName}' on element ${this.TagName}`);
			return value;
		},
		set: function (value: any) {
			const attribName: string = fieldName.replace(/_/g, '-');	// kebab-case custom attribute name
			log.info(`${this.constructor.name}.${attribName} = ${value}`);
			(this as HTMLElement).setAttribute(attribName, value);
		},
		enumerable: true,
		configurable: true
	});
}

//type Proxy<T> = {
//	get(): T;
//	set(value: T): void;
//}

//type Proxify<T> = {
//	[P in keyof T]: Proxy<T[P]>;
//}

//function proxify<T>(o: T): Proxify<T> {
//	// ... wrap proxies ...
//}

//let proxyProps = proxify(props);

/*
export class PropDecorator {

	public static prop(
		watchers:
			{
				onGet?: () => any,
				onSet?: (newValue: any, oldValue: any) => any
			}): Function {
		return (target: any, key: string) => {

			// property getter
			const getter = function () {
				return this['_' + key];
			};

			// property setter
			const setter = function (newVal) {
				if (watchers.onSet) {
					this['_' + key] = watchers.onSet(newVal, this['_' + key]);
				}
				this['_' + key] = newVal;
			};

			// Delete property.
			if (delete this[key]) {

				// Create new property with getter and setter
				Object.defineProperty(target, key, {
					get: getter,
					set: setter,
					enumerable: true,
					configurable: true
				});
			}
		}
	}
}
*/
