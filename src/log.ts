import winston from 'winston';
import { inkLogTransport, level } from './output/log-transport';

type ResultLogger = winston.Logger & {
	result(res: unknown): void;
};

winston.addColors({
	result: 'white',
	info: 'green',
	verbose: 'grey'
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
		inkLogTransport
	]
}) as ResultLogger;

// bind errors to main 'thread'
inkLogTransport.on('FATAL', (error) => {
	throw error;
})
