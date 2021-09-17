export function parsePackageName(dep: string): {
	packageName: string;
	version: string;
} {
	let packageName, version;

	if (dep.startsWith('@')) {
		const parts = dep.substr(1).split('@')
		packageName = '@' + parts[0];
		version = parts[1];
	}
	else {
		const parts = dep.split('@')
		packageName = parts[0];
		version = parts[1];
	}

	return {
		packageName, version
	}
}