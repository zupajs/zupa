prepare(async ({ plugin, config }) => {
	await plugin('./npm.plugin.js')
	await plugin('./dependency-scripts.plugin.js')
	await plugin('./run-time.plugin.js')
	await plugin('./scripts.plugin.js')
	await plugin('./config-scripts.plugin.js')
})