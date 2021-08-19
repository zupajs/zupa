const React = require('react');
const { render, Text, Newline } = require('ink');
const { useState, useEffect, createElement } = React;
const chalk = require('chalk')
const fs = require('fs')

const formatResult = message => {
	// TODO 19-Aug-2021/zslengyel: handle sophsticated

	if (typeof message === 'string') {
		return message
	}
	return JSON.stringify(message, null, 3);
};

const formatLogEntry = (logEntry) => {

	if (logEntry.level === 'result') {
		return formatResult(logEntry.message)
	}

	const color = logEntry.level === 'error' ? chalk.red : (
		logEntry.level === 'info' ? chalk.white : chalk
	)

	const rawMessage = typeof logEntry.message === 'string' ? logEntry.message : (
		logEntry.message.length ? logEntry.message.join('\n') : 'NO MESSAGE SENT FROM LOG'
	)

	return color(rawMessage);
}


function isPipedOut() {
	const stats = fs.fstatSync(1)
	return stats.isFIFO() || !process.stdout.isTTY
}


const Output = ({ project }) => {
	const [logEntries, setLogEntries] = useState([]);

	useEffect(() => {

		const logEvents = ['output:log:result', 'output:log:error'];

		// detect if the output is redirected in bash
		if (!isPipedOut()) {
			const verboseLogEvents = ['output:log', 'output:log:info',]
			logEvents.push(...verboseLogEvents)
		}

		const subscriptions = logEvents.map(eventName => {
			const subscription = project.events.on(eventName, async (data) => {
				//console.log(eventName, data)
				setLogEntries(state => [...state, data])
			})
			return subscription
		})

		return () => {
			// teardown
			subscriptions.forEach(subs => subs())
		};
	}, []);

	let lastMessage = { level: '', message: '' };
	const resultEntry = logEntries.find(entry => entry.level === 'result')

	if (resultEntry) {
		lastMessage = resultEntry
	}
	else if (logEntries.length) {

		lastMessage = logEntries[logEntries.length - 1]
	}

	const message = formatLogEntry(lastMessage)

	if (project.config.get().verbose) {
		return createElement(React.Fragment, null, ...logEntries.map(entry => {
				return createElement(Text, null, formatLogEntry(entry));
			}),
			createElement(Newline, null),
		)
	}
	else {
		return createElement(Text, null, message);
	}
};

async function attachOutput(project) {

	await render(createElement(Output, { project }, null), {
		exitOnCtrlC: true
	});
}

module.exports = {
	attachOutput
}