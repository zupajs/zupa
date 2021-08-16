prepare(({ projectDep }) => {
	projectDep('console-table-printer@2.10.0')
})

define(({ script, project, log }) => {

	function listScripts(registry) {
		const { Table } = require('console-table-printer');

		//Create a table
		const p = new Table();

		//add rows with color
		p.addRows(Object.keys(registry).map(script => ({
			name: script,
			desc: ''
		})))

		//print
		p.printTable();
	}

	script('scripts', function scriptsScript(command, ...params) {
		const registry = project.scriptRegistry.registry;
		switch (command) {
			case 'ls':
				listScripts(registry)
				break;

			default:
				throw new Error('missing parameter TODO help')
		}
	})

})