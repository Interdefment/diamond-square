'use strict';


// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getValue<T>(object: any, propertyName: string, defaultValue?: T): T {
	if (!object || !(propertyName in object)) {
			return defaultValue;
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	const propertyValue = <T>object[propertyName];
	if (propertyValue === undefined) {
			return defaultValue;
	}

	return propertyValue;
}

export function randomValue(min: number, max: number): number {
	return min + Math.random() * (max - min);
}

// TODO: check addBasePoint
export function binary_search<T>(data: T[], comparator: (val: T) => boolean): number {
	let l = 0;
	let r = data.length;
	while (l < r) {
		const mid = Math.floor(l + (r - l) / 2);
		if (comparator(data[mid])) {
			l = mid + 1;
		} else {
			r = mid;
		}
	}
	return l;
}

export function isEqual(v1: number, v2: number, accuracy = 1e-5): boolean {
	return Math.abs(v1 - v2) < accuracy;
}


function seededRandomRenerator(seed: number) {
	let state = seed;
	const random = () => {
		return Math.random();
		state = Math.sin(state) * 10000;
		return state - Math.floor(state);
	}
	return {
		random
	};
}

export function seededRandom(seed: number) {
	const {
		random
	} = seededRandomRenerator(seed);
	const randomFloat = (min: number, max: number) => min + random() * (max - min);
	const randomInt = (min: number, max: number) => Math.floor(randomFloat(min, max));
	return {
		random,
		randomFloat,
		randomInt
	};
}

export function average(values: number[], replacer = (): number => 0): number {
	return values.reduce((sum, v) => sum + (v != undefined ? v : replacer()), 0) / values.length;
}


export function med(values: number[]): number {
	if(values.length ===0) return 0;
	values.sort((a, b) => a - b);
	const half = Math.floor(values.length / 2);
	if (values.length % 2)
		return values[half];

	return (values[half - 1] + values[half]) / 2.0;
}