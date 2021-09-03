const Emittery = require('emittery')
const { createLogger } = require('./logging')
const chalk = require('chalk')
const { createDependencyRegistry } = require('./dependency-registry')
const { basename } = require('path')
const { createConfig } = require("./config");
const { createRootCommand } = require('./commands');

async function createProjectObject(__filename, __dirname) {

	const config = createConfig();

	let log = null;

	const events = new Emittery({
		debug: {
			name: basename(__filename),
			enabled: config.verbose,
			logger(type, debugName, eventName) {
				log(chalk.italic.inverse(`🔫 events [${debugName}:${type}]: ${eventName?.toString()}`));
			}
		}
	})

	log = createLogger(events, config.get().verbose);

	const commands = createRootCommand(config, log);

	const projectObject = {
		config,
		__filename,
		__dirname,
		events,
		log,
		chalk,
		commands,
		on(eventName, cb) {
			return events.on(eventName, cb)
		},

		async run() {

			await events.emitSerial('run:before')

			const commandResult = await commands.executeRoot()

			await log.result(commandResult)

			await events.emitSerial('run:after')
		}
	};

	const pkg = {};
	const dependencyRegistry = createDependencyRegistry(__dirname, __filename, projectObject);

	projectObject['pkg'] = pkg;
	projectObject['dependencyRegistry'] = dependencyRegistry;

	return projectObject;
}

module.exports = {
	createProjectObject
}