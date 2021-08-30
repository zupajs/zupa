const minimist = require("minimist");

function parseCommandName(expression) {

	const commandArgs = new Map();

	if (expression === '') {
		// handling root
		return {
			commandName: '',
			commandArgs
		}
	}

	const commandRegexp = /^(?<commandName>\w+)(?<argNames>(\s<\w+>)*)/gm;
	const argNameRegexp = /^<(?<argName>(\w+))>/g

	const match = commandRegexp.exec(expression)

	if (!match) {
		throw new Error(`invalid command expression provided: '${expression}'`)
	}

	const commandName = match.groups.commandName;

	const argNamesGroup = match.groups.argNames;
	if (argNamesGroup) {
		const argNames = argNamesGroup.trim().split(/\s+/); // split arg names by whitespaces

		const normalizedArgNames = argNames
			.map(arg => {
				const regExpExecArray = new RegExp(argNameRegexp).exec(arg);
				return regExpExecArray.groups.argName;
			});

		normalizedArgNames.forEach(argName => {
			commandArgs.set(argName, {
				required: true
			});
		})
	}

	return { commandName, commandArgs }
}

function createCommand(commandNameExpression, config, parent = null) {
	const subcommands = [];

	const { commandName, commandArgs } = parseCommandName(commandNameExpression)

	const constructedConfig = {
		...config,
		args: new Map([
			...Object.entries(config.args || {}),
			...commandArgs.entries()
		])
	};

	const matchingCommandName = () => {
		if (parent) {
			const commandNameWithParentsName = parent.matchingCommandName() + ' ' + commandName;
			return commandNameWithParentsName.trim();
		}
		return commandName
	};

	function subcommand(commandName) {
		const rawCommand = typeof commandName === 'string' ? commandName : commandName[0];
		return (config) => {
			const command = createCommand(rawCommand, config, commandObject)

			const existingCommand = subcommands.find(subc => subc.commandName === command.commandName);

			if (existingCommand) {
				throw new Error(`Command is already defined: ${command.commandName}`)
			}

			subcommands.push(command)
			return command;
		}
	}

	function matchArgv(argv) {
		return argv.join(' ') === matchingCommandName();
	}

	function findMatching(argv) {

		let recommendedSubcommand = null;
		for (let subc of subcommands) {
			const foundSubcommand = subc.findMatching(argv)
			if (foundSubcommand) {
				recommendedSubcommand = foundSubcommand;
				break;
			}
		}

		if (recommendedSubcommand) {
			return recommendedSubcommand
		}

		if (matchArgv(argv)) {
			return commandObject
		}
	}

	function findCommand(argv) {
		const commandArgs = [];
		let command = null;
		let currentArgv = [...argv];
		while (currentArgv.length > 0 && !command) {
			command = findMatching(currentArgv)

			if (!command) {
				const popedItem = currentArgv.pop();
				commandArgs.unshift(popedItem)
			}
		}

		return { command, commandArgs };
	}

	function parseArgs(args) {
		const constructedArgs = constructedConfig.args;

		if (args.length !== constructedArgs.size) {
			throw new Error(`Expected length is ${constructedArgs.length}. Got: ${args.join(' ')}`)
		}

		return Array.from(constructedArgs.entries()).reduce((acc, item, index) => {
			const [argName, definition] = item;
			const providedValue = args[index];
			// TODO 30-Aug-2021/zslengyel: validate
			acc[argName] = providedValue;
			return acc;
		}, {})
	}

	async function execute(args, options) {
		const { command, commandArgs } = findCommand(args);

		if (!command) {
			throw new Error(`cannot find command: \`${args[0]}\``)
		}

		const parsedArgs = command.parseArgs(commandArgs)
		const commandResult = await command.config.run(parsedArgs, options);
		return commandResult
	}

	const commandObject = {
		execute,
		commandName,
		parseArgs,
		config: constructedConfig,
		subcommands,
		subcommand,
		$: subcommand,
		matchingCommandName,
		findMatching
	}

	return commandObject;
}

function createRootCommand(config) {
	const rootCommand = createCommand('', {})

	function createOptions() {
		const args = minimist(process.argv)
		const options = Object.getOwnPropertyNames(args)
		const flagNames = options.filter(flag => flag != '_');

		return flagNames.reduce((acc, flagName) => {
			acc[flagName] = args[flagName];
			return acc;
		}, {});
	}

	return {
		...rootCommand,
		async executeRoot() {

			const options = createOptions();

			const argv = config.get()['_']

			if (argv.length > 0) {
				return rootCommand.execute(argv, options);
			}
			else {
				const defaultArgv = [config.get().commands.default];
				return await rootCommand.execute(defaultArgv, options)
			}
		}
	}
}

module.exports = {
	createRootCommand,
	parseCommandName
}