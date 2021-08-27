const tap = require('tap')
const { createTestProject } = require("./test-utils");
const { resolve } = require("path");
const execa = require("execa");

tap.beforeEach(t => {
	const { path, volume } = createTestProject(t.name, {})

	t.project = {
		path,
		volume(vol) {
			volume(vol)
		}
	};

	t.zupa = async (args = [], opts = {}) => {
		const zupa = resolve(process.cwd(), './zupa.js');
		const res = await execa(zupa, args, {
			cwd: t.project.path,
			...opts
		})
		return res;
	}
})