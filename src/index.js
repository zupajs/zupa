const fs = require('fs')
const { resolve, dirname } = require('path')
const { loadPlugin } = require('./plugin-loader')
const { createProjectObject } = require("./project-object");
const { normalizePluginPath } = require("./paths");
const { attachOutput } = require("./output");

async function main(defaultPackageFile = './package.js') {

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
			throw new Error(`No package.js found in current folder: ${process.cwd()}`)
		}
	}
	catch (e) {
		// TODO 27-Aug-2021/zslengyel: get exitCode from error if possible
		exitCode = 1;

		if (projectObject && projectObject.log) {
			// TODO 16-Aug-2021/zslengyel: better error handling
			await projectObject.log.error(e.message + '\n\n' + e.stack)
		} else {
			throw e; // throw error towards as there is nothing that handles
		}

	}
	finally {
		if (projectObject) {
			await projectObject.events.emitSerial('finally')
			process.exit(exitCode)
		}
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

	await loadPlugin(project.__filename, project, {}, true);

	await project.events.emitSerial('prepare:after');
}

module.exports = {
	main
}