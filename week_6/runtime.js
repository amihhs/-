class ExecutionContext {
    constructor(realm, lexicalEnvironment, varableEnvironment){
        varableEnvironment = varableEnvironment || lexicalEnvironment
        this.lexicalEnvironment = lexicalEnvironment
        this.varableEnvironment = varableEnvironment
        this.realm = realm
    }
}

class EnvironmentRecord {
    constructor(){
        this.thisValue
        this.variables = new Map()
        this.outer = null
    }
    
}

class Reference {
    constructor(object, property){
        this.object = object
        this.property = property
    }
    set(v){
        this.object[this.property] = v
    }
    get(){
        return this.object[this.property]
    }
}

class Realm {
    constructor(){
        this.global = new Map()
        this.object = new Map()
        this.object_prototype = new Map()
    }
}

export var utils = {Reference, Realm, EnvironmentRecord, ExecutionContext}


// node
// module.exports = {Reference, Realm, EnvironmentRecord, ExecutionContext}