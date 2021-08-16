import Emittery from 'emittery';
import { log } from './logging.mjs';
import chalk from 'chalk';
import { createDependencyRegistry } from "./dependency-registry.mjs";
import { createScriptRegistry } from "./script-registry.mjs";
import { basename } from 'path';
import { loadPackageJson } from "./package-json.mjs";

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

	return {
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
		scriptRegistry
	};
}