import winston from 'winston';
import { InkLogTransport } from './output/output';

//export function createLogger(events, verbose) {
//
//	const Events
//
//	async function log(...args) {
//		await events.emitSerial('output:log', { level: 'verbose', message: args })
//	}
//
//	log.isVerbose = verbose;
//
//	log.info = (...args) => {
//		events.emitSerial('output:log:info', { level: 'info', message: args })
//	}
//
//	log.error = async (...args) => {
//		await events.emitSerial('output:log:error', { level: 'error', message: args });
//	}
//
//	log.result = async (output) => {
//		await events.emitSerial('output:log:result', { level: 'result', message: output });
//	}
//
//	log.outStream = new stream.Writable({
//		write: function(chunk, encoding, next) {
//			log.info(chunk.toString());
//			next();
//		}
//	});
//
//	return log;
//}

export const logger = winston.createLogger({
	level: /*this.configStore.get().log.verbose*/ true ? 'verbose' : 'info',
	format: winston.format.cli(),
	defaultMeta: {},
	transports: [
		//new winston.transports.Console({
		//	format: winston.format.simple(),
		//})
		new InkLogTransport()
	]
});