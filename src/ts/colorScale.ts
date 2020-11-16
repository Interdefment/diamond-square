import RGBColor from './rgbcolor';
import * as utils from './utils';
import { Canvas } from './canvas';

export interface IColorScalePoint {
	color: RGBColor;
	value: number;
}

export default class ColorScale {
	private legendColorHeight = 15;
	private legendWidth = 60;
	private max: number;
	private min: number;
	private colors: string[];

	constructor(private _points: IColorScalePoint[]) {
		this._points.sort((a, b) => a.value - b.value);
		this.max = this._points[this._points.length - 1].value;
		this.min = this._points[0].value;
		this.colors = [];
		for (let i = 0; i <= this.max - this.min; ++i) {
			this.colors.push(this.getColorString(i + this.min));
		}
	}

	public multiply(factor: number): void {
		for (const point of this._points) {
			point.value *= factor;
		}
	}

	public getFastColor(value: number): string {
		if (value <= this.min) {
			return this.colors[0];
		}
		if (value >= this.max) {
			return this.colors[this.colors.length - 1];
		}
		return this.colors[Math.floor(value) - this.min];
	}

	public getColor(value: number): RGBColor {
		const idx = utils.binary_search(this._points, (p: IColorScalePoint) => p.value < value);
		if (idx === 0) {
			return this._points[0].color.copy();
		}
		if (idx === this._points.length) {
			return this._points[this._points.length - 1].color.copy();
		}
		if (utils.isEqual(value, this._points[idx].value)) {
			return this._points[idx].color.copy();
		}
		const multiplier = (value - this._points[idx - 1].value) /
			(this._points[idx].value - this._points[idx - 1].value);
		// console.log(RGBColor.differenceAsArray(this._points[idx].color, this._points[idx - 1].color).map(v => v * multiplier));
		const deltaColor = RGBColor.differenceAsArray(this._points[idx].color, this._points[idx - 1].color)
			.map((v: number) => v * multiplier);
		return this._points[idx - 1].color.getIncreased(deltaColor);
	}

	public getColorString(value: number): string {
		return this.getColor(value).rgbaString();
	}

	public draw(canvas: Canvas): void {
		const margin = 6;
		const height = this._points.length * (this.legendColorHeight + 1) + margin * 2;
		const width = this.legendWidth;
		canvas.fillAbsoluteRect(1, 1, width, height, '#fff');
		const drawer = (point: IColorScalePoint, index: number) => {
			canvas.fillAbsoluteRect(
				margin,
				margin + (this._points.length - index - 1) * (this.legendColorHeight + 1),
				this.legendColorHeight * 2,
				this.legendColorHeight,
				point.color.rgbaString(),
			);
			canvas.fillText(
				point.value.toFixed(0),
				margin * 2 + this.legendColorHeight * 2,
				margin + (this._points.length - index - 1) * (this.legendColorHeight + 1) + 10,
				'12px',
				'#000'
			);
		};
		this._points.forEach(drawer);
	}
}