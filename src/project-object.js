const Emittery = require('emittery')
const { createLogger } = require('./logging')
const chalk = require('chalk')
const { createDependencyRegistry } = require('./dependency-registry')
const { createScriptRegistry } = require('./script-registry')
const { basename } = require('path')
const { createConfig } = require("./config");

async function createProjectObject(__filename, __dirname) {

	const config = createConfig();

	let log = null;

	const events = new Emittery({
		debug: {
			name: basename(__filename),
			enabled: config.verbose,
			logger(type, debugName, eventName, eventData) {
				log(chalk.italic.inverse(`🔫 events [${debugName}:${type}]: ${eventName?.toString()}`));
			}
		}
	})

	log = createLogger(events, config.get().verbose);

	const projectObject = {
		config,
		__filename,
		__dirname,
		events,
		log,
		chalk,
		on(eventName, cb) {
			return events.on(eventName, cb)
		},

		async run() {

			await events.emitSerial('run:before')

			const scriptOutput = await scriptRegistry.controller.run();

			await log.result(scriptOutput)

			await events.emitSerial('run:after')
		}
	};

	const pkg = {};
	const dependencyRegistry = createDependencyRegistry(__dirname, __filename, projectObject);
	const scriptRegistry = createScriptRegistry(config, log);

	projectObject['pkg'] = pkg;
	projectObject['dependencyRegistry'] = dependencyRegistry;
	projectObject['scriptRegistry'] = scriptRegistry;

	return projectObject;
}

module.exports = {
	createProjectObject
}