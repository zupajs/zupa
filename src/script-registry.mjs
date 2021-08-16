import minimist from "minimist";
import { log } from './logging.mjs'
import chalk from 'chalk';

const logColor = chalk.magenta;

export function createScriptRegistry() {

	const scriptRegistry = {};

	return {
		api: {
			script(name, scriptFn) {
				log(logColor(`Define script ${name}`))
				scriptRegistry[name] = scriptFn
			}
		},
		controller: {
			async run() {
				const argv = minimist(process.argv.slice(2))
				if (argv._.length > 0) {
					const script = argv._[0];

					let scriptFn = scriptRegistry[script];
					if (!scriptFn) {
						throw new Error(`script is not defined: ${script}`)
					}

					const params = argv._.splice(1)
					await scriptFn.apply(null, params)

				}
			}
		}
	}
}