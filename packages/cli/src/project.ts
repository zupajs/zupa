import { PluginWrapper } from './plugin/plugin-wrapper';
import { PackageManager } from './package-manager/package-manager';
import { Command } from 'commander';
import path from 'path';
import { RequireHelper } from './plugin/require-helper';
import { Project as ZupaProject } from '../zupa'
import { logger } from './log';
import chalk from 'chalk';

export class Project extends PluginWrapper implements ZupaProject {

	protected _packageManager = new PackageManager();
	protected program: Command = new Command()
	private _commandResult: any = undefined;

	public readonly requireHelper = new RequireHelper(this)

	constructor(pluginAccess: string) {
		super(null, pluginAccess);

		this.listenEvents();

		this.program.version('1.0.0 TODO')

		this.program.showHelpAfterError(true)

		this.program.configureOutput({
			writeOut(str: string) {
				logger.info(str);
			},

			writeErr(str: string) {
				logger.error(str)
			},

			outputError: (str, write) => write(chalk(str))

		})
	}

	private listenEvents() {
		this.events.on('load:before', async () => {
			await this.requirePlugin(new PluginWrapper(
				this,
				path.resolve(__dirname, './core-plugins/core-plugins.js')
			))
		})

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

		await this.treatCommands();

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
		await this.events.emitSerial('install:before')

		await this.packageManager.installDependencies();

		await this.events.emitSerial('install:after')
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
