const Emittery = require('emittery')
const { log } = require('./logging')
const chalk = require('chalk')
const { createDependencyRegistry } = require('./dependency-registry')
const { createScriptRegistry } = require('./script-registry')
const { basename } = require('path')
const { loadPackageJson, updatePackageJson } = require('./package-json')
const minimist = require('minimist')
const { createConfig } = require("./config");

async function createProjectObject(__filename, __dirname) {

	const argv = minimist(process.argv.slice(2));

	if (!argv.verbose) {
		process.argv = [...process.argv, '--silent']
	}

	const config = createConfig(argv);

	const events = new Emittery({
		debug: {
			name: basename(__filename),
			enabled: log.isVerbose,
			logger(type, debugName, eventName, eventData) {
				log(chalk.italic.inverse(`🔫 events [${debugName}:${type}]: ${eventName?.toString()}`));
			}
		}
	})

	const projectObject = {
		config,
		argv,
		__filename,
		__dirname,
		events,
		on(eventName, cb) {
			return events.on(eventName, cb)
		},

		async run() {

			await events.emitSerial('run:before')

			await scriptRegistry.controller.run()

			await events.emitSerial('run:after')
		}
	};

	const pkg = await loadPackageJson(__dirname);
	const dependencyRegistry = createDependencyRegistry(__dirname, __filename, projectObject);
	const scriptRegistry = createScriptRegistry(config);

	projectObject['pkg'] = pkg;
	projectObject['dependencyRegistry'] = dependencyRegistry;
	projectObject['scriptRegistry'] = scriptRegistry;

	return projectObject;
}

module.exports = {
	createProjectObject
}