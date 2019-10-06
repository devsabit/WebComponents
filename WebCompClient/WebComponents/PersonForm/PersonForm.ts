import BaseInputForm from '../BaseComponent/BaseInputForm.js';
import Person from './Person.js';

export default class PersonForm extends BaseInputForm<Person> {

	// DTO is declared in base class
	//protected dto: Person = new Person();

	constructor() {
		console.log('PersonForm ctor(...) called');
		super('person-form');

		this.dto = new Person();

		console.log(`dto = ${this.dto}`);
	}

	protected async connectedCallback() {
		await super.connectedCallback();
	}

	protected onSubmit() {
		super.onSubmit();
		console.log('PersonForm.onSubmit() called');
	}

}
