// const utils = require('./runtime.js')

import { utils } from './runtime.js'

export class Evalutor {
    constructor(params) {
        this.realm = new utils.Realm()
        this.globalObject = {}
        this.ecs = [new utils.ExecutionContext(this.realm, this.globalObject)]

    }
    evalute(node) {
        if (this[node.type]) {
            let r = this[node.type](node)
            return r
        }
    }
    Programe(node) {
        return this.evalute(node.children[0])
    }
    StatementList(node) {
        if (node.children.length === 1) {
            return this.evalute(node.children[0])
        } else {
            this.evalute(node.children[0])
            return this.evalute(node.children[1])
        }
    }
    Statement(node) {
        return this.evalute(node.children[0])
    }
    VariableDeclaration(node) {
        debugger;
        let runningEC = this.ecs[this.ecs.length - 1]
        runningEC.VariableEnvironment[node.children[1].name]
    }
    ExpressionStatement(node) {
        return this.evalute(node.children[0])
    }
    Expression(node) {
        return this.evalute(node.children[0])
    }
    AdditiveExpression(node) {
        if (node.children.length === 1) {
            return this.evalute(node.children[0])
        } else {
            // todo
        }
    }
    MultiplicativeExpression(node) {
        if (node.children.length === 1) {
            return this.evalute(node.children[0])
        } else {
            // todo
        }
    }
    PrimaryExpression(node) {
        if (node.children.length === 1) {
            return this.evalute(node.children[0])
        }
    }
    Literal(node) {
        return this.evalute(node.children[0])
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
        if (node.children[0].type === 'Identifier') {
            name = node.children[0].name
        } else if (node.children[0].type === 'StringLiteral') {
            name = this.evalute(node.children[0])
        }
        object.set(name, {
            value: this.evalute(node.children[2]),
            writable: true,
            enumerable: true,
            configable: true
        })
    }
    AssignmentExpression(node) {
        if (node.children.length === 1) {
            return this.evalute(node.children[0])
        }
        let left = this.evalute(node.children[0])
        let right = this.evalute(node.children[2])
        left.set(right)
    }
    LogicalORExpression(node){
        if (node.children.length === 1) {
            return this.evalute(node.children[0])
        }
        let res = this.evalute(node.children[0])
        if(res){
            return res
        }else{
            return this.evalute(node.children[2])
        }
    }
    LogicalANDExpression(node){
        if (node.children.length === 1) {
            return this.evalute(node.children[0])
        }
        let res = this.evalute(node.children[0])
        if(!res){
            return res
        }else{
            return this.evalute(node.children[2])
        }
    }
    LeftHandSideExpression(node){
        return this.evalute(node.children[0])
    }
    NewExpression(node){
        if (node.children.length === 1) {
            return this.evalute(node.children[0])
        }
        if(node.children.length === 2){
            let cls = this.evalute(node.children[1])
            return cls.construct()
            /*
            let object = this.realm.Object.construct()
            let cls = this.evalute(node.children[1])
            let result = cls.call(object)
            if(typeof result === 'object'){
                return result
            }else{
                return object
            }
            */
        }
    }
    CallExpression(node){
        if (node.children.length === 1) {
            return this.evalute(node.children[0])
        }
        if(node.children.length === 2){
            let func = this.evalute(node.children[0])
            let args = this.evalute(node.children[1])
            return func.call(args)
        }
    }
    MemberExpression(node){
        if (node.children.length === 1) {
            return this.evalute(node.children[0])
        }
        if (node.children.length === 3) {
            let obj = this.evalute(node.children[0]).get()
            let prop = obj.get(node.children[2].name)
            if("value" in prop){
                return prop.value
            }
            if("get"  in prop){
                return prop.get().call(obj)
            }
        }
    }
    Identifier(node) {
        let runningEC = this.ecs[this.ecs.length - 1]
        return new utils.Reference(
            runningEC.lexicalEnvironment,
            node.name
        )
    }

}

// node 
// module.exports = Evalutor
