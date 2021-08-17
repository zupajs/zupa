import fs from 'fs';
import { resolve } from 'path'
import minimist from 'minimist'
import { log } from './logging.mjs'
import { loadPlugin } from "./plugin-loader.mjs";

let defaultPackageFile = './package.mjs';

export async function main() {
	try {
		if (fs.existsSync(defaultPackageFile)) {

			const filepath = resolve(defaultPackageFile)
			const projectObject = await importPath(filepath)

			await projectObject.run()
		}
	}
	catch (e) {
		// TODO 16-Aug-2021/zslengyel: better error handling
		log.error(e.message)
	}
}

async function importPath(filepath, origin = filepath) {

	const projectObject = await loadPlugin(filepath);

	await projectObject.events.emitSerial('prepare:after');

	return projectObject;

}