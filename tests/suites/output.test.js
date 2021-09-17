// TODO 13-Sep-2021/zslengyel: raw
// TODO 13-Sep-2021/zslengyel: table
// TODO 13-Sep-2021/zslengyel: json
// TODO 13-Sep-2021/zslengyel: json:pretty

const test = require('ava');
const setup = require('../common/setup');

test('tool support none output format and does not print anything', async t => {
	const { project, zupa } = setup(t)

	project.volume({
		'./project.js': ``
	})

	const res = await zupa(['tasks', '--output', 'none'])

	t.is(res.exitCode, 0);
	t.is(res.stdout, '');
})

test('tool enables adding custom output format', async t => {
	const { project, zupa } = setup(t)

	const formatName = 'myformat'

	project.volume({
		'./project.js': `
			project(({ configure, tasks }) => {
			
				function formatter(logRecord) {
					return 'myformat: ' + logRecord.message;
				}
				
				configure({
					output: {
						formatters: {
							${formatName}: formatter
						}
					}
				})
				
				tasks(task => {
					task('hoo').handle(() => 'hoo').preferOutputTransform('${formatName}')
				})
				
			})
		`
	})

	const res = await zupa(['hoo'])

	t.is(res.exitCode, 0);
	t.is(res.stdout, 'myformat: hoo');
})