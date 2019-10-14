import BaseInputForm from '../BaseComponent/BaseInputForm.js';
import Person from './Person.js';
import { Component, PropOut3 } from '../BaseComponent/PropDecorator.js';
import { log } from '../BaseComponent/Logger.js';

@Component('person-form')
export default class PersonForm extends BaseInputForm<Person> {

	// input form DTO is declared in base class BaseInputForm<T>
	//protected dto: Person = new Person();

	@PropOut3 forename: string = '';
	@PropOut3 surname: string = '';
	@PropOut3 alive: boolean = true;

	// ctor
	constructor() {
		super();

		this.dto = new Person();
		log.func('PersonForm.ctor() called');
		log.info('this.dto was initialised with these values:');
		log.debug(this.dto);
	}

	protected onSubmit() {
		super.onSubmit();
		log.func('PersonForm.onSubmit() called, dto has now been updated');
		log.info('this.dto updated values are:');
		log.debug(this.dto);
	}
}
