const utils = require('./runtime.js')


class evalute {
    constructor(params) {
        this.realm = new utils.Realm()
        this.ecx = [new utils.ExecutionContext]
    }
    evalute(node) {
        if (evalutor[node.type]) {
            let r = evalutor[node.type](node)
            // console.log(r)
            return r
        }
    }
    Programe(node) {
        return evalute(node.children[0])
    }
    StatementList(node) {
        if (node.children.length === 1) {
            return evalute(node.children[0])
        } else {
            evalute(node.children[0])
            return evalute(node.children[1])
        }
    }
    Statement(node) {
        return evalute(node.children[0])
    }
    VariableDeclaration(node) {
        console.log('declare variable ' + node.children[1].name)
        let runningEC = esx[esx.length - 1]
        runningEC.VariableEnvironment[node.children[1].name]
    }
    ExpressionStatement(node) {
        return evalute(node.children[0])
    }
    Expression(node) {
        return evalute(node.children[0])
    }
    AdditiveExpression(node) {
        if (node.children.length === 1) {
            return evalute(node.children[0])
        } else {
            // todo
        }
    }
    MultiplicativeExpression(node) {
        if (node.children.length === 1) {
            return evalute(node.children[0])
        } else {
            // todo
        }
    }
    PrimaryExpression(node) {
        if (node.children.length === 1) {
            return evalute(node.children[0])
        }
    }
    Literal(node) {
        return evalute(node.children[0])
    }
    NumberLiteral(node) {

        let str = node.value
        let l = str.length
        let val = 0
        let n = 10
        if (str.match(/^0b/)) {
            n = 2
            l -= 2
        } else if (str.match(/^0x/)) {
            n = 16
            l -= 2
        } else if (str.match(/^0o/)) {
            n = 8
            l -= 2
        }
        while (l--) {
            let c = str.charCodeAt(str.length - l - 1);
            if (c >= 'a'.charCodeAt(0)) {
                c = c - 'a'.charCodeAt(0) + 10
            } else if (c >= 'A'.charCodeAt(0)) {
                c = c - 'A'.charCodeAt(0) + 10
            } else if (c >= '0'.charCodeAt(0)) {
                c = c - '0'.charCodeAt(0)
            }
            val = val * n + c
        }
        // console.log(val)
        return Number(node.value)
    }
    StringLiteral(node) {
        // console.log(node)
        let i = 1
        let result = []
        for (let i = 1; i < node.value.length - 1; i++) {
            if (node.value[i] === '\\') {
                ++i
                let c = node.value[i]
                let map = {
                    "\"": "\"",
                    "\'": "\'",
                    "\\": "\\",
                    "0": String.fromCharCode(0x0000),
                    "b": String.fromCharCode(0x0008),
                    "f": String.fromCharCode(0x000C),
                    "n": String.fromCharCode(0x000A),
                    "r": String.fromCharCode(0x000D),
                    "t": String.fromCharCode(0x0009),
                    "v": String.fromCharCode(0x000B),
                }
                if (c in map) {
                    result.push(map[c])
                }
            } else {
                result.push(node.value[i])
            }
        }
        // console.log(result)
        return result.join('')

    }
    ObjectLiteral(node) {
        if (node.children.length === 2) {
            return {}
        } if (node.children.length === 3) {
            let object = new Map()
            // object.prorotype = 
            this.PropertyList(node.children[1], object)
            return object
        }
    }
    PropertyList(node, object) {
        if (node.children.length === 1) {
            this.Property(node.children[0], object)
        } else {
            this.PropertyList(node.children[0], object)
            this.Property(node.children[2], object)
        }
    }
    Property(node, object) {
        let name
        if (node.children.type === 'Identifier') {
            name = node.children[0].name
        } else if (node.children.type === 'StringLiteral') {
            name = evalute(node.children[0])
        }
        object.set(name, {
            value: evalute(node.children[2]),
            writable: true,
            enumerable: true,
            configable: true
        })
    }
    AssignmentExpression(node) {
        if (node.children.length === 1) {
            return evalute(node.children[0])
        }
        let left = evalute(node.children[0])
        let right = evalute(node.children[2])
        left.set(right)
    }
    Identifier(node) {
        let runningEC = ecx[ecx.length - 1]
        return new utils.Reference(
            runningEC.lexicalEnvironment,
            node.name
        )
    }

}

module.exports = evalute