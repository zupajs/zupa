const test = require('ava')
const { resolve } = require('path')
const setup = require("../common/setup");

test('test project created', async t => {
	const { project } = setup(t)
	t.is(project.path, resolve(__dirname, '..', '..', 'test_projects/test_project_created_project'))
})

test('project.js is loaded', async t => {
	const { project, zupa } = setup(t)
	project.volume({
		'./project.js': ``
	})

	const res = await zupa()

	t.is(res.exitCode, 0);
})

test('npm package is not installed due to missing version', async t => {
	const { project, zupa } = setup(t)
	project.volume({
		'./project.js': `
			project(({
				dependencies
			}) => {
				dependencies(['lodash'])
			})
		`
	})

	try {
		await zupa()
		t.fail('it should fail')
	}
	catch (e) {
		// TODO 19-Aug-2021/zslengyel: error should be on stderr
		t.truthy(e.stdout.includes('Missing versions for npm packages.'));
		t.truthy(e.stdout.includes('Latest versions of packages:'))
		t.truthy(e.stdout.includes('lodash@'))
	}
})

test('fails when package is mistyped', async t => {
	const { project, zupa } = setup(t)
	project.volume({
		'./project.js': `
			project(({
				dependencies
			}) => {
				dependencies(['lodafsh'])
			})
		`
	})

	try {
		await zupa()
		t.fail('it should fail')
	}
	catch (e) {
		// TODO 19-Aug-2021/zslengyel: error should be on stderr
		t.truthy(e.stdout.includes('Missing versions for npm packages.'));
		t.truthy(e.stdout.includes('Latest versions of packages:'))
		t.truthy(e.stdout.includes('No package found: lodafsh'))
	}
})