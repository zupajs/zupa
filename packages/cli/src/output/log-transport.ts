import Transport from 'winston-transport';
import { render } from 'ink';
import { createElement } from 'react';
import { Output } from './output';
import { LOG_EVENT } from './types';

export type InkLogTransportOptions = Transport.TransportStreamOptions

export class InkLogTransport extends Transport {

	name = 'ink';

	constructor(options: InkLogTransportOptions) {
		super(options)

		render(createElement(Output, {
				logTransport: this,
				logLevel: options.level || ''
			},
			null), {
			exitOnCtrlC: false
		});
	}


	log(info: string, next: () => void) {
		this.emit(LOG_EVENT, info);

		// Perform the writing to the remote service
		next();
	}
}
