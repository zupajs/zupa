const fs = require('fs')
const { resolve, dirname } = require('path')
const { loadPlugin } = require('./plugin-loader')
const { createProjectObject } = require("./project-object");
const { normalizePluginPath } = require("./paths");
const { attachOutput } = require("./output");

const defaultPackageFile = './package.js';

module.exports.main = async function main() {

	process.on('uncaughtException', function (e) {
		console.error('uncaughtException', e)
	});

	let exitCode = 0;
	let projectObject = null;

	try {
		if (fs.existsSync(defaultPackageFile)) {

			const filepath = resolve(defaultPackageFile)
			projectObject = await prepareProject(filepath);

			await loadPackageFile(projectObject)

			await projectObject.run()
		}
		else {
			console.error('No package.js found in current folder')
		}
	}
	catch (e) {
		// TODO 16-Aug-2021/zslengyel: better error handling
		await projectObject.log.error(e.message + '\n\n' + e.stack)

		// TODO 19-Aug-2021/zslengyel: fallback until logging works
		console.error(e);

		exitCode = 1;

	}
	finally {
		await projectObject.events.emitSerial('finally')

		process.exit(exitCode)
	}
}

async function prepareProject(filepath) {
	const pluginPath = normalizePluginPath(filepath);

	const __filename = resolve(pluginPath);
	const __dirname = dirname(pluginPath);

	const projectObject = await createProjectObject(__filename, __dirname)

	await attachOutput(projectObject)

	return projectObject;
}

async function loadPackageFile(project) {

	await loadPlugin(project.__filename, project, true);

	await project.events.emitSerial('prepare:after');
}