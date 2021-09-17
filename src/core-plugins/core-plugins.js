project(({ plugins }) => {
	plugins([
		'@zupa/core-plugins/info.plugin.js',
		'@zupa/core-plugins/tasks.plugin.js',
		'@zupa/core-plugins/deps.plugin.js',
		'@zupa/core-plugins/config-task.plugin.js',
	])
})