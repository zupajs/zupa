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

const { basename, resolve } = require('path')
const { mkdirSync, existsSync, rmdirSync, writeFileSync } = require('fs')

const projectsPath = resolve(__dirname, '..', '..', 'test_projects');

function createTestProject(testName) {

	const filename = testName.replace(/ /g, '_')

	const testBaseName = basename(filename)

	const testProjectPath = resolve(projectsPath, `${testBaseName}_project`);

	if (existsSync(testProjectPath)) {

		rmdirSync(testProjectPath, { recursive: true })
	}
	mkdirSync(testProjectPath, { recursive: true })

	const volume = (vol, basePath = testProjectPath) => {

		for (const [volumeFile, content] of Object.entries(vol)) {
			// handle dirs
			if (typeof content === 'object') {
				mkdirSync(resolve(basePath, volumeFile), {
					recursive: true
				});

				volume(content, resolve(basePath, volumeFile));

			} else {
				// handle files

				const volumeFilePath = resolve(basePath, volumeFile)
				const strippedContent = stripIndent(content)
				writeFileSync(volumeFilePath, strippedContent, 'utf-8')
			}
		}
	}

	return { path: testProjectPath, volume }
}

module.exports = {
	createTestProject
}