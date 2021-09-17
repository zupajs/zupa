import React from 'react';
import { Newline, Text, useApp, useStderr } from 'ink';
import Transport from 'winston-transport';
import { LOG_EVENT } from './types';
import { formatLogRecord } from './formats';
import { LogRecord } from '../../zupa';

const { useState, useEffect, createElement } = React;

const LogLevel = Symbol.for('level')

type PropTypes = {
	logTransport: Transport;
	logLevel: string;
};

export function Output({ logTransport, logLevel }: PropTypes) {

	const [logRecords, setLogRecord] = useState<LogRecord[]>([]);
	const { write: writeStdErr } = useStderr();
	const { exit } = useApp();

	useEffect(() => {

		logTransport.on(LOG_EVENT, (entry) => {
			const level = entry[LogLevel];
			const message = entry.message;
			const data = entry.data;

			const record = {
				level, message, data
			} as LogRecord;

			setLogRecord(state => [...state, record])

		})
	}, [])

	let lastMessage: LogRecord = { level: '', message: '', data: undefined };
	const resultEntry = logRecords.find(entry => entry.level === 'result');

	if (resultEntry) {
		lastMessage = resultEntry
	}
	else if (logRecords.length) {

		lastMessage = logRecords[logRecords.length - 1]
	}

	let message: string | React.FunctionComponent = '';
	try {
		message = formatLogRecord(lastMessage, logLevel);
	}
	catch (error: any) {
		// TODO 17-Sep-2021/zslengyel: ink catches all errors and wraps, prints them.
		// SO main catch in index.ts cannot catch it

		console.error('FATAL', error)
		exit(error)
		return createElement(message);
		// eslint-disable-next-line no-process-exit
		//process.exit(1)

	}

	if (typeof message !== 'string') {
		return createElement(message, {}, null)
	}

	if (logLevel === 'verbose') {

		const formattedRecords = logRecords.map(entry => {
			const formattedRecord = formatLogRecord(entry, logLevel);

			if (typeof formattedRecord === 'string') {

				return createElement(Text, null, formattedRecord);
			}

			return createElement(formattedRecord, {}, null);
		});

		return createElement(React.Fragment, null,
			...formattedRecords,
			createElement(Newline, null),
		);
	}
	else {
		return createElement(Text, null, message);
	}

}
