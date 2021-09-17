import { Project } from '../project';
import { PluginWrapper } from './plugin-wrapper';

export class ProjectAware {

	constructor(public readonly parent: PluginWrapper | null) {}

	get project(): Project {

		if (this.parent === null) {
			return (this as unknown as Project);
		}

		return this.parent.project;
	}
}