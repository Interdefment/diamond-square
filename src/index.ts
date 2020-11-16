'use strict';
import "./index.html";
import './assets/styles/style.scss';

import Vector from './ts/vector';
import { Canvas, ICanvasOptions } from './ts/canvas';
import RGBColor from './ts/rgbcolor';

import { DiamondSquare } from './ts/ds';
import ColorScale from './ts/colorScale';

function createPointInput() {
	const count = document.querySelectorAll('.point-input-wrapper').length;
	const wrapper = document.createElement('div');
	wrapper.classList.value = 'input-wrapper point-input-wrapper';
	wrapper.innerHTML = `
		<input type="number" class="point" id="point-${count + 1}-x" value="0">
		<input type="number" class="point" id="point-${count + 1}-y" value="0">
		<input type="number" class="point" id="point-${count + 1}-value" value="0">
	`;
	document.querySelector('.points-wrapper').insertBefore(wrapper, document.querySelector('#add-point'));
}

function ds() {
	const canvasOptions: ICanvasOptions = {
		rootSelector: '#diamond-square',
		id: 'canvas',
		height: 500,
		width: 500,
		backgroundColor: '#ffffff'
	};
	const canvas = new Canvas(canvasOptions);
	// canvas.setOffset(new Vector(450, 450));
	const scalePoints = [
		{
			color: new RGBColor(43, 24, 115),
			value: -60,
		},
		{
			color: new RGBColor(30, 51, 128),
			value: -50,
		},
		{
			color: new RGBColor(12, 63, 139),
			value: -40,
		},
		{
			color: new RGBColor(5, 80, 150),
			value: -30,
		},
		{
			color: new RGBColor(5, 106, 174),
			value: -20,
		},
		{
			color: new RGBColor(6, 124, 190),
			value: -10,
		},
		{
			color: new RGBColor(3, 150, 222),
			value: -5,
		},
		{
			color: new RGBColor(0, 150, 0),
			value: 0,
		},
		{
			color: new RGBColor(90, 185, 0),
			value: 5,
		},
		{
			color: new RGBColor(100, 202, 0),
			value: 10,
		},
		{
			color: new RGBColor(255, 203, 20),
			value: 20,
		},
		{
			color: new RGBColor(252, 130, 20),
			value: 30,
		},
		{
			color: new RGBColor(220, 60, 0),
			value: 40,
		},
		{
			color: new RGBColor(180, 30, 0),
			value: 50,
		},
		{
			color: new RGBColor(160, 0, 0),
			value: 60,
		},
	];
	const scale = new ColorScale(scalePoints);
	let ds = new DiamondSquare(500, scale);
	function draw() {
		ds.draw(canvas);
	}

	const cursor = new Vector();

	canvas.element.addEventListener('mousedown', function (e) {
		cursor.x = e.clientX;
		cursor.y = e.clientY;
	});
	canvas.element.addEventListener('mouseup', function (e) {
		const dx = cursor.x !== null ? e.clientX - cursor.x : 0;
		const dy = cursor.x !== null ? cursor.y - e.clientY : 0;
		canvas.translate(new Vector(dx, dy));
		draw();
		cursor.x = null;
		cursor.y = null;
	});
	canvas.element.addEventListener('mouseleave', function (e) {
		cursor.x = null;
		cursor.y = null;
	});

	draw();


	document.querySelector('#add-point').addEventListener('click', createPointInput);
	document.querySelector('#render').addEventListener('click', () => {
		ds = new DiamondSquare(500, scale);
		draw();
	});
}
ds();