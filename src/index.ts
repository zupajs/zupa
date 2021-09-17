import fs from 'fs';
import { Project } from './project';
import { logger } from './log';

export async function main(defaultPackageFile = './project.js') {

	process.on('uncaughtException', function (e) {
		console.error('Heeeeee')
		console.error('uncaughtException', e)
	});

	let exitCode = 0;

	try {
		if (fs.existsSync(defaultPackageFile)) {

			const project = new Project(defaultPackageFile);

			await project.load();

			await project.run();
		}
		else {
			throw new Error(`No ${defaultPackageFile} found in current folder: ${process.cwd()}`)
		}
	}
	catch (e: any) {
		// TODO 27-Aug-2021/zslengyel: get exitCode from error if possible
		exitCode = 1;

		logger.error({
			message: e.message,
			data: {
				cause: e
			}
		})
	}
	finally {
		// eslint-disable-next-line no-process-exit
		process.exit(exitCode)
	}
}
