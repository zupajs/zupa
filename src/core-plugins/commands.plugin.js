prepare(({ projectDep }) => {
	projectDep('console-table-printer@2.10.0')
})

define(({ $, commands, require }) => {

	const commandsCommand = $`commands`({
		async run() {
			throw new Error('missing parameter TODO help')
		}
	});

	commandsCommand.$`list`({
		run() {
			const { Table } = require('console-table-printer');

			//Create a table
			const p = new Table();

			//add rows with color
			//p.addRows(Object.keys(registry).map(script => ({
			//	name: script,
			//	desc: ''
			//})))
			const normalizedCommands =[]

			function collectCommands(cmd) {
				for (let subc of cmd.subcommands) {
					normalizedCommands.push(subc.matchingCommandName())
					collectCommands(subc)
				}
			}
			collectCommands(commands)

			p.addRows(normalizedCommands.map(c => ({
				name: c
			})))

			//print
			return commands
		}
	})

})