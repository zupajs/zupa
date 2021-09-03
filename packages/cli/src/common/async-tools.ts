import { ValueProvider } from '../../zupa';

export type OptionalAsync<T> = ValueProvider<T> | undefined;

export async function acquireValueOf<T>(getter: OptionalAsync<T>, callback: (val: T) => Promise<void>): Promise<T | undefined> {

	if (!getter) {
		return undefined;
	}

	let value: T | null = null;

	if (typeof getter === 'function') {
		value = await (getter as Function)();
	}
	else {
		value = getter as T;
	}

	if (value !== null) {
		await callback(value)
	}

}