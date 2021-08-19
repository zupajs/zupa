const chalk = require('chalk')

const logColor = chalk.magenta;

function createScriptRegistry(config, log) {

	const scriptRegistry = {};

	async function runScript(script, params = []) {
		let scriptFn = scriptRegistry[script];
		if (!scriptFn) {
			throw new Error(`script is not defined: ${script}`)
		}
		return await scriptFn.apply(null, params)
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

		return await scriptFn.apply(null, restParams);
	}

	const registryRepresentation = {
		api: {
			script: scriptApi
		},
		controller: {
			async run() {
				const argv = config.get()['_']

				if (argv.length > 0) {
					const script = argv[0];

					const params = argv.splice(1);
					return await runScript(script, params);
				}
				else {
					return await runScript(config.get().scripts.default)
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