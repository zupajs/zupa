import fs from 'fs';
import React from 'react';
import { Newline, render, Text, useStderr } from 'ink';
import chalk from 'chalk';
import Transport from 'winston-transport';

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
		case 'info':
			return chalk.green(level);
		case 'verbose':
			return chalk.gray(level);
		case 'error':
			return chalk.red(level);
		case 'warn':
			return chalk.yellow(level);
		default:
			return level;
	}
}

const formatLogRecord = (logEntry: LogRecord) => {

	if (logEntry.level === 'result') {
		return formatResult(logEntry.message)
	}

	const color = logEntry.level === 'error' ? chalk.red : (
		logEntry.level === 'info' ? chalk.white : chalk
	)

	const rawMessage = logEntry.message;

	const formattedLevel = logLevelColor(logEntry.level);
	const formattedMessage = color(rawMessage);

	let baseMessage = `${formattedLevel}\t${formattedMessage}`;
	if (logEntry.data !== undefined) {
		const formattedData = JSON.stringify(logEntry.data, null, 3);
		baseMessage = `${baseMessage}\n${formattedData}`
	}
	return baseMessage;
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

const Output = ({ logTransport, logLevel }:
	{
		logTransport: Transport;
		logLevel: string;
	}
) => {
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

	let lastMessage: LogRecord = { level: '', message: '', data: undefined };
	const resultEntry = logRecords.find(entry => entry.level === 'result')

	if (resultEntry) {
		lastMessage = resultEntry
	}
	else if (logRecords.length) {

		lastMessage = logRecords[logRecords.length - 1]
	}

	const message = formatLogRecord(lastMessage)

	if (logLevel === 'verbose') {
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
		this.emit('logged', info);

		// Perform the writing to the remote service
		next();
	}
}
