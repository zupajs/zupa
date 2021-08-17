const Emittery = require('emittery')
const { log } = require('./logging')
const chalk = require('chalk')
const { createDependencyRegistry } = require('./dependency-registry')
const { createScriptRegistry } = require('./script-registry')
const { basename } = require('path')
const { loadPackageJson, updatePackageJson } = require('./package-json')
const minimist = require('minimist')

const eventColor = chalk.whiteBright.bgCyanBright

async function createProjectObject(__filename, __dirname) {

	const events = new Emittery({
		debug: {
			name: basename(__filename),
			enabled: log.isVerbose,
			logger(type, debugName, eventName, eventData) {
				log(chalk.italic.inverse(`🔫 events [${debugName}:${type}]: ${eventName?.toString()}`));
			}
		}
	})

	const pkg = await loadPackageJson(__dirname);
	const dependencyRegistry = createDependencyRegistry(__dirname, __filename, events);
	const scriptRegistry = createScriptRegistry();

	const argv = minimist(process.argv.slice(2));

	return {
		argv,
		__filename,
		__dirname,
		events,
		pkg,
		on(eventName, cb) {
			return events.on(eventName, cb)
		},
		dependencyRegistry,
		scriptRegistry,
		async run() {

			await events.emitSerial('run:before')

			if (argv._.length > 0) {
				await scriptRegistry.controller.run()
			}
			else {
				await dependencyRegistry.controller.addDepsToPackageJson(pkg)
				await updatePackageJson(pkg, __dirname);

				await dependencyRegistry.controller.installDeps()
			}

			await events.emitSerial('run:after')
		}
	};
}

module.exports = {
	createProjectObject
}