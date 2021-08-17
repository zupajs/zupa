const minimist = require('minimist')
const { log } = require('./logging')
const chalk = require('chalk')

const logColor = chalk.magenta;

function createScriptRegistry() {

	const scriptRegistry = {};

	const registryRepresentation = {
		api: {
			script(name, scriptFn) {
				log(logColor(`Define script: ${chalk.bgBlue(name)}`))
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
			},

		},
		get registry() {
			return scriptRegistry
		}
	};

	return registryRepresentation;
}

module.exports = {
	createScriptRegistry
}