const tap = require('tap')
require('./setup')

tap.test('output considers output.forceTTYMode flag', async t => {

	t.project.volume({
		'./package.js': ``,
		'.zuparc': `
			[output]
			forceTTYMode = true
		`
	})

	const res = await t.zupa(['config'])

	const { stripAnsi } = require('../src/common/strip-ansi')
	const rawOut = stripAnsi(res.stdout);
	const outputLines = rawOut.split('\n')
	const linesWithNpmPluginLoad = outputLines.filter(line => line.includes('🔌 load plugin: @zupa/core-plugins/npm.plugin.js'))

	t.equal(linesWithNpmPluginLoad.length, 1, 'One log entry is present only once');
})

tap.test('verbose output do not duplicate log entries', async t => {

	t.project.volume({
		'./package.js': `
		define(({script}) => {
			
			script('hello', () => 'hello')
		})
		`,
		'.zuparc': `
			[output]
			forceTTYMode = true
		`
	})

	const res = await t.zupa(['config'])
	console.dir(res)

	t.equal(res.exitCode, 0);

})