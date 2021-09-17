import Transport from 'winston-transport';
import { Output } from './output';
import { LOG_EVENT } from './types';
import minimist from 'minimist';

const args = minimist(process.argv.slice(2), {
	boolean: 'verbose',
	alias: {
		V: 'verbose'
	}
});

export const level = args.verbose ? 'verbose' : 'warn';

type InkLogTransportOptions = Transport.TransportStreamOptions

class InkLogTransport extends Transport {

	name = 'ink';

	constructor(options: InkLogTransportOptions) {
		super(options)

		Output({
			logTransport: this,
			logLevel: options.level || ''
		});
	}

	log(info: string, next: () => void) {
		this.emit(LOG_EVENT, info);

		// Perform the writing to the remote service
		next();
	}
}

export const inkLogTransport = new InkLogTransport({
	level
});