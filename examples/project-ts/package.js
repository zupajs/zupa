
//eslint-disable-next-line no-undef
exports.default = class extends Plugin {

	async onPrepare() {
		console.log('loaded: prepare')
		await super.onPrepare()
	}

	async onLoad() {
		console.log('loaded: main')
		await super.onLoad()
	}

}