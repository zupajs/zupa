const test = require('ava')
const setup = require("../setup");

test('plugin define gets params', async t => {
	const { project, zupa } = setup(t)
	project.volume({
        './echo.plugin.js': `
        
            define(({ script, params }) => {
                
                script('echo', () => params.text)

            })

        `,
        './package.js': `
        
            prepare(({plugin}) => {
                plugin('./echo.plugin.js', {
                    text: "Hello"
                })
            })
        
        `
	})

	const res = await zupa(['echo'])

	t.is(res.stdout, "Hello");
})


test('plugin prepare gets params', async t => {
	const { project, zupa } = setup(t)
	project.volume({
        './echo.plugin.js': `
        
            prepare(({ config, params }) => {
                
                config.patch({
                    customValue: params.text
                })

            })

        `,
        './package.js': `
        
            prepare(({plugin}) => {
                plugin('./echo.plugin.js', {
                    text: "Hello"
                })
            })
        
        `
	})

	const res = await zupa(['config', 'get', '$.customValue'], {
        env: {
            ZUPA_customValue: 'Hello'
        }
    })

	t.is(res.stdout, "Hello");
})