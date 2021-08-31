import execa from 'execa';
import { join, parse } from 'path';

export async function compile(file: string): Promise<string> {

	try {
		await execa(`npx`,
			`-p typescript tsc --target esnext --lib esnext --module commonjs --moduleResolution node ${file}`.split(' '),
			{
				preferLocal: true,
				stdout: 'inherit',
				stderr: 'inherit',
				env: {
					npm_config_yes: 'true'
				}
			}
		);

		const { dir, name } = parse(file);

		return join(dir, name + '.js')

	}
	catch (e) {
		console.error(e);
		throw e;
	}


}