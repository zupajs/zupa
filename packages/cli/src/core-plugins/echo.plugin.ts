import { define, prepare } from '../../../core';

prepare(async () => {
	console.log('echo plugin prepare')
})

define(async ({ pkg, dep, devDep, $ }) => {

})