const test = require('ava')
const { parseCommandName } = require("../../src/commands");

test('parseCommandName recognizes simple command name', t => {

	const { commandName, commandArgs } = parseCommandName('meow')

	t.is(commandName, 'meow')
	t.deepEqual(commandArgs, new Map())

})

test('parseCommandName recognizes simple command with single arg', t => {

	const { commandName, commandArgs } = parseCommandName('meow <name>')

	t.is(commandName, 'meow')
	t.deepEqual(commandArgs, new Map([
		['name', { required: true }]
	]))

})

test('parseCommandName recognizes simple command with multiple args', t => {

	const { commandName, commandArgs } = parseCommandName('meow <name> <age> <home>')

	t.is(commandName, 'meow')
	t.deepEqual(commandArgs, new Map([
		['name', { required: true }],
		['age', { required: true }],
		['home', { required: true }],
	]))

})

test('parseCommandName recognizes root command', t => {
	const { commandName, commandArgs } = parseCommandName('')

	t.is(commandName, '')
	t.deepEqual(commandArgs, new Map())
})

test('parseCommandName refuses empty strint', t => {
	t.throws(() => parseCommandName('*'))
	t.throws(() => parseCommandName(']dfd'))
	t.throws(() => parseCommandName('{3r'))
	t.throws(() => parseCommandName('+f_'))
})