prepare(async ({ plugin }) => {
	await plugin('./check-engine.mjs')
	await plugin('./sub-plugin.mjs')
	await plugin('./tasks.mjs')
})