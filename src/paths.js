
function shortenPath(baseDir, projectPath, replace = '') {
	return projectPath.replace(baseDir, replace)
}

module.exports = {
	shortenPath
}