const { resolve } = require('path')
const fs = require('fs')

function resolvePackageJsonPath(__dirname) {
	return resolve(__dirname, 'package.json');
}

function updatePackageJson(pkg, __dirname) {

	const packageJsonPath = resolvePackageJsonPath(__dirname)
	const pkgString = JSON.stringify(pkg, null, 4);
	fs.writeFileSync(packageJsonPath, pkgString, 'utf-8')
}

module.exports = {
	updatePackageJson
}