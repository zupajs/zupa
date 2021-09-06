project(({
	commands,
	project,
	dependencies
}) => {

	dependencies([
		'chalk@4.1.2'
	])

	commands((cmd, subcmd) => {

		const list = subcmd('list')
			.description('list npm packages')
			.action(() => {
				const dependencies = project.packageManager.dependencies;

				const out = dependencies.map(dep => {
					return `${dep.packageName}@${dep.version} at ${dep.source}`
				}).join('\n')

				console.log(out)
			})

		cmd('npm')
			.addCommand(list)

	})
})