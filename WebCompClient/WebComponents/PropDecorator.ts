
export default class PropDecorator {
	public static prop(target: Object, name: string)
	{
		Object.defineProperty(target, name, {
			get: function() { return this["_" + name]; },
			set: function (value) {
				console.log(`${this.constructor.name}.${name} = ${value}`);
				this["_" + name] = value;
				this.SetElementContent(name);
			},
			enumerable: true,
			configurable: true
		});
	}
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
