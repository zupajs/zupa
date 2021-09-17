import Transport from 'winston-transport';
import { LOG_EVENT } from './types';
import { formatLogRecord } from './formats';
import { LogRecord } from '../../zupa';
import logUpdate from 'log-update';

const LogLevel = Symbol.for('level')

type PropTypes = {
	logTransport: Transport;
	logLevel: string;
};

function printOut(logRecords: LogRecord[], logLevel: string): void {

	let lastMessage: LogRecord = { level: '', message: '', data: undefined };
	const resultEntry = logRecords.find(entry => entry.level === 'result');

	if (resultEntry) {
		lastMessage = resultEntry
	}
	else if (logRecords.length) {

		lastMessage = logRecords[logRecords.length - 1]
	}

	let message: string | (() => string) = '';
	try {
		message = formatLogRecord(lastMessage, logLevel);
	}
	catch (error: any) {
		// TODO 17-Sep-2021/zslengyel: ink catches all errors and wraps, prints them.
		// SO main catch in index.ts cannot catch it

		logUpdate.stderr('FATAL', error)
	}

	if (typeof message !== 'string') {
		return logUpdate(message());
	}

	if (logLevel === 'verbose') {

		const formattedRecords = logRecords.map(entry => {
			const formattedRecord = formatLogRecord(entry, logLevel);

			if (typeof formattedRecord === 'string') {

				return formattedRecord
			}

			return formattedRecord()
		});

		const fullContent = formattedRecords.join('\n');

		return logUpdate(fullContent)
	}
	else {
		return logUpdate(message);
	}
}

export function Output({ logTransport, logLevel }: PropTypes) {

	const logRecords: LogRecord[] = [];

	{
		logTransport.on(LOG_EVENT, (entry) => {
			const level = entry[LogLevel];
			const message = entry.message;
			const data = entry.data;

			const record = {
				level, message, data
			} as LogRecord;

			logRecords.push(record);

			printOut(logRecords, logLevel)
		})
	}



}
