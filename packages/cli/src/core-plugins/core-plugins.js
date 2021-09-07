project(({ plugins }) => {
	plugins([
		'./tasks.plugin.js',
		'./npm-publish.plugin.js'
	])
})