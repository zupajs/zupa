import chalk from 'chalk';
import minimist from 'minimist';
import columnify from 'columnify';
import jsonColor from 'json-colorizer';
import { LogRecord } from '../../zupa';
import { configStore } from '../config/config';
// TODO 17-Sep-2021/zslengyel: find out why ESlint does not recognize
//eslint-disable-next-line node/no-missing-import
import treeify from 'treeify';

const argv = minimist(process.argv.slice(2));

export function formatResult(logRecord: LogRecord): string | (() => string) {

	const outputTransform = argv.output ?? logRecord.data?.preferredTransform ?? 'raw';

	const configFormatters = configStore.get()?.output?.formatters ?? {};
	const configFormatter = configFormatters[outputTransform];
	const typeOfConfigFormatter = typeof configFormatter;

	if (typeOfConfigFormatter !== 'undefined') {

		if (typeOfConfigFormatter !== 'function') {
			throw new Error(`Formatter '${outputTransform}' should be a function. Got ${typeOfConfigFormatter}`)
		}

		return configFormatter(logRecord)
	}

	const formatters: { [name: string]: (record: LogRecord) => any; } = {
		json: jsonResultFormatter,
		'json:pretty': jsonPrettyResultFormatter,
		table: tableResultFormatter,
		tree: treeResultFormatter,
		raw: rawResultFormatter,
		none: () => ''
	};

	if (!Object.keys(formatters).includes(outputTransform)) {
		throw new Error(`Unsupported output format: '${outputTransform}'`)
	}

	return formatters[outputTransform](logRecord);
}

function jsonResultFormatter(logRecord: LogRecord, space = 0) {
	return JSON.stringify(logRecord.message, null, space);
}

function jsonPrettyResultFormatter(logRecord: LogRecord) {
	return jsonColor(logRecord.message, {
		pretty: true,
		colors: {
			STRING_KEY: 'cyan',
			BRACKET: 'white',
			NUMBER_LITERAL: 'yellow',
			STRING_LITERAL: 'yellow',
			BOOLEAN_LITERAL: 'green',
		}
	});
}

function tableResultFormatter(logRecord: LogRecord) {

	return columnify(logRecord.message, {
		preserveNewLines: true,
		minWidth: 10,
		truncate: false,
		dataTransform: line => line.replace(',', '\n'),
		headingTransform: (header) => chalk.underline.cyan(header.toUpperCase())
	})
}

function treeResultFormatter(logRecord: LogRecord) {
	return treeify.asTree(logRecord.message, true, false);
}

function rawResultFormatter(logRecord: LogRecord) {
	const message = logRecord.message;
	const messageType = typeof message;

	return ['string', 'number'].includes(messageType) ?
		message :
		jsonPrettyResultFormatter(logRecord);
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

export function formatLogRecord(logRecord: LogRecord, logLevel: string): string | (() => string) {

	if (logRecord.level === 'result') {
		return formatResult(logRecord)
	}

	const color = logRecord.level === 'error' ? chalk.red : (
		logRecord.level === 'info' ? chalk.white : chalk
	)

	const rawMessage = logRecord.message;

	const formattedLevel = logLevelColor(logRecord.level);
	const formattedMessage = color(rawMessage);

	const baseMessage = `${formattedLevel}\t${formattedMessage}`;

	if (logRecord.data !== undefined) {

		if (logRecord.level === 'error' && (logRecord.data?.cause ?? false)) {

			if (logLevel === 'verbose') {
				const cause = logRecord.data.cause.stack;
				return `${baseMessage}\n${cause}`;
			}

			return baseMessage;
		}

		const formattedData = JSON.stringify(logRecord.data, null, 0);
		return `${baseMessage}\n${formattedData}`
	}
	return baseMessage;
}
