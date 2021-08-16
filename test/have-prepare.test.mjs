import test from 'ava'
import execa from "execa";
import { resolve } from 'path'

const cwd = process.cwd();

test('loads package.mjs from project', async (t) => {

	process.chdir(resolve(cwd, 'examples/projectA'))

	const std = await execa('zupa.mjs', ['--verbose'], {
		extendEnv: true,
		stdin: 'inherit',
		env: {
			PATH: `${cwd}:${process.env.PATH}`
		}
	})

	t.deepEqual(std.exitCode, 0);
});
