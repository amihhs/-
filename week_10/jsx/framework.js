export function createElement(type, attributes, ...children) {
    let element;
    console.log(type)
    if(typeof type === 'string'){
        element = new ElementWrapper(type);
    }else{
        element = new type;
    }
    for (let name in attributes) {
        element.setAttribute(name, attributes[name]);
    }
    let processChildren = (children) => {
        for (let child of children) {
            // console.log(child) 
            if(typeof child === 'object' && (child instanceof Array)){
                processChildren(child);
                continue;
            }
            if (typeof child === 'string') {
                child = new TextWrapper(child);
            }
            element.appendChild(child);
        }
    }
    processChildren(children);
    return element;
}

export const STATE = Symbol('state');
export const ATTRUBUTE = Symbol('attribute');

export class Component{
    constructor(type){
        this[ATTRUBUTE] = Object.create(null)
        this[STATE] = Object.create(null)
    }
    setAttribute(name, attribute){
        this[ATTRUBUTE][name] = attribute;
    }
    appendChild(child){
       child.mountTo(this.root)
    }
    mountTo(parent){
        if(!this.root){
            this.render();
        }
        parent.appendChild(this.root)
    }
    triggerEvent(type, args){
        this[ATTRUBUTE]["on" + type.replace(/^[\s\S]/, s => s.toUpperCase())](new CustomEvent(type, {detail: args}))
    }
    render() {
        return this.root
    }
}

class ElementWrapper extends Component{
    constructor(type){
        super();
        this.root = document.createElement(type);
    }
    setAttribute(name, attribute){
        this.root.setAttribute(name,attribute)
    }

    
}
class TextWrapper extends Component{
    constructor(c){
        super();
        this.root = document.createTextNode(c);
    }
    
}