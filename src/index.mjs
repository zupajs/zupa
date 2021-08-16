import fs from 'fs';
import { resolve } from 'path'
import minimist from 'minimist'
import { log } from './logging.mjs'
import { loadPlugin } from "./plugin-loader.mjs";
import { updatePackageJson } from "./package-json.mjs";

let defaultPackageFile = './package.mjs';

export async function main() {
	if (fs.existsSync(defaultPackageFile)) {

		const filepath = resolve(defaultPackageFile)
		await importPath(filepath)
	}
}

const argv = minimist(process.argv.slice(2))

async function importPath(filepath, origin = filepath) {
	const projectObject = await loadPlugin(filepath);

	await projectObject.events.emitSerial('prepare:after');

	// TODO

	if (argv._.length > 0) {
		await projectObject.scriptRegistry.controller.run()
	}
	else {
		const pkg = projectObject.pkg
		await projectObject.dependencyRegistry.controller.addDepsToPackageJson(pkg)
		await updatePackageJson(pkg, projectObject.__dirname);

		await projectObject.dependencyRegistry.controller.installDeps()
	}

}