const fs = require('fs')
const { resolve } = require('path')
const { log } = require('./logging')
const { loadPlugin } = require('./plugin-loader')

const defaultPackageFile = './package.js';

module.exports.main = async function main() {
	let exitCode = 0;
	let projectObject = null;

	try {
		if (fs.existsSync(defaultPackageFile)) {

			const filepath = resolve(defaultPackageFile)

			projectObject = await loadPackageFile(filepath)

			await projectObject.run()
		}
	}
	catch (e) {
		// TODO 16-Aug-2021/zslengyel: better error handling
		log.error(e.message + '\n\n' + e.stack)
		exitCode = 1;

	} finally {
		await projectObject.events.emitSerial('finally')

		process.exit(exitCode)
	}
}

async function loadPackageFile(filepath) {

	const projectObject = await loadPlugin(filepath);

	await projectObject.events.emitSerial('prepare:after');

	return projectObject;

}