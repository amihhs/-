
export class Dispatcher {
    constructor(element) {
        this.element = element;
    }
    dispatch(type, properties) {
        let event = new Event(type);
        for (let name in properties) {
            event[name] = properties[name];
        }

        this.element.dispatchEvent(event);
    }
}

export class Listener {
    constructor(element, recognize) {

        let contexts = new Map();
        let isListenerMouse = false;
        element.addEventListener('mousedown', event => {

            let context = Object.create(null);
            contexts.set('mouse' + (1 << event.button), context)
            recognize.start(event, context);

            let mousemove = event => {
                let button = 1;

                while (button <= event.buttons) {
                    if (button & event.buttons) {
                        let key;
                        // order of buttons & button property is not same
                        if (button == 2) {
                            key = 4;
                        } else if (button == 4) {
                            key = 2;
                        } else {
                            key = button;
                        }
                        let context = contexts.get('mouse' + key)
                        recognize.move(event, context);
                    }
                    button = button << 1



                }
            }
            let mouseup = event => {
                let context = contexts.get('mouse' + (1 << event.button))
                recognize.end(event, context);
                contexts.delete('mouse' + (1 << event.button))
                if (event.buttons === 0) {
                    document.removeEventListener('mousemove', mousemove);
                    document.removeEventListener('mouseup', mouseup);
                    isListenerMouse = false
                }

            }
            if (!isListenerMouse) {
                document.addEventListener('mousemove', mousemove)
                document.addEventListener('mouseup', mouseup)
                isListenerMouse = true
            }

        })

        element.addEventListener('touchstart', event => {
            for (let touch of event.changedTouches) {
                let context = Object.create(null);
                contexts.set(touch.identifier, context)
                recognize.start(touch, context);

            }
        })


        element.addEventListener('touchmove', event => {
            for (let touch of event.changedTouches) {
                let context = contexts.get(touch.identifier)
                recognize.move(touch, context)

            }
        })

        element.addEventListener('touchend', event => {
            for (let touch of event.changedTouches) {
                let context = contexts.get(touch.identifier)
                recognize.end(touch)
                contexts.delete(touch.identifier)

            }
        })

        element.addEventListener('touchcancel', event => {
            for (let touch of event.changedTouches) {
                let context = contexts.get(touch.identifier)
                recognize.cancel(touch, context)
                contexts.delete(touch.identifier)

            }
        })
    }


}
export class Recognizer {
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
    }

    start(point, context) {

        context.startX = point.clientX, context.startY = point.clientY;
        context.points = [{
            t: Date.now(),
            x: point.clientX,
            y: point.clientY,
        }]
        context.isPress = false;
        context.isPan = false;
        context.isTap = true;


        this.dispatcher.dispatch('start', {
            clientX: point.clientX,
            clientY: point.clientY,
        })

        context.handle = setTimeout(() => {
            context.isPress = true;
            context.isPan = false;
            context.isTap = false;
            context.handle = null;
            this.dispatcher.dispatch('press', {})
        }, 500)
    }

    move(point, context) {
        let dx = point.clientX - context.startX, dy = point.clientY - context.startY;


        if (dx ** 2 + dy ** 2 > 100) {
            context.isPress = false;
            context.isPan = true;
            context.isTap = false;
            context.isVertical = Math.abs(dx) < Math.abs(dy) ;
            this.dispatcher.dispatch('panstart', {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: context.isVertical,
            })
            clearTimeout(context.handle);

        }

        if (context.isPan) {
            this.dispatcher.dispatch('pan', {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: context.isVertical,
            })
        }

        context.points = context.points.filter(point => Date.now() - point.t < 500)

        context.points.push({
            t: Date.now(),
            x: point.clientX,
            y: point.clientY,
        })


    }


    end(point, context) {
        if (context.isTap) {
            this.dispatcher.dispatch('tap', {})
            clearTimeout(context.handle);
        }
       
        if (context.isPress) {
            this.dispatcher.dispatch('pressend', {})
        }
        let v, d;
        if (!context.points.length) {
            v = 0;
            d = 0;
        } else {
            context.points = context.points.filter(point => Date.now() - point.t < 500)
            d =(point.clientX - context.points[0].x) + (point.clientY - context.points[0].y) ** 2;
        }
        v = d / (Date.now() - context.points[0].t)
        if (v > 1.5 || v < -1.5) {
            context.isFlick = true;
            this.dispatcher.dispatch('panend', {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: context.isVertical,
                isFlick: context.isFlick,
                velocity: v
            })
        }else{
            context.isFlick = false;
        }
        if (context.isPan) {
            this.dispatcher.dispatch('panend', {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: context.isVertical,
                isFlick: context.isFlick,
                velocity: v
            })
        }
        this.dispatcher.dispatch('end', {
            startX: context.startX,
            startY: context.startY,
            clientX: point.clientX,
            clientY: point.clientY,
            isVertical: context.isVertical,
            isFlick: context.isFlick,
            velocity: v
        })

    }

    cancel(point, context) {
        clearTimeout(context.handle);
        this.dispatcher.dispatch('cancel', {})
    }
}

export function enableGesture(element){
    new Listener(element, new Recognizer(new Dispatcher(element)));
}