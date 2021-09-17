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

test('tool support json output', async t => {
	const { project, zupa } = setup(t)

	const result = {
		some: 'value'
	}

	project.volume({
		'./project.js': `
		project(({ tasks }) => {
			tasks($ => {
				$('foo').handle(() => {
					return ${JSON.stringify(result)};
				})
			})
		})
		`
	})

	const res = await zupa(['foo', '--output', 'json'])

	t.is(res.exitCode, 0);
	t.is(res.stdout, JSON.stringify(result));
})

test('tool support json:pretty output', async t => {
	const { project, zupa } = setup(t)

	const result = {
		some: 'value'
	}

	project.volume({
		'./project.js': `
		project(({ tasks }) => {
			tasks($ => {
				$('foo').handle(() => {
					return ${JSON.stringify(result)};
				})
			})
		})
		`
	})

	const res = await zupa(['foo', '--output', 'json:pretty'])

	t.is(res.exitCode, 0);
	t.is(res.stdout, JSON.stringify(result, null, 2));
})

test('tool support table output', async t => {
	const { project, zupa } = setup(t)

	const result = {
		some: 'value'
	}

	project.volume({
		'./project.js': `
		project(({ tasks }) => {
			tasks($ => {
				$('foo').handle(() => {
					return ${JSON.stringify(result)};
				})
			})
		})
		`
	})

	const res = await zupa(['foo', '--output', 'table'])

	t.is(res.exitCode, 0);
	t.is(res.stdout, `KEY        VALUE
some       value`);
})

test('tool support raw output', async t => {
	const { project, zupa } = setup(t)

	project.volume({
		'./project.js': `
		project(({ tasks }) => {
			tasks($ => {
				$('foo').handle(() => {
					return 'foo';
				})
			})
		})
		`
	})

	const res = await zupa(['foo', '--output', 'raw'])

	t.is(res.exitCode, 0);
	t.is(res.stdout, 'foo');
})

test('tool support tree output', async t => {
	const { project, zupa } = setup(t)

	project.volume({
		'./project.js': `
		project(({ tasks }) => {
			tasks($ => {
				$('foo').handle(() => {
					return {
						name: 'name',
						children: [1,2]
					};
				})
			})
		})
		`
	})

	const res = await zupa(['foo', '--output', 'tree'])

	t.is(res.exitCode, 0);
	t.is(res.stdout, `├─ name: name
└─ children
   ├─ 0: 1
   └─ 1: 2
`);
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