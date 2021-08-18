const { resolve } = require('path')
const fs = require('fs')
const { log } = require('./logging')

function resolvePackageJsonPath(__dirname) {
	return resolve(__dirname, 'package.json');
}

async function loadPackageJson(__dirname) {
	return {}
	const packagePath = resolvePackageJsonPath(__dirname);

	if (fs.existsSync(packagePath)) {
		return JSON.parse(fs.readFileSync(packagePath, 'utf-8'))
	}

	// FIXME
	//throw new Error('package.json does not exist')
}

function updatePackageJson(pkg, __dirname) {

	//const packageJsonPath = resolvePackageJsonPath(__dirname)
	//log('Update', packageJsonPath)
	//
	//const pkgString = JSON.stringify(pkg, null, 4);
	//fs.writeFileSync(packageJsonPath, pkgString, 'utf-8')
}

module.exports = {
	resolvePackageJsonPath,
	updatePackageJson,
	loadPackageJson
}