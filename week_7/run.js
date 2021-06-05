// const Evalutor = require('./evalute')
// const parse = require('./syntaxParser')


import { Evalutor } from './evalute.js'
import { parse } from './syntaxParser.js'

// ndoe
// let source = `3 || 2;`
// let node = parse(source)
// let ev = new Evalutor()
// ev.evalute(node)

// 浏览器

document.getElementById('run').addEventListener('click', e => {
    let r = new Evalutor().evalute(parse(document.getElementById('source').value))
    console.log(r)
})