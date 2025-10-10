export function setExcept<T>(set: ReadonlySet<T>, other: ReadonlySet<T>): Set<T> {
	const difference = new Set<T>();
	set.forEach((value: T) => {
		if (!other.has(value)) {
			difference.add(value);
		}
	});

	return difference;
}

export function setUnion<T>(set: ReadonlySet<T>, other: ReadonlySet<T>): Set<T> {
	const union = new Set<T>();
	set.forEach((value: T) => { union.add(value); });
	other.forEach((value: T) => { union.add(value); });

	return union;
}

export function setFilter<T>(set: ReadonlySet<T>, filter: (value: T) => boolean): Set<T> {
	const ret = new Set<T>();
	set.forEach(v => { if (filter(v)) ret.add(v); });

	return ret;
}

export function setFromArray<T>(array: ArrayLike<T>, filter?: (value: T) => boolean): Set<T> {
	const ret = new Set<T>();
	for (let i = 0, n = array.length; i < n; i++) {
		const element = array[i];

		if (filter == null || filter(element)) {
			ret.add(array[i]);
		}
	}
	return ret;
}

export function setToArray<T>(set: ReadonlySet<T>): T[] {
	const ret = new Array<T>(set.size);
	let i = 0;
	set.forEach((v) => { ret[i++] = v; });
	return ret;
}
