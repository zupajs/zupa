prepare(({ projectDep }) => {
	projectDep('console-table-printer@2.10.0')
})

define(({ script, project, require }) => {

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
		return p.render();
	}

	script('scripts', async function scriptsScript(argv) {
		const registry = project.scriptRegistry.registry;
		return await script.route(argv, {
			ls() {
				return listScripts(registry)
			},
			default() {
				throw new Error('missing parameter TODO help')
			}
		})
	})

})