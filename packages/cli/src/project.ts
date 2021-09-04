import { PluginAccess, PluginWrapper } from './plugin-wrapper';
import { PackageManager } from './package-manager/package-manager';
import { Command } from 'commander';
import path from 'path';

export class Project extends PluginWrapper {

	protected _packageManager = new PackageManager();
	protected program: Command = new Command()
	private _commandResult: any = undefined;

	constructor(pluginAccess: PluginAccess) {
		super(null, pluginAccess);

	}

	async beforeLoad(): Promise<void> {
		super.beforeLoad();

		// FIXME 04-Sep-2021/zslengyel:
		await this.requirePlugin(new PluginWrapper(
			this,
			path.resolve(__dirname, './core-plugins/core-plugins.js')
		))

		this.program.version('1.0.0 TODO')

		this.program.showHelpAfterError(true)

		this.events.on('command:run:after', () => {
			console.log('result', this.commandResult)
		})

	}

	get packageManager() {
		return this._packageManager
	}

	async run() {

		// TODO 02-Sep-2021/zslengyel: this should be in other place

		await this.installDependencies();

		// FIXME 04-Sep-2021/zslengyel:
		//await this.treatCommands();

		this.allowDevMode();

		await this.events.emitSerial('command:run:before')

		await this.rootCommand().parseAsync()

		await this.events.emitSerial('command:run:after')
	}

	private allowDevMode() {
		if (process.env.NODE_ENV !== 'production') {
			// in development mode ts-node is used to execute. So --project flag is defined
			const allowUnknown = (program: Command) => {
				program.allowUnknownOption(true);
				program.commands.forEach(cmd => allowUnknown(cmd));
			};

			allowUnknown(this.program)
		}
	}

	private async installDependencies() {
		await this.packageManager.installDependencies();
	}

	public rootCommand(): Command {
		return this.program;
	}

	set commandResult(value: any) {
		this._commandResult = value;
	}

	get commandResult() {
		return this._commandResult;
	}

}
