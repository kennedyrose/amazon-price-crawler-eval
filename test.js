'use strict'
const Nightmare = require('nightmare')
const browser = Nightmare()
const randomUa = require('random-ua')
const az = require('./index')

browser.useragent(randomUa.generate())
	.goto(az.url('B06VVNN8XV'))
	.evaluate(az.eval)
	.end()
	.then(res => console.log(JSON.stringify(JSON.parse(res), null, '\t')))
	.catch(console.error)