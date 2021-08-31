import { project } from '../../core';

export async function index() {

	await import('./core-plugins/echo.plugin')

	project.prepares.forEach((prepareCb: any) => {
		prepareCb()
	})
}