import { log } from "./logging.mjs";
import { loadPackageJson } from "./package-json.mjs";
import chalk from 'chalk'

export function createDefiner(projectObject) {
	let projectBuilder = null;

	return {
		define: function (pb) {
			projectBuilder = pb;
		},
		controller: {
			async run() {
				if (projectBuilder === null) {
					log(chalk.red('you should provide a callback in define() function.'))
					return;
				}

				await projectBuilder({
					pkg: projectObject.pkg,
					project: projectObject,
					log,
					...projectObject.scriptRegistry.api,
					...projectObject.dependencyRegistry.defineApi
				});
			}
		}
	}
}
