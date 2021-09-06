import { ValueProvider } from '../../zupa';

export type OptionalAsync<T> = ValueProvider<T> | undefined;

export async function acquireValueOfArray<T>(getters: OptionalAsync<T>[], callback: (val: T[]) => Promise<void>) {

	const getterPromises = getters.map(getter => {
		return new Promise<T>(res => {
			acquireValueOf(getter, async (val) => {
				res(val)
			})
		})
	});

	const values = await Promise.all(getterPromises);

	await callback(values);

}

export async function acquireValueOf<T>(getter: OptionalAsync<T>, callback: (val: T) => Promise<void>) {

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