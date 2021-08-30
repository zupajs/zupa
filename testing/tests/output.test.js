const test = require('ava')
const setup = require("../setup");

test('output considers output.forceTTYMode flag', async t => {
	const { project, zupa } = setup(t)
	project.volume({
		'./package.js': ``,
		'.zuparc': `
			[output]
			forceTTYMode = true
		`
	})

	const res = await zupa(['config'])

	const { stripAnsi } = require('../../src/common/strip-ansi')
	const rawOut = stripAnsi(res.stdout);
	const outputLines = rawOut.split('\n')
	const linesWithNpmPluginLoad = outputLines.filter(line => line.includes('🔌 load plugin: @zupa/core-plugins/npm.plugin.js'))

	t.is(linesWithNpmPluginLoad.length, 1, 'One log entry is present only once');
})

test('verbose output do not duplicate log entries', async t => {
	const { project, zupa } = setup(t)
	project.volume({
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

	const res = await zupa(['config'])

	t.is(res.exitCode, 0);

})