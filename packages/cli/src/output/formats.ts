import chalk from 'chalk';
import minimist from 'minimist';
import { LogRecord } from './types';
import { createElement, FunctionComponent } from 'react';
import Table from 'ink-table'

const argv = minimist(process.argv.slice(2));

export function formatResult(logRecord: LogRecord): string | FunctionComponent {

	const message = logRecord.message;

	if (typeof message === 'string') {
		return message;
	}

	const outputTransform = argv.output ?? logRecord.data?.preferredTransform ?? 'raw';

	const formatters: { [name: string]: (record: LogRecord) => any; } = {
		json: jsonResultFormatter,
		'json:pretty': record => jsonResultFormatter(record, 3),
		table: tableResultFormatter,
		raw: rawResultFormatter
	};

	if (!Object.keys(formatters).includes(outputTransform)) {
		throw new Error(`Unsupported output format: '${outputTransform}'`)
	}

	return formatters[outputTransform](logRecord);
}

function jsonResultFormatter(logRecord: LogRecord, space = 0) {
	return JSON.stringify(logRecord.message, null, space);
}

function tableResultFormatter(logRecord: LogRecord) {

	return () => createElement(Table as any, {
		data: logRecord.message,
		padding: 0
	}, null)
}

function rawResultFormatter(logRecord: LogRecord) {
	return logRecord.message
}

export function logLevelColor(level: string) {
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

export function formatLogRecord(logRecord: LogRecord) {

	if (logRecord.level === 'result') {
		return formatResult(logRecord)
	}

	const color = logRecord.level === 'error' ? chalk.red : (
		logRecord.level === 'info' ? chalk.white : chalk
	)

	const rawMessage = logRecord.message;

	const formattedLevel = logLevelColor(logRecord.level);
	const formattedMessage = color(rawMessage);

	let baseMessage = `${formattedLevel}\t${formattedMessage}`;
	if (logRecord.data !== undefined) {
		const formattedData = JSON.stringify(logRecord.data, null, 0);
		baseMessage = `${baseMessage}\n${formattedData}`
	}
	return baseMessage;
}
