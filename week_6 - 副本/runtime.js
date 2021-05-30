class ExecutionContext {
    constructor(realm, lexicalEnvironment, varableEnvironment){
        varableEnvironment = varableEnvironment || lexicalEnvironment
        this.lexicalEnvironment = lexicalEnvironment
        this.varableEnvironment = varableEnvironment
        this.realm = realm
    }
}

class EnvironmentRecord {
    constructor(outer){
        this.outer = outer
        this.variables = new Map
    }
    add(name){
        this.variables.set(name, new JSUndefined)
    }
    get(name){
        if(this.variables.has(name)){
            return this.variables.get(name)
        }else if(this.outer){
            return this.outer.get(name)
        }else{
            return JSUndefined
        }
    }
    set(name, value = new JSUndefined){
        if(this.variables.has(name)){
            return this.variables.set(name, value)
        }else if(this.outer){
            return this.outer.set(name, value)
        }else{
            return this.variables.set(name, value)
        }
    }
}

class ObjectEnvironmentRecord{
    constructor(object, outer){
        this.object = object
        this.outer = outer
    }
    add(name){
        this.object.set(name, new JSUndefined)
    }
    get(name){
        return this.object.get(name)
    }
    set(name, value = new JSUndefined){
        this.object.set(name, value)
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




module.exports = {Reference, Realm, EnvironmentRecord, ExecutionContext}