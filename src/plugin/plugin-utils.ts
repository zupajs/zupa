
const pluginIdSeparator = '#';

export function parsePluginPath(path: string) {

	if (path.includes(pluginIdSeparator)) {
		const parts = path.split(pluginIdSeparator);
		return {
			id: parts[0].trim(),
			path: parts[1].trim()
		}
	}else {
		return {
			id: undefined,
			path
		};
	}

}