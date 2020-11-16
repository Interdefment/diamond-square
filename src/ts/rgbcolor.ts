'use strict';

export default class RGBColor {
	private r: number;
	private g: number;
	private b: number;
	private alpha: number;
	constructor(
		r: number,
		g: number,
		b: number,
		alpha = 1
	) {
		this.R = r;
		this.G = g;
		this.B = b;
		this.A = alpha;
	}
	public hexString(): string {
		return '#' + this.r.toString(16).padStart(2, '0') +
			this.g.toString(16).padStart(2, '0') +
			this.b.toString(16).padStart(2, '0');
	}
	public rgbString(): string {
		return `rgb(${this.r}, ${this.g}, ${this.b},)`;
	}
	public rgbaString(): string {
		return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.alpha})`;
	}

	get R(): number {
		return this.r;
	}
	set R(value: number) {
		this.r = this.correctValue(value);
	}
	get G(): number {
		return this.g;
	}
	set G(value: number) {
		this.g = this.correctValue(value);
	}
	get B(): number {
		return this.b;
	}
	set B(value: number) {
		this.b = this.correctValue(value);
	}
	get A(): number {
		return this.alpha;
	}
	set A(value: number) {
		if (value < 0) {
			this.alpha = 0
		} else if (value > 1) {
			this.alpha = 1;
		} else {
			this.alpha = Math.floor(value);
		}
	}

	private correctValue(value: number): number {
		if (value < 0) {
			value = 0;
		}
		if (value > 255) {
			value = 255;
		}
		return Math.floor(value);
	}

	public copy(): RGBColor {
		return new RGBColor(this.r, this.g, this.b, this.alpha);
	}

	/** Returns new object */
	public getMultipled(value: number | number[]): RGBColor {
		const newColor = this.copy();
		newColor.multiply(value);
		return newColor;
	}

	/** Returns new object */
	public getIncreased(value: number | number[] | RGBColor): RGBColor {
		const newColor = this.copy();
		newColor.increase(value);
		return newColor;
	}

	public increase(value: number | number[] | RGBColor): RGBColor {
		if (typeof value === 'number') {
			this.R = this.r + value;
			this.G = this.g + value;
			this.B = this.b + value;
		} else if ('length' in value) {
			if (value[0]) {
				this.R = this.r + value[0];
			}
			if (value[1]) {
				this.G = this.g + value[1];
			}
			if (value[2]) {
				this.B = this.b + value[2];
			}
		} else {
			this.R = this.r + value.r;
			this.G = this.g + value.g;
			this.B = this.b + value.b;
		}
		return this;
	}

	public multiply(value: number | number[]): RGBColor {
		if (typeof value === 'number') {
			this.R = this.r * value;
			this.G = this.g * value;
			this.B = this.b * value;
		} else {
			if (value[0]) {
				this.R = this.r * value[0];
			}
			if (value[1]) {
				this.G = this.g * value[1];
			}
			if (value[2]) {
				this.B = this.b * value[2];
			}
		}
		return this;
	}

	public static parseString(str: string): RGBColor {
		str = str.trim();
		if (str.indexOf('#') === 0) {
			const hex3Match = /^#([0-9a-f]{3})$/i.exec(str);
			if (hex3Match) {
				return new RGBColor(
					parseInt(hex3Match[1].charAt(0), 16),
					parseInt(hex3Match[1].charAt(1), 16),
					parseInt(hex3Match[1].charAt(2), 16)
				);
			}
			const hex6Match = /^#([0-9a-f]{6})$/i.exec(str);
			if (hex6Match) {
				return new RGBColor(
					parseInt(hex6Match[1].substr(0, 2), 16),
					parseInt(hex6Match[1].substr(2, 2), 16),
					parseInt(hex6Match[1].substr(4, 2), 16),
				);
			}
			const hex8Match = /^#([0-9a-f]{8})$/i.exec(str);
			if (hex8Match) {
				return new RGBColor(
					parseInt(hex8Match[1].substr(0, 2), 16),
					parseInt(hex8Match[1].substr(2, 2), 16),
					parseInt(hex8Match[1].substr(4, 2), 16),
					parseInt(hex8Match[1].substr(6, 2), 16) / 255 * 100,
				);
			}
		}
		const rgbMatches = /^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i.exec(str);
		if (rgbMatches) {
			return new RGBColor(+rgbMatches[1], +rgbMatches[2], +rgbMatches[3]);
		}
		const rgbaMatches = /^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i.exec(str);
		if (rgbaMatches) {
			return new RGBColor(+rgbaMatches[1], +rgbaMatches[2], +rgbaMatches[3], +rgbaMatches[4]);
		}
		throw new Error('Invalid color string format');
	}

	public static difference(c1: RGBColor, c2: RGBColor, useAlpha = false): RGBColor {
		if (useAlpha) {
			return new RGBColor(c1.r - c2.r, c1.g - c2.g, c1.b - c2.b, c1.alpha - c2.alpha);
		}
		return new RGBColor(c1.r - c2.r, c1.g - c2.g, c1.b - c2.b)
	}

	public static differenceAsArray(c1: RGBColor, c2: RGBColor, useAlpha = false): number[] {
		if (useAlpha) {
			return [
				c1.r - c2.r,
				c1.g - c2.g,
				c1.b - c2.b,
				c1.alpha - c2.alpha,
			]
		}
		return [
			c1.r - c2.r,
			c1.g - c2.g,
			c1.b - c2.b,
		];
	}
}