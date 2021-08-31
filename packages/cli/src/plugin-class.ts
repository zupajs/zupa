
export interface Plugin {
	onPrepare(): Promise<void>;
	onLoad(): Promise<void>;
}

export function createPluginClass(filepath: string) {

	const Plugin = class implements Plugin {

		async onPrepare() {
			console.log('Plugin.onPrepare')
		}

		async onLoad() {
			console.log('Plugin.onLoad')
		}

		filepath(): string {
			return filepath;
		}

		name(): string {
			return this.filepath()
		}

	}

	return Plugin;
}