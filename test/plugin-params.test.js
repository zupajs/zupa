const tap = require('tap')
require('./setup')

tap.test('plugin define gets params', async t => {
	t.project.volume({
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

	const res = await t.zupa(['echo'])

	t.equal(res.stdout, "Hello");
})


tap.test('plugin prepare gets params', async t => {
	t.project.volume({
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

	const res = await t.zupa(['config get customValue'], {
        env: {
            ZUPA_customValue: 'Hello'
        }
    })

	t.equal(res.stdout, "Hello");
})