prepare(({ config }) => {

	config.patch({
		deps: {
			removePackageJson: false
		}
	})

})

define(({$}) => {

	$`test`.is('ava')

})