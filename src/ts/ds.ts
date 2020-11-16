'use strict';

import { Canvas } from './canvas';
import Vector from './vector';
import RGBColor from './rgbcolor';
import * as utils from './utils';
import ColorScale from './colorScale';

interface IMap {
	[index: string]: number;
}
interface IChunk {
	heights: number[][];
}

export class DiamondSquare {
	private map: IMap;
	private outside: number;
	private min = Infinity;
	private max = -Infinity;
	private random: (min: number, max: number) => number;
	// private start: Vector;
	// private end: Vector;
	private chunkSize: number;
	private R: number;
	private filterWindow: number;

	private parsePoints() {
		const points = document.querySelectorAll('.point-input-wrapper');
		for (let i = 0; i < points.length; ++i) {
			const x: number = +document.querySelector<HTMLInputElement>(
				`#point-${i + 1}-x`
			).value;
			const y: number = +document.querySelector<HTMLInputElement>(
				`#point-${i + 1}-y`
			).value;
			const h: number = +document.querySelector<HTMLInputElement>(
				`#point-${i + 1}-value`
			).value;
			this.set(x, y, h);
		}
	}

	constructor(width: number, private colorScale: ColorScale) {
		this.random = utils.seededRandom(
			+document.querySelector<HTMLInputElement>('#seed').value
		).randomFloat;
		this.chunkSize =
			2 ** +document.querySelector<HTMLInputElement>('#chunk-size').value;
		this.outside = +document.querySelector<HTMLInputElement>('#base-height')
			.value;
		this.filterWindow = +document.querySelector<HTMLInputElement>('#filter')
			.value;
		this.R = +document.querySelector<HTMLInputElement>('#R').value;
		const count = Math.ceil(width / this.chunkSize);
		// this.start = new Vector();
		// this.end = new Vector(count * this.chunkSize, count * this.chunkSize);
		this.map = {};
		this.parsePoints();
		for (let i = 0; i < count; ++i) {
			for (let j = 0; j < count; ++j) {
				this.generateChunk(i * this.chunkSize, j * this.chunkSize, false);
			}
		}
		for (let i = 0; i < count; ++i) {
			for (let j = 0; j < count; ++j) {
				this.filterChunk(i * this.chunkSize, j * this.chunkSize);
			}
		}
	}

	private getChunkCoordinates(x: number, y: number): Vector {
		return new Vector(
			Math.floor(x / this.chunkSize) * this.chunkSize,
			Math.floor(y / this.chunkSize) * this.chunkSize
		);
	}

	private get(x: number, y: number): number {
		return this.map[`${x}_${y}`];
	}

	private set(x: number, y: number, value: number): void {
		this.map[`${x}_${y}`] = value;
	}

	public draw(canvas: Canvas): void {
		const boundaries = canvas.getRenderBoundaries();
		console.time('draw');
		for (let i = boundaries[0].x; i <= boundaries[1].x; ++i) {
			for (let j = boundaries[0].y; j <= boundaries[1].y; ++j) {
				const height = this.get(i, j);
				if (height === undefined) {
					const chunk = this.getChunkCoordinates(i, j);
					this.generateChunk(chunk.x, chunk.y);
				} else canvas.setPointColor(i, j, this.colorScale.getFastColor(height));
			}
		}
		console.timeEnd('draw');
		this.colorScale.draw(canvas);
	}

	private filterChunk(x: number, y: number) {
		this.filterX(x, y, this.filterWindow);
		this.filterX(x + this.chunkSize, y, this.filterWindow);
		this.filterY(x, y, this.filterWindow);
		this.filterY(x + this.chunkSize, y, this.filterWindow);
	}

	private generateChunk(x: number, y: number, checkNeighboors = true) {
		this.setInitialValue(x, y);
		this.setInitialValue(x, y + this.chunkSize);
		this.setInitialValue(x + this.chunkSize, y);
		this.setInitialValue(x + this.chunkSize, y + this.chunkSize);
		this.step(x, y, this.chunkSize);
		if (checkNeighboors) {
			const half = this.chunkSize / 2;
			const chunks = [
				{ x: x - half, y: y + half + this.chunkSize },
				{ x: x + half, y: y + half + this.chunkSize },
				{ x: x + half + this.chunkSize, y: y + half + this.chunkSize },
				{ x: x + half + this.chunkSize, y: y + half },
				{ x: x + half + this.chunkSize, y: y - half },
				{ x: x + half, y: y - half },
				{ x: x - half, y: y - half },
				{ x: x - half, y: y + half },
			];
			for (const point of chunks) {
				if (this.get(point.x, point.y) == undefined) {
					const chunk = this.getChunkCoordinates(point.x, point.y);
					this.generateChunk(chunk.x, chunk.y, false);
				}
			}
			this.filterChunk(x, y);
		}
	}

	private setInitialValue(x: number, y: number): void {
		if (this.get(x, y) !== undefined) {
			return;
		}
		this.set(x, y, this.random(this.random(-50, 0), this.random(0, 50)));
	}

	private step(x: number, y: number, size: number) {
		const half = size / 2;
		if (half < 1) {
			return;
		}

		for (let i = x + half; i <= x + this.chunkSize; i += size) {
			for (let j = y + half; j <= y + this.chunkSize; j += size) {
				this.square(i, j, half);
			}
		}

		let odd = true;
		for (let i = x; i <= x + this.chunkSize; i += half) {
			for (let j = y + half * +odd; j <= y + this.chunkSize; j += size) {
				this.diamond(i, j, half);
			}
			odd = !odd;
		}
		this.step(x, y, half);
	}

	private square(x: number, y: number, size: number) {
		if (this.get(x, y) !== undefined) {
			return;
		}
		const value =
			this.average([
				this.get(x - size, y - size),
				this.get(x - size, y + size),
				this.get(x + size, y - size),
				this.get(x + size, y + size),
			]) +
			this.R * size * 1 * this.random(-1, 1);
		this.set(x, y, value);
		this.max = Math.max(this.max, value);
		this.min = Math.min(this.min, value);
	}

	private diamond(x: number, y: number, size: number) {
		if (this.get(x, y) !== undefined) {
			return;
		}
		const value =
			this.average([
				this.get(x - size, y),
				this.get(x, y - size),
				this.get(x + size, y),
				this.get(x, y + size),
			]) +
			this.R * size * 1 * this.random(-1, 1);
		this.set(x, y, value);
		this.max = Math.max(this.max, value);
		this.min = Math.min(this.min, value);
	}

	private average(values: number[]) {
		return (
			values.reduce((sum, v) => sum + (v != undefined ? v : this.outside), 0) /
			values.length
		);
	}

	private filterX(x: number, y: number, w: number) {
		const half = Math.floor(w / 2);
		for (let i = x + 1; i < x + this.chunkSize; ++i) {
			for (let j = y - half; j < y; ++j) {
				this.set(i, j, this.collectMed(i, j, w));
			}
			for (let j = y + half; j > y; --j) {
				this.set(i, j, this.collectMed(i, j, w));
			}
		}
		for (let i = x; i <= x + this.chunkSize; ++i) {
			this.set(i, y, this.collectMed(i, y, w));
		}
	}

	private filterY(x: number, y: number, w: number) {
		const half = Math.floor(w / 2);
		for (let i = y + 1; i < y + this.chunkSize; ++i) {
			for (let j = x - half; j < x; ++j) {
				this.set(j, i, this.collectMed(j, i, w));
			}
			for (let j = x + half; j > x; --j) {
				this.set(j, i, this.collectMed(j, i, w));
			}
		}
		for (let i = y; i <= y + this.chunkSize; ++i) {
			this.set(x, i, this.collectMed(x, i, w));
		}
	}

	private collectMed(x: number, y: number, w: number): number {
		const half = Math.floor(w / 2);
		const values = [];
		for (let i = x - half; i <= x + half; ++i) {
			for (let j = y - half; j <= y + half; ++j) {
				values.push(this.get(i, j));
			}
		}
		return this.med(values);
	}

	private collectAvg(x: number, y: number, w: number): number {
		const half = Math.floor(w / 2);
		const values = [];
		for (let i = x - half; i <= x + half; ++i) {
			for (let j = y - half; j <= y + half; ++j) {
				values.push(this.get(i, j));
			}
		}
		return this.average(values);
	}

	// private increaseHorizontal(dir: number) {
	// 	const x = dir > 0 ? this.end.x : this.start.x - this.chunkSize;
	// 	if (dir > 0) {
	// 		this.end.x += this.chunkSize;
	// 	} else {
	// 		this.start.x -= this.chunkSize;
	// 	}
	// 	for (let k = 0; k < Math.abs(dir); ++k) {
	// 		for (let i = this.start.y; i < this.end.y; i += this.chunkSize) {
	// 			this.generateChunk(x, i, false);
	// 		}
	// 	}
	// }

	// private increaseVertical(dir: number) {
	// 	const y = dir > 0 ? this.end.y : this.start.y - this.chunkSize;
	// 	if (dir > 0) {
	// 		this.end.y += this.chunkSize;
	// 	} else {
	// 		this.start.y -= this.chunkSize;
	// 	}
	// 	for (let k = 0; k < Math.abs(dir); ++k) {
	// 		for (let i = this.start.x; i < this.end.x; i += this.chunkSize) {
	// 			this.generateChunk(i, y, false);
	// 		}
	// 	}
	// }

	private med(values: number[]) {
		if (values.length === 0) return 0;
		values.sort((a, b) => a - b);
		const half = Math.floor(values.length / 2);
		if (values.length % 2) return values[half];

		return (values[half - 1] + values[half]) / 2.0;
	}
}
