

export function groupBy<I>(collection: I[], mapper: (item: I) => string): Record<string, I[]> {

	const groups: Record<string, I[]> = {};

	for (const item of collection) {
		const group = mapper(item);

		if (!groups[group]) {
			groups[group] = [];
		}

		groups[group].push(item);
	}

	return groups;
}
