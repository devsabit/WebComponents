//interface IRange {
//	min: number,
//	max: number,
//	step: number
//}

//enum Colour { Red, Green, Blue };

export default class Person {
	public forename: string = 'John';
	public surname: string = 'Smith';
	public dob: Date = new Date();
	public age: number = 55;
	public alive: boolean = true;
	//public favColour: Colour = Colour.Red;
	//public range: IRange = { 0, 0, 0};
}
