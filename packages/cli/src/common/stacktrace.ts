
export function getCallerSourcePos(level = 3): { line: number; pos: number; } {

	const stackError = new Error('get stack')
	const stack = stackError.stack!;
	const callerLineCharCodes = stack.split('\n')[level].split(':')

	return {
		line: parseInt(callerLineCharCodes[1]),
		pos: parseInt(callerLineCharCodes[2])
	}
}