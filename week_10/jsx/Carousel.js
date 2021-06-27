import { Component, STATE, ATTRUBUTE } from './framework.js'
import { enableGesture } from './gesture.js'
import { Animation, TimeLine } from './animation'
import { ease, linear } from './esea.js'

export {STATE, ATTRUBUTE} from './framework.js'

export class Carousel extends Component {
    constructor() {
        super();
    }
    render() {
        this.root = document.createElement('div');
        this.root.classList.add('carousel')

        for (let r of this[ATTRUBUTE].src) {
            let child = document.createElement('div');
            child.style.backgroundImage = `url('${r.img}')`;
            child.style.backgroundSize = `contain`;
            this.root.appendChild(child);

        }

        this[STATE].position = 0;
        let children = this.root.children;
        enableGesture(this.root);
        let timeline = new TimeLine();
        timeline.start();


        let handler = null;
        let t = 0;
        let ax = 0;

        this.root.addEventListener('start', event => {
            timeline.pause();

            clearInterval(handler)
            if(Date.now() - t < 1500){
                let progress = (Date.now() - t) / 500;
                ax = linear(progress) * 500 - 500;
            }else{
                ax = 0;
            }
           
        })
        this.root.addEventListener('tap', event => {
            this.triggerEvent('click',{
                position:this[STATE].position,
                data:this[ATTRUBUTE].src[this[STATE].position].url
            });
        })
 
        this.root.addEventListener('pan', event => {
            let x = event.clientX - event.startX - ax;
            let current = this[STATE].position - ((x - x % 500) / 500)

            for (let offset of [-1, 0, 1]) {
                let pos = current + offset;
                pos = (pos % children.length + children.length) % children.length;
                children[pos].style.transition = 'none';
                children[pos].style.transform = `translateX(${- pos * 500 + offset * 500 + x % 500}px)`;
            }
        })
        this.root.addEventListener('end', event => {

            timeline.reset();
            timeline.start();
            handler = setInterval(nextPicture, 2000)

            let x = event.clientX - event.startX - ax;
            let current = this[STATE].position - ((x - x % 500) / 500)

            let direction = Math.round((x % 500) / 500)
            // console.log(event.isFlick)

            if(event.isFlick){
                // console.log(event.velocity)
                if(event.velocity > 0){
                    direction = Math.ceil((x % 500) / 500)
                }else{
                    direction = Math.floor((x % 500) / 500)

                }
            }

            for (let offset of [-1, 0, 1]) {
                let pos = current + offset;
                pos = (pos % children.length + children.length) % children.length;
                children[pos].style.transition = 'none';

                timeline.add(new Animation(children[pos].style, "transform",
                    - pos * 500 + offset * 500 + x % 500,
                    - pos * 500 + offset * 500 + direction * 500,
                    500, 0, linear, v => `translateX(${v}px)`))
            }
            this[STATE].position = this[STATE].position - ((x - x % 500) / 500) - direction;
            this[STATE].position = (this[STATE].position % children.length + children.length) % children.length;
            this.triggerEvent('change',{position:this[STATE].position});
        })

        let nextPicture = () => {
            let children = this.root.children;
            let nextIndex = (this[STATE].position + 1) % children.length

            let current = children[this[STATE].position]
            let next = children[nextIndex]
            t = Date.now();
            next.style.transition = 'none'
            next.style.transform = `translateX(${500 - nextIndex * 500}px)`;

            timeline.add(new Animation(current.style, "transform",
                - this[STATE].position * 500,
                - 500 - this[STATE].position * 500,
                500, 0, linear, v => `translateX(${v}px)`))

            timeline.add(new Animation(next.style, "transform",
                500 - nextIndex * 500,
                - nextIndex * 500,
                500, 0, linear, v => `translateX(${v}px)`))
            this[STATE].position = nextIndex;
            this.triggerEvent('change',{position:this[STATE].position});



        }
        handler = setInterval(nextPicture, 2000)


        // this.root.addEventListener('mousedown', event => {
        //     let startX = event.clientX;
        //     let children = this.root.children;

        //     let move = event => {
        //         let x = event.clientX - startX;
        //         console.log(x)
        //         let current = this[STATE].position - ((x - x % 500) / 500)

        //         for (let offset of [-1, 0, 1]) {
        //             let pos = current + offset;
        //             pos = (pos + children.length) % children.length;
        //             children[pos].style.transition = 'none';
        //             children[pos].style.transform = `translateX(${- pos * 500 + offset * 500 + x % 500}px)`;
        //         }
        //     }
        //     let up = event => {
        //         let x = event.clientX - startX;
        //         this[STATE].position = this[STATE].position - Math.round(x / 500)

        //         for (let offset of [0, -Math.sign(Math.round(x / 500) - x + 250 * Math.sign(x))]) {
        //             let pos = this[STATE].position + offset;
        //             pos = (pos + children.length) % children.length;
        //             children[pos].style.transition = '';
        //             children[pos].style.transform = `translateX(${- pos * 500 + offset * 500}px)`;
        //         }

        //         document.removeEventListener('mousemove', move);
        //         document.removeEventListener('mouseup', up);
        //     }
        //     document.addEventListener('mousemove', move);
        //     document.addEventListener('mouseup', up);

        // })
        // let currentIndex = 0;
        // setInterval(() => {
        //     let children = this.root.children;
        //     let nextIndex = (currentIndex + 1) % children.length

        //     let current = children[currentIndex]
        //     let next = children[nextIndex]

        //     next.style.transition = 'none'
        //     next.style.transform = `translateX(${100 - nextIndex * 100}%)`;

        //     setTimeout(() => {
        //         next.style.transition = '';
        //         current.style.transform = `translateX(${-100 - currentIndex * 100}%)`;
        //         next.style.transform = `translateX(${- nextIndex * 100}%)`;
        //         currentIndex = nextIndex;
        //     }, 16)

        // }, 2000)
        return this.root;
    }
    mountTo(parent) {
        parent.appendChild(this.render());
    }
}