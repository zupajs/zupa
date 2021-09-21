const test = require('ava');
const setup = require('../common/setup');
const fs = require('fs')
const path = require('path')

test('package.json and related files are ignored', async t => {
	const { project, zupa } = setup(t)

	project.volume({
		'./project.js': `
		project(({ dependencies }) => {
			
			dependencies([
				'@zupajs/zupa@0.0.3'
			])
			
		})
		`
	})

	const res = await zupa()

	t.is(res.exitCode, 0);

	const gitIgnorePath = path.resolve(project.path, '.gitignore');
	t.true(fs.existsSync(gitIgnorePath))

	let gitIgnoreContent = fs.readFileSync(gitIgnorePath, 'utf-8');

	t.true(gitIgnoreContent.includes('package.json'))
	t.true(gitIgnoreContent.includes('package-lock.json'))
})