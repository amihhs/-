const TICK = Symbol('tick');
const TICK_HANDLER = Symbol('tick-handler');
const ANIMATION = Symbol('animation');
const START_TIME = Symbol('start_time');
const PAUSER_TIME = Symbol('pause_time');
const PAUSER_START = Symbol('pause_start');

export class TimeLine {
    constructor() {
        this.status = 'Inited';
        this[ANIMATION] = new Set();
        this[START_TIME] = new Map();
    }
    start() {
        if (this.status !== 'Inited')
            return;
        this.status = 'Started';

        let startTime = Date.now();
        this[PAUSER_TIME] = 0;

        this[TICK] = () => {
            let now = Date.now();
            for (let animation of this[ANIMATION]) {
                let t;
                if (this[START_TIME].get(animation) < startTime) {
                    t = now - startTime - this[PAUSER_TIME] - animation.delay;
                } else {
                    t = now - this[START_TIME].get(animation) - this[PAUSER_TIME] - animation.delay;
                }
                if (animation.duration < t) {
                    t = animation.duration;
                    this[ANIMATION].delete(animation)
                }
                animation.recive(t);
            }
            this[TICK_HANDLER] = requestAnimationFrame(this[TICK]);
        }
        this[TICK]();
    }

    pause() {
        if (this.status !== 'Started')
            return;
        this.status = 'Paused';

        this[PAUSER_START] = Date.now();
        cancelAnimationFrame(this[TICK_HANDLER]);
    }
    resume() {
        if (this.status !== 'Paused')
            return;
        this.status = 'Resumed';
        this[PAUSER_TIME] += Date.now() - this[PAUSER_START];
        this[TICK]();
    }

    reset() {

        this.status = 'Inited';
        this.pause();
        let startTime = Date.now();
        this[PAUSER_TIME] = 0;
        this[ANIMATION] = new Set();
        this[START_TIME] = new Map();
        this[PAUSER_START] = 0;
        this[TICK_HANDLER] = null;
    }

    add(animation, startTime) {
        if (arguments.length < 2) {
            startTime = Date.now();
        }
        this[ANIMATION].add(animation);
        this[START_TIME].set(animation, startTime)
    }
}

export class Animation {
    constructor(object, property, startValue, endValue, duration, delay, timingFunction, template) {
        this.object = object;
        this.property = property;
        this.startValue = startValue;
        this.endValue = endValue;
        this.duration = duration;
        this.timingFunction = timingFunction || (v => v);
        this.delay = delay;
        this.template = template || (v => v);
    }

    recive(time) {
        let range = this.endValue - this.startValue;
        let progress = this.timingFunction(time / this.duration)
        // console.log("range:" + range + ">>" + "progress:" + progress + ">>" + "this.startValue:" + this.startValue + ">>")
        this.object[this.property] = this.template(this.startValue + range * progress);
    }
}