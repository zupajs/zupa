import fs from 'fs';
import { Project } from './project';

export async function main(defaultPackageFile = './package.js') {

	process.on('uncaughtException', function (e) {
		console.error('uncaughtException', e)
	});

	let exitCode = 0;
	let projectObject = null;

	try {
		if (fs.existsSync(defaultPackageFile)) {

			const project = new Project(defaultPackageFile);

			await project.load();

			await project.run();
		}
		else {
			throw new Error(`No package.js found in current folder: ${process.cwd()}`)
		}
	}
	catch (e) {
		// TODO 27-Aug-2021/zslengyel: get exitCode from error if possible
		exitCode = 1;

		//if (projectObject && projectObject.log) {
		//	// TODO 16-Aug-2021/zslengyel: better error handling
		//	await projectObject.log.error(e.message + '\n\n' + e.stack)
		//} else {
		//	throw e; // throw error towards as there is nothing that handles
		//}
		throw e;

	}
	finally {
		//if (projectObject) {
		//	await projectObject.events.emitSerial('finally')
		//	// eslint-disable-next-line no-process-exit
		//	process.exit(exitCode)
		//}
	}
}
