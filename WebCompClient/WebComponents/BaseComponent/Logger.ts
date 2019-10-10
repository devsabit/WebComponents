﻿export function assert(condition: boolean, msg?: string): asserts condition {
	if (!condition) {
		log.error(`assert() failed : ${msg}`);
		log.stack('Stack trace is:');
	}
}

export class Logger {

	// ctor
	public constructor() {
	}

	// test function (not used)
	public assertionFunctionTest(str: string) {
		assert(typeof str === "string");

		return str.toUpperCase();
	}

	// log info
	public info(msg: string) {
		console.info(msg);
	}

	// log function entry/exit
	public func(msg: string) {
		console.info(`%c ${msg}`, "color: darkorange");
	}

	// log event
	public event(msg: string) {
		console.info(`%c DOM event => ${msg}`, "color: green");
	}

	// log debug (use for dumping values as json strings)
	public debug(msg: string | object) {
		if (typeof (msg) === 'object')
			msg = JSON.stringify(msg);
		console.info(`%c ${msg}`, "color: purple");
	}

	// log template
	public template(msg: string) {
		console.info(`%c ${msg}`, "color: blue");
	}

	// log warning
	public warn(msg: string) {
		console.warn(msg);
	}

	// log error, also returns error msg as string
	public error(msg: string): string {
		console.error(msg);
		alert(msg);
		return msg;
	}

	// log highlighted text
	public highlight(msg: string) {
		console.info(`%c ${msg}`, 'color: black; background: yellow');
	}

	// log stack trace
	public trace(msg: string) {
		console.trace(msg);
	}

	// log stack trace (synonym)
	public stack(msg: string) {
		console.trace(msg);
	}

}
export var log: Logger = new Logger();
log.info('Logger started...');