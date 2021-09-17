project(({ tasks, project }) => {

	tasks($ => {

		$('info').handle(async () => {

			const { branch } = await putBranch(project);

			return {
				project: project.pluginPath.replace(process.cwd(), '.'),
				...branch
			};

		}).preferOutputTransform('tree');

	})

});


async function putBranch(plugin) {
	const branch = {};


	if (plugin.children.length > 0) {
		branch.plugins = {};

		for (const child of plugin.children) {
			const { branch: subBranch, id: subId } = await putBranch(child);

			branch.plugins[subId] = subBranch;
		}
	}

	if (plugin.definition.dependencies.length > 0) {
		await acquireValueOfArray(plugin.definition.dependencies, deps => {
			branch['dependencies'] = deps.flat().map(dep => {
				if (typeof dep === 'string') {
					return {
						packageName: dep,
						info: null
					};
				}
				else {
					return {
						packageName: `${dep.packageName}@${dep.version}`,
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

	let value;

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
