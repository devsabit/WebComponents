import BaseComponent from './BaseComponent.js';
import { log, assert } from '../BaseComponent/Logger.js';

//interface IConstructor<T> {
//	// default constructor
//	new(): T;

//	// with args
//	//new(...args: any[]): T;
//}

//function createInstance<T extends object>(type: IConstructor<T>): T {
//	return new type();
//}

export default class BaseInputForm<T extends object> extends BaseComponent {

	protected static tag: string;// = "BaseInputForm<T> (not used)";

	// derived class must create the concrete object
	protected dto!: T; //= this.createDto<T>();

	constructor() {
		super();

		log.func(`BaseInputForm<T> (${this.constructor.name}) ctor called`);
	}

	//public createDto<T>(C: { new(): T }): T {
	//	return new C();
	//}

	protected async connectedCallback() {
		await super.connectedCallback();

		// set up DTO
		log.event(`${this.constructor.name}.connectedCallback() called`);

		// copy DTO to HTML input form
		this.copyDtoToFormA<T>(this.dto);
	}

	protected onSubmit() {
		log.event(`${this.constructor.name}.onSubmit() called`);

		// copy input form fields to DTO
		//let person = new Person();
		//this.dto = this.copyFormToDtoA<T>(person);

		this.dto = this.copyFormToDtoA<T>(this.dto);
		log.debug(this.dto);
	}

	//private convertStringToType<T>(prop: PropValue<T>, stringProp: string): boolean | number | string | Date {
	//	const errMsg = `convertStringToType(): Hit default in switch (Unknown property type)`;
	//	let propType = typeof prop;
	//	switch (propType) {
	//		case 'string': return stringProp;
	//		case 'number': return Number(stringProp);
	//		case 'boolean': return Boolean(stringProp);
	//		case 'object':
	//			if (prop instanceof Date) {
	//				let date: Date = new Date(stringProp);
	//				return date;
	//			}
	//			else {
	//				alert(errMsg);
	//				return errMsg;
	//			}
	//		default:
	//			alert(errMsg);
	//			return errMsg;
	//	}
	//}

	//protected clone1<T extends Record<string, any>>(obj: T): T
	//{
	//	const objClone = {} as T[keyof T]; //Record<string, any>;

	//	const ownKeys = Reflect.ownKeys(obj).filter((o) => typeof o === 'string') as (keyof T)[];
	//	for (const prop of ownKeys)
	//	{
	//		objClone[prop] = obj[prop];
	//	}

	//	return objClone as T;
	//}

	//protected clone2<T extends Record<string, any>>(obj: T): T
	//{
	//	const objClone = {} as T[keyof T];

	//	const ownKeys = Reflect.ownKeys(obj) as (keyof T)[];
	//	for (const prop of ownKeys) {
	//		objClone[prop] = obj[prop];
	//	}

	//	return objClone as T;
	//}

	//protected clone3<T extends object>(obj: T): T
	//{
	//	const objClone = {} as T;

	//	const ownKeys = Reflect.ownKeys(obj) as (keyof T)[];
	//	for (const prop of ownKeys) {
	//		objClone[prop] = obj[prop];
	//	}

	//	return objClone as T;
	//}

	//protected clone4<T extends object>(obj: T): T
	//{
	//	const objClone = {} as T;
	//	const ownKeys = Reflect.ownKeys(obj) as PropName<T>[];
	//	for (const prop of ownKeys) {
	//		objClone[prop] = obj[prop];
	//	}

	//	return objClone as T;
	//}

	//protected copyFormToDtoA<T extends object>(ldto: T): T {
	protected copyFormToDtoA<T extends object>(idto: T): T {

		//protected copyFormToDtoA<T extends object>(ldto: { new(): T }): T {
		// copy all fields in input form to DTO

		//this.createDto<T>(Person);
		//ldto = createInstance(T);
		//let ldto = new Person();

		const odto = {} as T;

		const ownKeys = Reflect.ownKeys(idto) as PropName<T>[];
		//const ownKeys = Reflect.ownKeys(ldto) as (keyof T)[];
		for (const propName of ownKeys) {
			let propKey = propName as PropName<T>;
			let propValue = idto[propKey];

			//let elId = `wci-${propName}`;
			let attribName = this.getDataAttribWci(propName as keyof this);
			let inputEls = this.getShadowElementsByAttribName<HTMLInputElement>(attribName);
			assert(inputEls.length === 1, `copyFormToDtoA(): Expected to find single <input> element, actually found ${inputEls.length} elements`);
			log.debug(`prop = ${propName}, dataAttrib = ${attribName}, ${inputEls.length}`);
			let inputEl = inputEls[0];

			// Note the difference runtime and compile time typeof usage:
			// see https://stackoverflow.com/questions/51528780/typescript-check-typeof-against-custom-type
			let typeName: string = typeof propValue;		// run-time type as value/string
			//type TPropValue = typeof propValue;				// compile time type

			switch (typeName/*typeof ldto[propName]*/) {
				case 'string': (odto[propName] as any) = inputEl.value;
					break;

				case 'number': (odto[propName] as any) = inputEl.valueAsNumber;
					break;

				case 'object':
					if (propValue instanceof Date)
						(odto[propName] as any) = inputEl.valueAsDate;
					else
						log.error('copyDtoToFormA() - non-Date object encountered');
					break;

				case 'boolean':
					let boolVal: boolean = (inputEl.value === 'true' && inputEl.checked) || (inputEl.value === 'false' && !inputEl.checked);
					(odto[propName] as any) = boolVal;
					break;

				default:
					log.error(`copyDtoToFormA() - hit default in switch, type was '${typeName}'`);
			}

		}

		return odto as T;
	}

	// There are some typing issues when enumerate/use indexers with generics in TypeScript.
	// This code for enumerating generic types was suggested by Anders Hejlsberg
	// see May 31st comment here:
	//	https://github.com/microsoft/TypeScript/issues/31661
	//
	protected copyDtoToFormA<T extends object>(dto: T) {
		const ownKeys = Reflect.ownKeys(dto) as (keyof T)[];
		for (const propName of ownKeys) {
			//let elId = `wci-${propName}`;
			//let inputEl: Nullable<HTMLInputElement> = this.GetShadowElementById<HTMLInputElement>(elId);
			let attribName = this.getDataAttribWci(propName as keyof this);
			let inputEls = this.getShadowElementsByAttribName<HTMLInputElement>(attribName);
			if (inputEls.length == undefined)
				continue;
			assert(inputEls.length === 1, `copyDtoToFormA(): Expected to find single <input> element, actually found ${inputEls.length} elements`);
			log.debug(`prop = ${propName}, dataAttrib = ${attribName}, ${inputEls.length}`);
			let inputEl = inputEls[0];

			let propValue = dto[propName];
			let type = typeof propValue;
			switch (typeof propValue) {
				case 'string': inputEl.value = propValue;
					break;

				case 'number': inputEl.valueAsNumber = propValue;
					break;

				case 'object':
					if (propValue instanceof Date)
						inputEl.valueAsDate = propValue;
					else
						log.error('copyDtoToFormA() - non-Date object encountered');
					break;

				case 'boolean':
					// for boolean there will be two radio buttons with values true and false
					// if first radio returns true, then propValue is used as is
					// if first radio returns true, then propValue logic is inverted
					let firstRadioTrue: boolean = (inputEl.value === 'true');
					inputEl.checked = firstRadioTrue ? propValue : !propValue;
					break;

				default:
					log.error(`copyDtoToFormA() - hit default in switch, type was '${type}'`);
			}
		}
	}

}
