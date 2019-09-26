//declare type Dictionary<T> = { [key: string]: T };
declare type Key<T> = T[keyof T];
declare type Nullable<T> = T | null;
