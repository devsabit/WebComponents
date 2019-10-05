import BaseComponent from '../BaseComponent.js';
import Person from './Person.js';

//interface IConstructor<T> {
//	// default constructor
//	new(): T;

//	// with args
//	//new(...args: any[]): T;
//}

//function createInstance<T extends object>(type: IConstructor<T>): T {
//	return new type();
//}

export default class MyInputForm extends BaseComponent {

	constructor(private dto: Person) {
		super('my-input-form');

		console.log('MyInputForm ctor(...) called');
		console.log(`dto = ${dto}`);
	}

	protected async connectedCallback() {
		await super.connectedCallback();

		// set up DTO
		console.log('MyInputForm.connectedCallback() called');

		this.dto = new Person();
		this.dto.forename = 'John';
		this.dto.surname = 'Smith';
		this.dto.dob = new Date('1995-12-31T23:59:59');
		this.dto.age = 88;
		this.dto.alive = true;

		// copy DTO to HTML input form
		this.copyDtoToFormA<Person>(this.dto);
	}

	public onSubmit() {
		console.log('MyInputForm.onSubmit() called');
		// copy input form fields to DTO
		let person = new Person();
		this.dto = this.copyFormToDtoA<Person>(person);
		console.log(this.dto);
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

	public createDto<T>(C: { new(): T }): T[] {
			return [new C(), new C()];
	}

	protected clone1<T extends Record<string, any>>(obj: T): T
	{
		const objClone = {} as T[keyof T]; //Record<string, any>;

		const ownKeys = Reflect.ownKeys(obj).filter((o) => typeof o === 'string') as (keyof T)[];
		for (const prop of ownKeys)
		{
			objClone[prop] = obj[prop];
		}

		return objClone as T;
	}

	protected clone2<T extends Record<string, any>>(obj: T): T
	{
		const objClone = {} as T[keyof T];

		const ownKeys = Reflect.ownKeys(obj) as (keyof T)[];
		for (const prop of ownKeys) {
			objClone[prop] = obj[prop];
		}

		return objClone as T;
	}

	protected clone3<T extends object>(obj: T): T
	{
		const objClone = {} as T;

		const ownKeys = Reflect.ownKeys(obj) as (keyof T)[];
		for (const prop of ownKeys) {
			objClone[prop] = obj[prop];
		}

		return objClone as T;
	}

	protected clone4<T extends object>(obj: T): T
	{
		const objClone = {} as T;
		const ownKeys = Reflect.ownKeys(obj) as PropName<T>[];
		for (const prop of ownKeys) {
			objClone[prop] = obj[prop];
		}

		return objClone as T;
	}

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

			let elId = `wci-${propName}`;
			let inputEl: Nullable<HTMLInputElement> = this.GetShadowElement<HTMLInputElement>(elId);
			if (inputEl == null) {
				alert(`Input element ${inputEl} not found in input form`);
				continue;
			}

			//let formValue: string = inputEl.value;
			//let propValue = ldto[propName];
			//(ldto[propName] as PropValue<Person>) = this.convertStringToType<Person>(ldto[propName], formValue);

			let propKey = propName as PropName<T>;

			//const obj = {} as Record<string, any>;
			//obj[propName] = inputEl.value;

			let propValue = idto[propKey];

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
						alert('copyDtoToFormA() - non-Date object encountered');
					break;

				case 'boolean': (odto[propName] as any) = inputEl.checked;
					break;

				default:
					alert(`copyDtoToFormA() - hit default in switch, type was '${typeName}'`);
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
			let elId = `wci-${propName}`;
			let inputEl: Nullable<HTMLInputElement> = this.GetShadowElement<HTMLInputElement>(elId);
			if (inputEl == null) {
				alert(`Input element ${inputEl} not found in input form`);
				continue;
			}

			let propValue = dto[propName];
			let type = typeof propValue;
			switch (typeof propValue)
			{
				case 'string': inputEl.value = propValue;
					break;

				case 'number': inputEl.valueAsNumber = propValue;
					break;

				case 'object':
					if (propValue instanceof Date)
						inputEl.valueAsDate = propValue;
					else
						alert('copyDtoToFormA() - non-Date object encountered');
					break;

				case 'boolean': inputEl.checked = propValue;
					break;

				default:
					alert(`copyDtoToFormA() - hit default in switch, type was '${type}'`);
			}
		}
	}

}
