import { dirname, resolve } from "path";
import { createRequire } from "module";
import { log } from "./logging.mjs";
import chalk from "chalk";
import url, { fileURLToPath } from "url";
import { createPreparer } from "./preparer.mjs";
import { createDefiner } from "./definer.mjs";
import { createProjectObject } from "./project-object.mjs";
import { initPackageJson } from "./package-json.mjs";
import { existsSync, lstatSync } from 'fs'

const logColor = chalk.blueBright

function normalizePluginpath(pluginPath) {
	if (lstatSync(pluginPath).isDirectory()) {

		const indexOptions = ['index.mjs', 'index.js'];
		let recommendedPluginPath = pluginPath;

		indexOptions.forEach(indexOption => {
			const option = resolve(pluginPath, indexOption);
			if (existsSync(option)) {
				recommendedPluginPath = option
			}
		})
		if (pluginPath === recommendedPluginPath) {
			throw new Error(`Cannot resolve plugin folder index file: ${pluginPath}`)
		}
		return recommendedPluginPath;
	}

	return pluginPath
}

export async function loadPlugin(originalPluginPath, inheritedProjectObject = null) {

	const pluginPath = normalizePluginpath(originalPluginPath);

	log(logColor(`Loading plugin ${pluginPath}`))

	let __filename = resolve(pluginPath)
	let __dirname = dirname(pluginPath)

	let require = createRequire(pluginPath)

	const isRootPlugin = inheritedProjectObject === null;
	let projectObject = inheritedProjectObject;
	if (isRootPlugin) {
		await initPackageJson(__dirname)
		projectObject = await createProjectObject(__filename, __dirname)

	}
	let { prepare, controller: prepareController } = createPreparer(projectObject, __dirname, loadPlugin);

	let { define, controller: defineController } = createDefiner(projectObject);

	if (isRootPlugin) {
		const scriptDirName = dirname(fileURLToPath(import.meta.url));
		prepare(async ({ plugin }) => {
			await plugin(resolve(scriptDirName, './core-plugins/index.mjs'))
		});
		await prepareController.run();

	}

	Object.assign(global, {
		__filename,
		__dirname,
		require,
		prepare,
		define,
		log,
		chalk
	});

	await import(url.pathToFileURL(pluginPath));

	await prepareController.run()
	await defineController.run()

	return projectObject;
}
