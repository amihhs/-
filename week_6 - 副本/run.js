const evalute = require('./evalute')
const parse = require('./syntaxParser')


console.log(evalute)
console.log(parse)
let source = `a;`
let node = parse(source)
evalute(node)