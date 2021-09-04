import { PluginHelper } from './plugin-helper';
import { ProjectBuilder, ProjectEntry } from '../zupa';

export function createProjectEntry(filepath: string, pluginHelper: PluginHelper): {
	project: ProjectEntry,
	resolver: Promise<ProjectBuilder>
} {


	//require(packageName: string) {
	//	const req = createRequire(pluginHelper.project.pluginAccess)
	//
	//	const alias = pluginHelper.findNpmPackageAlias(packageName)
	//
	//	return req(alias)
	//}

	let projectBuilderGiven: (b: ProjectBuilder) => void = () => {};
	const resolver = new Promise<ProjectBuilder>((res, rej) => {
		projectBuilderGiven = res;
	})

	const project = (projectBuilder: ProjectBuilder) => {
		projectBuilderGiven(projectBuilder)
	};

	return {
		project, resolver
	}
}