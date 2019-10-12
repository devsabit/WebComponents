declare type Key<T> = T[keyof T];
declare type PropName<T> = keyof T;
declare type PropValue<T> = T[keyof T];
declare type Nullable<T> = T | null;
//declare type Map<K, V> = {};
//declare type Dictionary<T> = { [key: string]: T };
//declare type StaticThis<T> = { new(): T };

declare type Constructor<T extends object> = {
	new(...args: any[]): T
};
