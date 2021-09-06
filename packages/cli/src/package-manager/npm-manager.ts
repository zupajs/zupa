import execa from 'execa';
import path from 'path';
import fs from 'fs';
import { logger } from '../log';

interface PackageListDetail {
	version: string;
	resolved: string;
}

interface PackageList {
	name: string;
	dependencies: Record<string, PackageListDetail>
}

export interface Package {
	alias: string;
	packageName: string;
	version: string;
}

export class NpmManager {

	private installedPackageList!: PackageList;

	async prepare() {

		await this.acquireInstalledPackageList()

		// npm will install packages in current folder, if node_modules is already present
		const nmPath = path.resolve(process.cwd(), 'node_modules')
		if (!fs.existsSync(nmPath)) {
			fs.mkdirSync(nmPath)
		}

		//let packageJsonPath = path.resolve(process.cwd(), 'package.json');
		//if (fs.existsSync(packageJsonPath)) {
		//	fs.rmSync(packageJsonPath)
		//}
	}

	async install(desiredPackages: Package[], registry?: string) {

		await this.prepare();

		const packages = await this.findMissingPackages(desiredPackages)

		if (packages.length === 0) {
			logger.info('Packages ar up to date', desiredPackages)
			return;
		}

		const args = [];

		args.push('install')
		args.push('--silent')
		//args.push('--no-save')
		//args.push('--no-package-lock')

		args.push(...packages.map(pack => {

			const aliasPrefix = `${pack.alias}@npm:`

			return `${aliasPrefix}${pack.packageName}@${pack.version}`;
		}))

		if (registry) {
			args.push(`--registry=${registry}`)
		}

		const installProcess = execa('npm', args, {
			preferLocal: true
		})

		installProcess?.stdout?.pipe(process.stdout);

		await installProcess;

	}

	private async findMissingPackages(desiredPackages: Package[]) {
		const packageList = await this.acquireInstalledPackageList()
		const installedDeps = Object.entries(packageList.dependencies)

		const isPackInstalled = (pack: Package) => {
			const foundPackage = installedDeps.find(([alias, detail]) => {
				// TODO 03-Sep-2021/zslengyel: more granular check
				return alias === pack.alias;
			})
			return !!foundPackage;
		}

		return desiredPackages.filter(pack => !isPackInstalled(pack))
	}

	private async acquireInstalledPackageList() {
		if (!this.installedPackageList) {
			const res = await execa('npm', ['list', '--json'], {
				preferLocal: true,
				stdout: 'pipe'
			})

			this.installedPackageList = JSON.parse(res.stdout) as PackageList;
		}
		return this.installedPackageList
	}

	public async getAvailableVersions(packageName: string) {
		const res = await execa('npm', ['view', packageName, '--json', 'versions'], {
			preferLocal: true,
			stdout: 'pipe'
		})

		return JSON.parse(res.stdout) as string[];
	}
}