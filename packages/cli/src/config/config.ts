import rc from 'rc';
import merge from 'deepmerge';
import minimist from 'minimist';

const argv = minimist<Config>(process.argv.slice(2))

export interface Config {
	commands: {
		default: string;
	};
	output: {
		forceTTYMode: boolean;
	};
	deps: {
		removePackageJson: boolean;
	},
	log: {
		verbose: boolean
	},

	[key: string]: unknown;
}

const defaultConfig: Config = {
	commands: {
		default: ''
	},
	output: {
		forceTTYMode: false
	},
	deps: {
		removePackageJson: true
	},
	log: {
		verbose: false
	}
}

export class ConfigStore {

	private config: Config = rc('zupa', defaultConfig, argv)

	get(): Config {
		return { ...this.config };
	}

	patch(partialConfig: Partial<Config>) {
		this.config = merge(this.config, partialConfig);
	}
}

export const configStore = new ConfigStore();