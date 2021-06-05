class ExecutionContext {
    constructor(realm, lexicalEnvironment, VariableEnvironment) {
        VariableEnvironment = VariableEnvironment || lexicalEnvironment
        this.lexicalEnvironment = lexicalEnvironment
        this.VariableEnvironment = VariableEnvironment
        this.realm = realm
    }
}

class EnvironmentRecord {
    constructor(outer) {
        this.outer = outer
        this.variables = new Map()
    }
    add(name) {
        this.variables.set(name, new JSUndefined)
    }
    get(name) {
        if (this.variables.has(name)) {
            return this.variables.get(name)
        } else if (this.outer) {
            return this.outer.get(name)
        } else {
            return JSUndefined
        }
    }
    set(name, value = new JSUndefined) {
        if (this.variables.has(name)) {
            return this.variables.set(name,value)
        } else if (this.outer) {
            return this.outer.set(name,value)
        } else {
            return this.variables.set(name, value)
        }
    }

}
class ObjectEnvironmentRecord {
    constructor(object,outer) {
        this.outer = outer
        this.object = object
    }
    add(name) {
        this.object.set(name, new JSUndefined)
    }
    get(name) {
       return this.object.get(name)
    }
    set(name,  value = new JSUndefined) {
        this.object.set(name, value)
    }

}
class CompletionRecord {
    constructor(value, type, target) {
        this.value = value || 'normal'
        this.type = type || new JSUndefined
        this.target = target || null
    }

}

class Reference {
    constructor(object, property) {
        this.object = object
        this.property = property
    }
    set(v) {
        this.object.set(this.property, v)
    }
    get() {
        return this.object.get(this.property)
    }
}

class Realm {
    constructor() {
        this.global = new Map()
        this.object = new Map()
        this.object_prototype = new Map()
    }
}

class JSValue {
    get type() {
        if (this.constructor === JSNumber) {
            return 'number'
        }
        if (this.constructor === JSString) {
            return 'string'
        }
        if (this.constructor === JSBoolean) {
            return 'boolean'
        }
        if (this.constructor === JSObject) {
            return 'object'
        }
        if (this.constructor === JSNull) {
            return 'null'
        }
        if (this.constructor === JSSymblo) {
            return 'symbol'
        }
        return 'undefined'
    }
}

class JSNumber extends JSValue {
    constructor(value) {
        super()
        this.memory = new ArrayBuffer(8)
        if (arguments.length) {
            new Float64Array(this.memory)[0] = value
        } else {
            new Float64Array(this.memory)[0] = 0
        }
    }
    get value() {
        return new Float64Array(this.memory)[0]
    }
    toString() {

    }
    toNumber() {
        return this
    }
    toBoolean() {
        if (new Float64Array(this.memory)[0] === 0) {
            return new JSBoolean(false)
        } else {
            return new JSBoolean(true)
        }
    }
}

class JSString extends JSValue {
    constructor(characters) {
        super()
        // this.memory = new ArrayBuffer(characters.length * 2)
        this.characters = characters
    }
    toString() {
        return this
    }
    toNumber() {

    }
    toBoolean() {
        if (this.characters.length === 0) {
            return new JSBoolean(false)
        } else {
            return new JSBoolean(true)
        }
    }
}

class JSObject extends JSValue {
    constructor(proto) {
        super()
        this.properties = new Map()
        this.prototype = proto || null
    }
    set(name, value) {
        this.setprorerty(name, {
            value: value,
            enumerable: true,
            configurable: true,
            writeable: true
        })
    }
    get(name) {
       return this.getprorerty(name).value
    }
    setprorerty(name, attr) {
        this.properties.set(name, attr)
    }
    getprorerty(name) {
        return this.properties.get(name)
    }
    setprototype(proto) {
        this.prototype = proto
    }
    getprorertype() {
        return this.prototype
    }
}

class JSBoolean extends JSValue {
    constructor(value) {
        super()
        this.value = value || false
    }
    toString() {
        if (this.value) {
            return new JSString(['t', 'r', 'u', 'e'])
        } else {
            return new JSNumber(['f', 'a', 'l', 's', 'e'])
        }

    }
    toNumber() {
        if (this.value) {
            return new JSNumber(1)
        } else {
            return new JSNumber(0)
        }
    }
    toBoolean() {
        return this
    }
}

class JSUndefined extends JSValue {
    toString() {
        return new JSString(['u', 'n', 'd', 'e', 'f', 'i', 'n', 'e', 'd'])
    }
    toNumber() {
        return new JSNumber(NaN)
    }
    toBoolean() {
        return new JSBoolean(false)
    }
}

class JSNull extends JSValue {
    toString() {
        return new JSString(['n', 'u', 'l', 'l'])
    }
    toNumber() {
        return new JSNumber(0)
    }
    toBoolean() {
        return new JSBoolean(false)
    }
}

class JSSymblo extends JSValue {
    constructor(name) {
        super()
        this.name = name || ''
    }
}









export {
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
}


// node
// module.exports = {Reference, Realm, EnvironmentRecord, ExecutionContext}