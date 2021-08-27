const tap = require('tap')
const { resolve } = require('path')
require('../setup')

tap.test('test project created', async t => {
	t.equal(t.project.path, resolve(process.cwd(), 'test_projects/test_project_created_project'))
})

tap.test('package.js is loaded', async t => {
	t.project.volume({
		'./package.js': ``
	})

	const res = await t.zupa()

	t.equal(res.exitCode, 0);
})

tap.test('npm package is not installed in prepare due to missing version', async t => {
	t.project.volume({
		'./package.js': `
			prepare(({projectDep}) => {
				projectDep('lodash')
			})
		`
	})

	try {
		await t.zupa()
		t.fail('it should fail')
	}
	catch (e) {
		// TODO 19-Aug-2021/zslengyel: error should be on stderr
		t.ok(e.stdout.includes('Missing versions for npm packages.'));
		t.ok(e.stdout.includes('Latest versions of packages:'))
		t.ok(e.stdout.includes('lodash@'))
	}
})