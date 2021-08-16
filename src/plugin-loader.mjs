import { dirname, resolve } from "path";
import { createRequire } from "module";
import { log } from "./logging.mjs";
import chalk from "chalk";
import url from "url";
import { createPreparer } from "./preparer.mjs";
import { createDefiner } from "./definer.mjs";
import { createProjectObject } from "./project-object.mjs";
import { initPackageJson } from "./package-json.mjs";
import { fileURLToPath } from 'url';


const logColor = chalk.blueBright

export async function loadPlugin(pluginPath, inheritedProjectObject = null) {

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
		prepare(async ({plugin}) => {
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

