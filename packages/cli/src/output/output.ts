import fs from 'fs';
import React from 'react';
import { Newline, render, Text, useStderr } from 'ink';
import chalk from 'chalk';
import Transport from 'winston-transport';
import { logger } from '../log';

const { useState, useEffect, createElement } = React;

const formatResult = (message: any) => {
	// TODO 19-Aug-2021/zslengyel: handle sophsticated

	if (typeof message === 'string') {
		return message
	}
	return JSON.stringify(message, null, 3);
};

const logLevelColor = (level: string) => {
	switch (level) {
		case 'info': return chalk.green(level);
		case 'verbose': return chalk.gray(level);
		case 'error': return chalk.red(level);
		case 'warn': return chalk.yellow(level);
		default: return level;
	}
}

const formatLogRecord = (logEntry: LogRecord) => {

	if (logEntry.level === 'result') {
		return formatResult(logEntry.message)
	}

	const color = logEntry.level === 'error' ? chalk.red : (
		logEntry.level === 'info' ? chalk.white : chalk
	)

	const rawMessage = typeof logEntry.message === 'string' ? logEntry.message : (
		logEntry.message.length ? logEntry.message.join('\n') : 'NO MESSAGE SENT FROM LOG'
	)

	return logLevelColor(logEntry.level) + color(rawMessage);
}


function isPipedOut(forceTTYMode: boolean) {
	if (forceTTYMode) {
		return false;
	}
	const stats = fs.fstatSync(1)
	return stats.isFIFO() || !process.stdout.isTTY
}

interface LogRecord {
	level: string;
	message: string;
	data: any;
}

const LogLevel = Symbol.for('level')
const LogSplat = Symbol.for('splat')

const Output = ({ logTransport }: { logTransport: Transport }) => {
	const [logRecords, setLogRecord] = useState<LogRecord[]>([]);
	const { write: writeStdErr } = useStderr();

	useEffect(() => {

		logTransport.on('logged', (entry) => {

			const level = entry[LogLevel];
			const message = entry.message;
			const data = entry[LogSplat];

			const record = {
				level, message, data
			} as LogRecord;

			setLogRecord(state => [...state, record])

		})
	}, [])


	//useEffect(() => {
	//
	//
	//	const forceTTYMode = project.config.get().output?.forceTTYMode || false;
	//
	//	// detect if the output is redirected in bash
	//	if (!isPipedOut(forceTTYMode)) {
	//		const verboseLogEvents = ['output:log', 'output:log:info']
	//		logEvents.push(...verboseLogEvents)
	//	}
	//
	//	project.events.on(errorEventName, async (data) => {
	//		writeStdErr(data.message[0])
	//	})
	//
	//	const subscriptions = logEvents.map(eventName => {
	//		const subscription = project.events.on(eventName, async (data) => {
	//			//console.log(eventName, data)
	//			setLogRecord(state => [...state, data])
	//		})
	//		return subscription
	//	})
	//
	//	return () => {
	//		// teardown
	//		subscriptions.forEach(subs => subs())
	//	};
	//}, []);

	let lastMessage = { level: '', message: '' };
	const resultEntry = logRecords.find(entry => entry.level === 'result')

	if (resultEntry) {
		lastMessage = resultEntry
	}
	else if (logRecords.length) {

		lastMessage = logRecords[logRecords.length - 1]
	}

	const message = formatLogRecord(lastMessage)

	if (false) {
		return createElement(React.Fragment, null, ...logRecords.map(entry => {
				return createElement(Text, null, formatLogRecord(entry));
			}),
			createElement(Newline, null),
		)
	}
	else {
		return createElement(Text, null, message);
	}
}

export type InkLogTransportOptions = Transport.TransportStreamOptions

export class InkLogTransport extends Transport {

	name = 'ink';

	constructor(options?: InkLogTransportOptions) {
		super(options)

		render(createElement(Output, { logTransport: this }, null), {
			exitOnCtrlC: false
		});
	}


	log(info: string, next: () => void) {
		this.emit('logged', info);

		// Perform the writing to the remote service
		next();
	}
}
