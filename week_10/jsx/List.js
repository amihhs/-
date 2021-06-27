import { Component, STATE, ATTRUBUTE, createElement } from './framework.js'

export class List extends Component {
    constructor() {
        super();
    }

    render() {
        this.children = this[ATTRUBUTE].data.map(this.template)
        this.root = (<div>{this.children}</div>).render();
        return this.root
    }
    appendChild(child) {
       
        this.template = child;
        this.render()
    }
}