const chalk = require('chalk')
const minimist = require("minimist");

const logColor = chalk.magenta;

function createScriptRegistry(config, log) {

	const scriptRegistry = {};

	async function runScript(script, params = []) {
		let scriptFn = scriptRegistry[script];
		if (!scriptFn) {
			throw new Error(`script is not defined: ${script}`)
		}
		return await scriptFn.call(null, params)
	}

	function scriptApi(name, scriptFn) {
		if (name in scriptRegistry) {
			throw new Error(`'${name}' script is already defined`)
		}

		log(logColor(`Define script: ${chalk.bgBlue(name)}`))
		scriptRegistry[name] = scriptFn
	}

	scriptApi.route = async function route(argv, definition) {
		const params = argv['_']
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
		const scriptFlags = config.get()['--'];
		const scriptArgv = minimist([...restParams, ...scriptFlags])
		return await scriptFn.call(null, scriptArgv);
	}

	const registryRepresentation = {
		api: {
			script: scriptApi
		},
		controller: {
			async run() {
				const argv = config.get()['_']
				const scriptFlags = config.get()['--'];

				if (argv.length > 0) {
					const script = argv[0];

					const scriptArgv = minimist([...argv.splice(1), ...scriptFlags]);

					return await runScript(script, scriptArgv);
				}
				else {
					const scriptArgv = minimist(scriptFlags);
					return await runScript(config.get().scripts.default, scriptArgv)
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