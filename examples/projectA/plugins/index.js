prepare(async ({ plugin, project, params }) => {
	await plugin('./check-engine.js')
	await plugin('./sub-plugin.js')
	await plugin('./tasks.js')

	await plugin('./cowsay.plugin.js', {
		defaultText: "Hello",
		cowsayVersion: params.cowsayVersion
	})
})