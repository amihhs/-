import { Component } from './framework.js'
import { enableGesture } from './gesture.js'
import { Animation, TimeLine } from './animation'
import { ease, linear } from './esea.js'

export class Carousel extends Component {
    constructor() {
        super();
        this.attributes = Object.create(null)
    }
    setAttribute(name, value) {
        this.attributes[name] = value;
    }
    render() {
        this.root = document.createElement('div');
        this.root.classList.add('carousel')
        let children = this.root.children;

        for (let r of this.attributes.src) {
            let child = document.createElement('div');
            child.style.backgroundImage = `url('${r}')`;
            child.style.backgroundSize = `contain`;
            this.root.appendChild(child);
        }

        let position = 0;
        enableGesture(this.root);
        let timeline = new TimeLine();
        timeline.start();


        let handler = null;
        let t = 0;
        let ax = 0;


        this.root.addEventListener('start', event => {
            timeline.pause();

            clearInterval(handler)
            let progress = ((Date.now() - t) / 500);
            ax = ease(progress) * 500 - 500;
        })

        this.root.addEventListener('pan', event => {
            let x = event.clientX - event.startX - ax;
            let current = position - ((x - x % 500) / 500)

            for (let offset of [-1, 0, 1]) {
                let pos = current + offset;
                pos = (pos % children.length + children.length) % children.length;
                children[pos].style.transition = 'none';
                children[pos].style.transform = `translateX(${- pos * 500 + offset * 500 + x % 500}px)`;
            }
        })
        this.root.addEventListener('panend', event => {
            timeline.reset();
            timeline.start();
            handler = setInterval(nextPicture, 3000);


            let x = event.clientX - event.startX - ax;
            let current = position - ((500 - x % 500) / 500)
            let direction = Math.round((x % 500) / 500)

            for (let offset of [-1, 0, 1]) {
                let pos = current + offset;
                pos = (pos % children.length + children.length) % children.length;

                children[pos].style.transition = 'none';
                children[pos].style.transform = `translateX(${ - pos * 500 + offset * 500 + x % 500}px)`
                
                timeline.add(new Animation(children[pos].style, "transform",
                    - pos * 500 + offset * 500 + x % 500,
                    - pos * 500 + offset * 500 + direction * 500,
                    500, 0, linear, v => `translateX(${v}px)`))

            }
            position = position - ((x - x % 500) / 500) - direction;
            position = (position % children.length + children.length) % children.length;

        })

        let nextPicture = () => {
            let children = this.root.children;
            let nextIndex = (position + 1) % children.length;
            console.log(position);
            console.log(nextIndex);
            t = Date.now();

            let current = children[position];
            let next = children[nextIndex];

            timeline.add(new Animation(current.style, "transform",
                - position * 500,
                - 500 - position * 500,
                500, 0, linear, v => `translateX(${v}px)`))

            timeline.add(new Animation(next.style, "transform",
                500 - nextIndex * 500,
                - nextIndex * 500,
                500, 0, linear, v => `translateX(${v}px)`))
            position = nextIndex;

        }

        handler = setInterval(nextPicture, 3000)

        return this.root;
    }
    mountTo(parent) {
        parent.appendChild(this.render());
    }
}