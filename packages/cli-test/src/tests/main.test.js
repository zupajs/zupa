const test = require('ava')
const { resolve } = require('path')
const setup = require("../common/setup");

test('test project created', async t => {
	const { project } = setup(t)
	t.is(project.path, resolve(process.cwd(), 'test_projects/test_project_created_project'))
})

test('package.js is loaded', async t => {
	const { project, zupa } = setup(t)
	project.volume({
		'./package.js': ``
	})

	const res = await zupa()

	t.is(res.exitCode, 0);
})

test('zupa should throw an error because plugin is not exported as default', async t => {
	const { project, zupa } = setup(t)
	project.volume({
		'./package.js': `
			class extends ZupaPlugin {
			}
		`
	})

	await t.throwsAsync(async () => {
		const res = await zupa()

		console.log(res)
	})
})

test('npm package is not installed in prepare due to missing version', async t => {
	const { project, zupa } = setup(t)
	project.volume({
		'./package.js': `
			exports.default = class extends ZupaPlugin {
			}
		`
	})

	try {
		await zupa()
		t.fail('it should fail')
	}
	catch (e) {
		// TODO 19-Aug-2021/zslengyel: error should be on stderr
		t.pass(e.stdout.includes('Missing versions for npm packages.'));
		t.pass(e.stdout.includes('Latest versions of packages:'))
		t.pass(e.stdout.includes('lodash@'))
	}
})