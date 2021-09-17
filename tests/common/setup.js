const { createTestProject } = require("./test-utils");
const { resolve } = require("path");
const execa = require("execa");

module.exports = function (t) {

	const { path, volume } = createTestProject(t.title, {})

	const project = {
		path,
		volume(vol) {
			volume(vol)
		}
	};

	const zupa = async (args = [], opts = {}) => {
		const nodeJs = process.argv[0]
		const zupa = resolve(__dirname, '../../dist/zupa.js');

		const res = await execa(nodeJs, [zupa, ...args], {
			cwd: path,
			...opts,
		})
		return res;
	}

	return {
		project, zupa
	}
}