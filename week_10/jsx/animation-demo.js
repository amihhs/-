import { TimeLine, Animation } from './animation.js'
import { linear, ease, easeIn, easeOut, easeInOut } from './esea.js'


let tl = new TimeLine();

console.log(document.querySelector("#el"))
let animation = new Animation(document.querySelector("#el").style, 'transform', 0, 500, 2000, 0, ease, v => `translateX(${v}px)`);




document.querySelector('#pause').addEventListener('click', () => tl.pause());
document.querySelector('#resume').addEventListener('click', () => tl.resume());
tl.add(animation);
tl.start();

document.querySelector("#el2").style.transition = 'transform  ease 2s';
document.querySelector("#el2").style.transform = 'translateX(500px)';
