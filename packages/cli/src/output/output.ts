import React from 'react';
import { Newline, Text, useStderr } from 'ink';
import Transport from 'winston-transport';
import { LOG_EVENT, LogRecord } from './types';
import { formatLogRecord } from './formats';

const { useState, useEffect, createElement } = React;

const LogLevel = Symbol.for('level')

type PropTypes = {
	logTransport: Transport;
	logLevel: string;
};

export function Output({ logTransport, logLevel }: PropTypes) {

	const [logRecords, setLogRecord] = useState<LogRecord[]>([]);
	const { write: writeStdErr } = useStderr();

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
	const resultEntry = logRecords.find(entry => entry.level === 'result')

	if (resultEntry) {
		lastMessage = resultEntry
	}
	else if (logRecords.length) {

		lastMessage = logRecords[logRecords.length - 1]
	}

	const message = formatLogRecord(lastMessage);

	if (typeof message !== 'string') {
		return createElement(message, {}, null)
	}

	if (logLevel === 'verbose') {
		return createElement(React.Fragment, null,

			...logRecords.map(entry => {
				const formattedRecord = formatLogRecord(entry);

				if (typeof formattedRecord === 'string') {

					return createElement(Text, null, formattedRecord);
				}

				return createElement(formattedRecord, {}, null);
			}),

			createElement(Newline, null),
		);
	}
	else {
		return createElement(Text, null, message);
	}
}
