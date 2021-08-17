
function shortenPath(baseDir, projectPath) {
	return projectPath.replace(baseDir, '')
}

module.exports = {
	shortenPath
}