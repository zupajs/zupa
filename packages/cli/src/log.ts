import winston from 'winston';
import { InkLogTransport } from './output/output';
import minimist from 'minimist';

const args = minimist(process.argv.slice(2), {
	boolean: 'verbose',
	alias: {
		V: 'verbose'
	}
});

const level = args.verbose ? 'verbose' : 'warn';

type ResultLogger = winston.Logger & {
	result(res: any): void;
};


winston.addColors({
	result: 'white'
})

export const logger: ResultLogger = winston.createLogger({
	level,
	format: winston.format.json(),
	defaultMeta: {},
	levels: {
		result: -1,
		error: 0,
		warn: 1,
		info: 2,
		http: 3,
		verbose: 4,
		debug: 5,
		silly: 6
	},
	transports: [
		new InkLogTransport({
			level
		})
	]
}) as ResultLogger;
