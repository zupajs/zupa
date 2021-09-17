import rc from 'rc';
import merge from 'deepmerge';
import minimist from 'minimist';
import { Config } from '../../zupa';

const argv = minimist<Config>(process.argv.slice(2))

const defaultConfig: Config = {
	tasks: {
		default: ''
	},
	output: {
		formatters: {}
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