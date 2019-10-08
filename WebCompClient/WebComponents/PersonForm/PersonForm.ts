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
		log.debug(this.dto);
	}

	//protected onSubmit() {
	//	super.onSubmit();
	//	log.info('PersonForm.onSubmit() called');
	//}

}
customElements.define(PersonForm.tag, PersonForm);
