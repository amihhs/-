// const utils = require('./runtime.js')

import { 
    Reference, 
    Realm, 
    EnvironmentRecord, 
    ObjectEnvironmentRecord,
    CompletionRecord,
    ExecutionContext,
    JSValue,
    JSNumber,
    JSString,
    JSObject,
    JSBoolean,
    JSUndefined,
    JSNull,
    JSSymblo
 } from './runtime.js'

export class Evalutor {
    constructor(params) {
        this.realm = new Realm()
        this.globalObject = new JSObject
        this.globalObject.set("log", new JSObject)
        this.globalObject.get("log").call = args => {
           
            console.log(args)
        }
        this.ecs = [new ExecutionContext(this.realm, new ObjectEnvironmentRecord(this.globalObject), new ObjectEnvironmentRecord(this.globalObject) )]

    }
    evaluteModule(node) {
        let globalEC = this.ecs[0]
        let newEC = new ExecutionContext(
            this.realm,
            new EnvironmentRecord(globalEC.lexicalEnvironment),
            new EnvironmentRecord(globalEC.lexicalEnvironment)
        )
        this.ecs.push(newEC)
        let res = this.evalute(node)
        this.ecs.pop()
        return res
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
            let record = this.evalute(node.children[0])
            if(record.value == 'normal'){
                return this.evalute(node.children[1])
            }else{
                return record
            }
        }
    }
    Statement(node) {
        return this.evalute(node.children[0])
    }
    Block(node){
        if (node.children.length === 2) {
            return;
        }
        let runningEC = this.ecs[this.ecs.length - 1]
        let newEC = new ExecutionContext(
            runningEC.realm,
            new EnvironmentRecord(runningEC.lexicalEnvironment),
            runningEC.VariableEnvironment
        )
        this.ecs.push(newEC)
        let res = this.evalute(node.children[1])
        this.ecs.pop(newEC)
        return res

    }
    BreakStatement(node){
        return new CompletionRecord("break")
    }
    ContinueStatement(node){
        return new CompletionRecord("continue")
    }
    WhileStatement(node) {
        while(true){
            let condition = this.evalute(node.children[2])
            if (condition instanceof Reference) {
                condition = condition.get()
            }
            if (condition.toBoolean().value) {
                let record = this.evalute(node.children[4])
                if(record.value == 'continue'){
                    continue
                }
                if(record.value == 'break'){
                    return new CompletionRecord('normal')
                }
            }else{
                return new CompletionRecord('normal')
            }
        }
        
    }
    IfStatement(node) {
        let condition = this.evalute(node.children[2])
        if (condition instanceof Reference) {
            condition = condition.get()
        }
        if (condition.toBoolean().value) {
            return this.evalute(node.children[4])
        }
    }
    FunctionDeclaration(node){
        let name = node.children[1].name
        let code = node.children[node.children.length - 2]
        let func = new JSObject
        func.call = args => {
            let newEC = new ExecutionContext(
                this.realm,
                new EnvironmentRecord(func.environment),
                new EnvironmentRecord(func.environment)
            )
            this.ecs.push(newEC)
            this.evalute(code)
            this.ecs.pop()
        }
        let runningEC = this.ecs[this.ecs.length - 1]
        runningEC.lexicalEnvironment.add(name)
        runningEC.lexicalEnvironment.set(name, func)
        func.environment = runningEC.lexicalEnvironment
        return new CompletionRecord('normal')

    }
    VariableDeclaration(node) {
        let runningEC = this.ecs[this.ecs.length - 1]
        runningEC.lexicalEnvironment.add(node.children[1].name)
        return new CompletionRecord('normal', new JSUndefined);

    }
    ExpressionStatement(node) {
        let res = this.evalute(node.children[0])
        if(res instanceof Reference){
            res = res.get()
        }
        return new CompletionRecord('normal', res) 
    }
    Expression(node) {
        return this.evalute(node.children[0])
    }
    AdditiveExpression(node) {
        if (node.children.length === 1) {
            return this.evalute(node.children[0])
        }else if (node.children.length === 2) {  //负数
            let r = this.evalute(node.children[1])
            return new JSNumber( 0 - r.value)
        } else {
            let l = this.evalute(node.children[0])
            let r = this.evalute(node.children[2])
            if (l instanceof Reference) l = l.get()
            if (r instanceof Reference) r = r.get()
            if (node.children[1].type === '+') {
                return new JSNumber(l.value + r.value)
            }
            if (node.children[1].type === '-') {
                return new JSNumber(l.value - r.value)
            }
        }
    }
    MultiplicativeExpression(node) {
        if (node.children.length === 1) {
            return this.evalute(node.children[0])
        } else {
            let l = this.evalute(node.children[0])
            let r = this.evalute(node.children[2])
            if (l instanceof Reference) l = l.get()
            if (r instanceof Reference) r = r.get()
            if (node.children[1].type === '*') {
                return l * r
            }
            if (node.children[1].type === '/') {
                return l / r
            }
            if (node.children[1].type === '%') { //取余
                return l % r
            }
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
        return new JSNumber(node.value)
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
        return new JSString(result)

    }
    ObjectLiteral(node) {
        if (node.children.length === 2) {
            return {}
        } if (node.children.length === 3) {
            let object = new JSObject
            // object.prorotype = 
            this.PropertyList(node.children[1], object)
            return object
        }
    }
    BooleanLiteral(node){
        if(node.value === 'false')
            return new JSBoolean(false)
        else
            return new JSBoolean(true)
    }
    null(){
        return new JSNull(true)
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
    LogicalORExpression(node) {
        if (node.children.length === 1) {
            return this.evalute(node.children[0])
        }
        let res = this.evalute(node.children[0])
        if (res) {
            return res
        } else {
            return this.evalute(node.children[2])
        }
    }
    LogicalANDExpression(node) {
        if (node.children.length === 1) {
            return this.evalute(node.children[0])
        }
        let res = this.evalute(node.children[0])
        if (!res) {
            return res
        } else {
            return this.evalute(node.children[2])
        }
    }
    LeftHandSideExpression(node) {
        return this.evalute(node.children[0])
    }
    NewExpression(node) {
        if (node.children.length === 1) {
            return this.evalute(node.children[0])
        }
        if (node.children.length === 2) {
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
    CallExpression(node) {
        if (node.children.length === 1) {
            return this.evalute(node.children[0])
        }
        if (node.children.length === 2) {
            let func = this.evalute(node.children[0])
            let args = this.evalute(node.children[1])
            if (func instanceof Reference) {
                func = func.get()
            }
            return func.call(args)
        }
    }
    MemberExpression(node) {
        if (node.children.length === 1) {
            return this.evalute(node.children[0])
        }
        if (node.children.length === 3) {
            let obj = this.evalute(node.children[0]).get()
            let prop = obj.get(node.children[2].name)
            if ("value" in prop) {
                return prop.value
            }
            if ("get" in prop) {
                return prop.get().call(obj)
            }
        }
    }
    Identifier(node) {
        let runningEC = this.ecs[this.ecs.length - 1]
        return new Reference(
            runningEC.lexicalEnvironment,
            node.name
        )
    }
    Arguments(node){
        if(node.children.length == 2){
            return []
        }else{
            return this.evalute(node.children[1])
        }
    }
    ArgumentList(node){
        if(node.children.length == 1){
            let res = this.evalute(node.children[0])
            if (res instanceof Reference) {
                res = res.get()
            }
            return [res]
        }else{
            let res = this.evalute(node.children[2])
            if (res instanceof Reference) {
                res = res.get()
            }
            return this.evalute(node.children[0]).concat(res)
        }
    }

}

// node 
// module.exports = Evalutor
