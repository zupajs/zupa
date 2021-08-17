const execa = require('execa')
const { resolve } = require('path')
const fs = require('fs')
const { log } = require('./logging')

async function initPackageJson(__dirname) {
	await execa('npm', ['init', '-y'], {
		cwd: __dirname
	})
}

function resolvePackageJsonPath(__dirname) {
	return resolve(__dirname, 'package.json');
}

async function loadPackageJson(__dirname) {
	const packagePath = resolvePackageJsonPath(__dirname);

	if (fs.existsSync(packagePath)) {
		return JSON.parse(fs.readFileSync(packagePath, 'utf-8'))
	}

	throw new Error('package.json does not exist')
}

async function updatePackageJson(pkg, __dirname) {

	const packageJsonPath = resolvePackageJsonPath(__dirname)
	log('Update', packageJsonPath)

	const pkgString = JSON.stringify(pkg, null, 4);
	fs.writeFileSync(packageJsonPath, pkgString, 'utf-8')
}

module.exports = {
	initPackageJson,
	resolvePackageJsonPath,
	updatePackageJson,
	loadPackageJson
}