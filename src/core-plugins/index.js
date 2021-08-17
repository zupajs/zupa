prepare(async ({ plugin }) => {
	await plugin('./run-time.plugin.js')
	await plugin('./scripts.plugin.js')
})