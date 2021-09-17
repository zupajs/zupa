import Transport from 'winston-transport';
import { Instance, render, Text } from 'ink';
import React, { createElement, ErrorInfo } from 'react';
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

		const outputElement = createElement(Output, {
				logTransport: this,
				logLevel: options.level || ''
			},
			null);

		const outputInstance: Instance = render(outputElement, {
			exitOnCtrlC: false,
			debug: false,
			patchConsole: false
		});

		outputInstance.waitUntilExit().then(() => {
			// TODO 17-Sep-2021/zslengyel: handle exit
		}).catch((error) => {
			console.log('error', error)
		})
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