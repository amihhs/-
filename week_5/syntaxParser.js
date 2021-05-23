// import { scan } from './lexParser.js'
// node 执行当前文件
const scan = require('./lexParser.js')


let syntax = {
    Programe: [['StatementList', 'EOF']],
    StatementList: [['Statement'], ['StatementList', 'Statement']],
    Statement: [['ExpressionStatement'], ['IfStatement'], ['VariableDeclaration'], ['FunctionDeclaration']],

    IfStatement: [['if', '(', 'Expression', ')', 'Statement']],
    VariableDeclaration: [['var', 'Identifier', ';'], ['let', 'Identifier', ';']],
    FunctionDeclaration: [['function', 'Identifier', '(', ')', '{', 'StatementList', '}']],

    ExpressionStatement: [['Expression', ';']],
    Expression: [['AdditiveExpression']],
    AdditiveExpression: [['MultiplicativeExpression'], ['AdditiveExpression', '+', 'MultiplicativeExpression'], ['AdditiveExpression', '-', 'MultiplicativeExpression']],
    MultiplicativeExpression: [['PrimaryExpression'], ['MultiplicativeExpression', '*', 'PrimaryExpression'], ['MultiplicativeExpression', '/', 'PrimaryExpression']],
    PrimaryExpression: [['(', 'Expression', ')'], ['Number'], ['Identifier'], ['Literal']],
    Literal: [['Number'], ['String'], ['Boolean'], ['Null'], ['RegularExpression']]
}

let hash = {}
function closure(state) {
    hash[JSON.stringify(state)] = state
    let queue = []
    for (let symbol in state) {
        if (symbol.match(/^\$/)) return
        queue.push(symbol)
    }
    while (queue.length) {
        let symbol = queue.shift()
        // console.log(symbol)
        if (syntax[symbol]) {
            for (let rule of syntax[symbol]) {
                if (!state[rule[0]])
                    queue.push(rule[0])
                let current = state
                for (let part of rule) {
                    if (!current[part]) {
                        current[part] = {}
                    }
                    current = current[part]
                }
                current.$reduceType = symbol
                current.$reduceLength = rule.length
            }
        }
    }
    for (let symbol in state) {
        if (symbol.match(/^\$/)) return
        // console.log(state[symbol])
        if (hash[JSON.stringify(state[symbol])])
            state[symbol] = hash[JSON.stringify(state[symbol])]
        else closure(state[symbol])
    }
}
let end = {
    $isEnd: true
}

let start = {
    'Programe': end
}
closure(start)

function parse(source) {

    let stack = [start]
    let symbolStack = []
    function reduce() {
        let state = stack[stack.length - 1]
        if (state.$reduceType) {
            let children = []
            for (let i = 0; i < state.$reduceLength; i++) {
                stack.pop()
                children.push(symbolStack.pop())
            }
            // create a non-terminal symbol
            return {
                type: state.$reduceType,
                children: children.reverse()
            }
        }else{
            throw new Error('unexpected token')
        }
    }
    function shift(symbol) {
        let state = stack[stack.length - 1]
        if (symbol.type in state) {
            stack.push(state[symbol.type])
            symbolStack.push(symbol)
        } else {
            // reduce to non-terminal symbol
            shift(reduce())
            shift(symbol)
        }
    }

    for (let symbol /* terminal symbol */ of scan(source)) {
        // console.log(symbol)
        shift(symbol)
    }

    return reduce()
}

let evalutor = {
    Programe(node){
        return evalute(node.children[0])
    },
    StatementList(node){
        if(node.children.length === 1){
            return evalute(node.children[0])
        }else{
            evalute(node.children[0])
            return evalute(node.children[1])
        }
    },
    Statement(node){
        return evalute(node.children[0])
    },
    VariableDeclaration(node){
        console.log('declare variable ' + node.children[1].name)
    },
    EOF(){
        return null
    }
}

function evalute(node){
    if(evalutor[node.type]){
        return evalutor[node.type](node)
    }
}


let source = `
    let a;
    let b;
`

let node = parse(source)

evalute(node)