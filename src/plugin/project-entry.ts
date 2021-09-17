import { ProjectBuilder, ProjectEntry } from '../../zupa';

export function createProjectEntry(): {
	project: ProjectEntry,
	resolver: Promise<ProjectBuilder>
} {

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	let projectBuilderGiven: (b: ProjectBuilder) => void = () => {};

	const resolver = new Promise<ProjectBuilder>((res) => {
		projectBuilderGiven = res;
	})

	const project = (projectBuilder: ProjectBuilder) => {
		projectBuilderGiven(projectBuilder)
	};

	return {
		project, resolver
	}
}