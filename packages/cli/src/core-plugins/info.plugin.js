project(({ dependencies, tasks, project, require }) => {

	dependencies([
		'treeify@1.1.0',
		'chalk@4.1.2'
	])

	tasks($ => {

		$('info').handle(async () => {

			const chalk = require('chalk')
			const { branch } = await putBranch(project, chalk);

			const treeify = require('treeify')

			return treeify.asTree({
				project: project.pluginPath.replace(process.cwd(), '.'),
				...branch
			}, true)
		});

	})

});


async function putBranch(plugin, chalk) {
	const branch = {};


	if (plugin.children.length > 0) {
		branch.plugins = {};

		for (const child of plugin.children) {
			const { branch: subBranch, id: subId } = await putBranch(child, chalk);

			branch.plugins[chalk.green(subId)] = subBranch;
		}
	}

	if (plugin.definition.dependencies.length > 0) {
		await acquireValueOfArray(plugin.definition.dependencies, deps => {
			branch['dependencies'] = deps.flat().map(dep => {
				if (typeof dep === 'string') {
					return {
						packageName: chalk.blue(dep),
						info: null
					};
				} else {
					return {
						packageName: chalk.blue(`${dep.packageName}@${dep.version}`),
						info: {
							registry: dep.registry
						}
					}
				}
			}).reduce((acc, dep) => {
				acc[dep.packageName] = dep.info;
				return acc;
			}, {})
		})
	}

	return { branch, id: plugin.id };
}

async function acquireValueOf(getter, callback) {

	if (!getter) {
		return undefined;
	}

	let value = null;

	if (typeof getter === 'function') {
		value = await (getter)();
	}
	else {
		value = getter;
	}

	if (value !== null) {
		await callback(value)
	}

}

async function acquireValueOfArray(getters, callback) {

	const getterPromises = getters.map(getter => {
		return new Promise(res => {
			acquireValueOf(getter, async (val) => {
				res(val)
			})
		})
	});

	const values = await Promise.all(getterPromises);

	await callback(values);
}
