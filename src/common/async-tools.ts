import { ValueProvider } from '../../zupa';

export type OptionalAsync<T, Param = void> = ValueProvider<T, Param> | undefined;

export async function acquireValueOfArray<T, Param = void>(
	getters: OptionalAsync<T, Param>[],
	callback: (val: T[]) => Promise<void>,
	callbackParams: any[] = []
) {

	const getterPromises = getters.map(getter => {
		return new Promise<T>(res => {
			acquireValueOf<T, Param>(getter, async (val) => {
				res(val)
			}, callbackParams)
		})
	});

	const values = await Promise.all(getterPromises);

	await callback(values);

}

export async function acquireValueOf<T, Param = void>(
	getter: OptionalAsync<T, Param>,
	callback: (val: T) => Promise<void>,
	callbackParams: any[] = []
) {

	if (!getter) {
		return undefined;
	}

	let value: T | null = null;

	if (typeof getter === 'function') {
		value = await ((getter as Function).apply(null, callbackParams));
	}
	else {
		value = getter as T;
	}

	if (value !== null) {
		await callback(value)
	}

}