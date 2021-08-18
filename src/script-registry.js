const minimist = require('minimist')
const { log } = require('./logging')
const chalk = require('chalk')

const logColor = chalk.magenta;

function createScriptRegistry(config) {

	const scriptRegistry = {};

	async function runScript(script, params = []) {
		let scriptFn = scriptRegistry[script];
		if (!scriptFn) {
			throw new Error(`script is not defined: ${script}`)
		}
		await scriptFn.apply(null, params)
	}

	function scriptApi(name, scriptFn) {
		log(logColor(`Define script: ${chalk.bgBlue(name)}`))
		scriptRegistry[name] = scriptFn
	}

	scriptApi.route = async function route(params, definition) {
		let scriptName = params.length === 0 ? 'default' : params[0];
		let scriptFn = definition[scriptName];

		let restParams;

		if (scriptFn) {
			restParams = params.splice(1)
		}
		else {
			scriptName = 'default'
			scriptFn = definition[scriptName];
			restParams = params
		}

		if (!scriptFn) {
			throw new Error(`Not defined route in scripts: ${scriptName}`)
		}

		await scriptFn.apply(null, restParams)
	}

	const registryRepresentation = {
		api: {
			script: scriptApi
		},
		controller: {
			async run() {
				const argv = minimist(process.argv.slice(2))
				if (argv._.length > 0) {
					const script = argv._[0];

					const params = argv._.splice(1);
					await runScript(script, params);
				}
				else {
					await runScript(config.get().scripts.default)
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