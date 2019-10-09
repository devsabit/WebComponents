import BaseInputForm from '../BaseComponent/BaseInputForm.js';
import Person from './Person.js';
import { log } from '../BaseComponent/Logger.js';

export default class PersonForm extends BaseInputForm<Person> {
	public static tag = 'person-form';

	// input form DTO is declared in base class BaseInputForm<T>
	//protected dto: Person = new Person();

	// ctor
	constructor() {
		super();

		this.dto = new Person();
		log.func('PersonForm.ctor() called');
		log.highlight('this.dto was initialised with these values:');
		log.debug(this.dto);
	}

	protected onSubmit() {
		super.onSubmit();
		log.func('PersonForm.onSubmit() called, dto has now been updated');
		log.highlight('this.dto updated values are:');
		log.debug(this.dto);
	}

}
customElements.define(PersonForm.tag, PersonForm);
