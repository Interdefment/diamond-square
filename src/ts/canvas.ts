'use strict';
import Vector from './vector';
import * as utils from './utils';

export interface ICanvasOptions {
	rootSelector: string;
	id?: string;
	width?: number;
	height?: number;
	scale?: number;
	offset?: Vector;
	backgroundColor?: string;
	borderColor?: string;
	borderWidth?: number;
}

const DeafultWidth = 800;
const DeafultHeight = 400;
const DeafultId = '';
const DeafultScale = 1;
const DefaultOffset = new Vector();
const DefaultBackgroundColor = 'rgb(255, 255, 255)';
const DefaultBorderColor = 'rgb(0, 0, 0)';
const DefaultBorderWidth = 2;

export class Canvas {
	private $rootElement: HTMLElement;
	private $element: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;

	private _scale: number;
	private _offset: Vector;

	private width: number;
	private height: number;

	private _backgroundColor: string;
	private _borderColor: string;
	private _borderWidth: number;


	constructor(options: ICanvasOptions) {
		this.$rootElement = document.querySelector(options.rootSelector);

		this.width = utils.getValue<number>(options, 'width', DeafultWidth);
		this.height = utils.getValue<number>(options, 'height', DeafultHeight);
		this._scale = utils.getValue<number>(options, 'scale', DeafultScale);
		this._offset = utils.getValue<Vector>(options, 'scale', DefaultOffset);
		this._backgroundColor = utils.getValue<string>(options, 'backgroundColor', DefaultBackgroundColor);
		this._borderColor = utils.getValue<string>(options, 'borderColor', DefaultBorderColor);
		this._borderWidth = utils.getValue<number>(options, 'borderWidth', DefaultBorderWidth);

		this.createElement(options);
		this.ctx = this.$element.getContext('2d');
		this.clear();
	}

	/**
	 * Creates canvas html element inside given root element
	 */
	private createElement(options: ICanvasOptions) {
		this.$element = document.createElement('canvas');
		this.$element.width = this.width;
		this.$element.height = this.height;
		this.$element.id = utils.getValue<string>(options, 'id', DeafultId);
		this.$rootElement.appendChild(this.$element);
	}

	public scaleValue(value: number): number {
		return value * this._scale;
	}

	public scaleVector(v: Vector): Vector {
		return new Vector(v.x * this._scale, v.y * this._scale);
	}

	public clear(): void {
		this.ctx.fillStyle = this._backgroundColor;
		this.ctx.fillRect(0, 0, this.width, this.height);
		this.ctx.strokeStyle = this._borderColor;
		this.ctx.lineWidth = this._borderWidth;
		this.ctx.strokeRect(0, 0, this.width, this.height);
	}

	private getX(value: number): number {
		return this._offset.x + this._scale * value;
	}
	private getY(value: number): number {
		return this.height - (this._offset.y + this._scale * value);
	}
	private getXV(point: Vector): number {
		return this._offset.x + this._scale * point.x;
	}
	private getYV(point: Vector): number {
		return this.height - (this._offset.y + this._scale * point.y);
	}

	public lineV(p1: Vector, p2: Vector): void {
		if (!this.checkPoint(p1) && this.checkPoint(p2)) {
			return;
		}
		this.ctx.moveTo(this.getXV(p1), this.getYV(p1));
		this.ctx.lineTo(this.getXV(p2), this.getYV(p2));
	}

	public moveTo(x: number, y: number): void {
		this.ctx.moveTo(this.getX(x), this.getY(y));
	}
	public lineTo(x: number, y: number): void {
		this.ctx.lineTo(this.getX(x), this.getY(y));
	}

	public moveToV(point: Vector): void {
		this.ctx.moveTo(this.getXV(point), this.getYV(point));
	}
	public lineToV(point: Vector): void {
		this.ctx.lineTo(this.getXV(point), this.getYV(point));
	}

	public fillCirlce(center: Vector, radius: number, color: string): void {
		this.ctx.beginPath();
		this.ctx.fillStyle = color;
		this.ctx.ellipse(this.getXV(center), this.getYV(center), radius, radius, Math.PI * 2, 0, Math.PI * 2);
		this.ctx.fill();
	}

	public fillSquare(x: number, y: number, size: number, color: string): void {
		this.ctx.fillStyle = color;
		this.ctx.fillRect(this.getX(x), this.getY(y), size, size);
	}

	public fillRect(x: number, y: number, width: number, height: number, color: string): void {
		this.ctx.fillStyle = color;
		this.ctx.fillRect(this.getX(x), this.getY(y), width, height);
	}

	public fillAbsoluteRect(x: number, y: number, width: number, height: number, color: string): void {
		this.ctx.fillStyle = color;
		this.ctx.fillRect(x, y, width, height);
	}

	public fillText(text: string, x: number, y: number, font: string, color: string): void {
		this.ctx.fillStyle = color;
		this.ctx.font = font;
		this.ctx.fillText(text, x, y);
	}

	public setPointColor(x: number, y: number, color: string): void {
		this.ctx.fillStyle = color;
		this.ctx.fillRect(this.getX(x), this.getY(y), this._scale, this._scale);
	}

	public setCursor(style: string): void {
		this.$element.style.cursor = style;
	}

	public setOffset(value: Vector): void {
		this._offset = value.copy();
	}

	public beginPath(): void {
		this.ctx.beginPath();
	}
	public fill(color: string = DefaultBorderColor): void {
		this.ctx.fillStyle = color;
		this.ctx.fill();
	}
	public stroke(color: string = DefaultBorderColor, width = 1): void {
		this.ctx.strokeStyle = color;
		this.ctx.lineWidth = width;
		this.ctx.stroke();
	}
	public checkPoint(point: Vector): boolean {
		return point.x >= 0 && point.x <= this.width
			&& point.y >= 0 && point.y <= this.height;
	}
	set scale(value: number) {
		this._scale = value;
	}
	get scale(): number {
		return this._scale;
	}

	public translateX(value: number): void {
		this._offset.addX(value);
	}
	public translateY(value: number): void {
		this._offset.addY(value);
	}
	public translate(value: Vector): void {
		this._offset.addX(value.x);
		this._offset.addY(value.y);
	}

	get element(): HTMLCanvasElement {
		return this.$element;
	}
	/**
	 * Returns vector in px with the beggining at bottom left corner
	 */
	public getCursorVector(x: number, y: number): Vector {
		return new Vector(
			x - this.$element.offsetLeft,
			this.height - (y - this.$element.offsetTop)
		)
	}

	public getRenderBoundaries(): Vector[] {
		return [
			new Vector(-this._offset.x, -this._offset.y),
			new Vector(-this._offset.x + this.width, -this._offset.y + this.height),
		]
	}

	private smooth = false;

	public toggleSmoothing() {
		this.smooth = !this.smooth;
    this.ctx.imageSmoothingEnabled = this.smooth;
    // this.ctx.mozImageSmoothingEnabled = this.smooth;
    // this.ctx.webkitImageSmoothingEnabled = this.smooth;
    // this.ctx.msImageSmoothingEnabled = this.smooth;
  }
}