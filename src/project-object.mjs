import Emittery from 'emittery';
import { log } from './logging.mjs';
import chalk from 'chalk';
import { createDependencyRegistry } from "./dependency-registry.mjs";
import { createScriptRegistry } from "./script-registry.mjs";
import { basename } from 'path';
import { loadPackageJson, updatePackageJson } from "./package-json.mjs";
import minimist from "minimist";

const eventColor = chalk.whiteBright.bgCyanBright

export async function createProjectObject(__filename, __dirname) {
	const events = new Emittery({
		debug: {
			name: basename(__filename),
			enabled: log.isVerbose,
			logger(type, debugName, eventName, eventData) {
				log(`[${debugName}:${type}]: ${eventName.toString()}`);
			}
		}
	})

	const pkg = await loadPackageJson(__dirname);
	const dependencyRegistry = createDependencyRegistry(__dirname, events);
	const scriptRegistry = createScriptRegistry();

	const argv = minimist(process.argv.slice(2));

	return {
		argv,
		__dirname,
		events,
		pkg,
		on(eventName, cb) {
			log(eventColor('Adding event listener to project'), eventName)
			events.on(eventName, cb)
		},
		emit(eventName, payload) {
			log(eventColor('Emitting event on project'), eventName)
			events.emit(eventName, payload)
		},
		dependencyRegistry,
		scriptRegistry,
		async run() {

			if (argv._.length > 0) {
				await scriptRegistry.controller.run()
			}
			else {
				await dependencyRegistry.controller.addDepsToPackageJson(pkg)
				await updatePackageJson(pkg, __dirname);

				await dependencyRegistry.controller.installDeps()
			}
		}
	};
}