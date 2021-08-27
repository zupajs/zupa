const minIndent = string => {
	const match = string.match(/^[ \t]*(?=\S)/gm);

	if (!match) {
		return 0;
	}

	return match.reduce((r, a) => Math.min(r, a.length), Infinity);
};

function stripIndent(string) {
	const indent = minIndent(string);

	if (indent === 0) {
		return string;
	}

	const regex = new RegExp(`^[ \\t]{${indent}}`, 'gm');

	return string.replace(regex, '');
}

function createTestProject(testName) {

	const filename = testName.replace(/ /g, '_')

	const { basename, resolve } = require('path')
	const { mkdirSync, existsSync, rmdirSync, writeFileSync } = require('fs')
	const testBaseName = basename(filename)

	const projectsPath = resolve(process.cwd(), 'test_projects')
	const testProjectPath = resolve(projectsPath, `${testBaseName}_project`);

	if (existsSync(testProjectPath)) {

		rmdirSync(testProjectPath, { recursive: true })
	}
	mkdirSync(testProjectPath, { recursive: true })

	const volume = vol => {
		for (const [volumeFile, content] of Object.entries(vol)) {
			const volumeFilePath = resolve(testProjectPath, volumeFile)
			const stripped = stripIndent(content)
			writeFileSync(volumeFilePath, stripped, 'utf-8')
		}
	}

	return { path: testProjectPath, volume }
}

module.exports = {
	createTestProject
}