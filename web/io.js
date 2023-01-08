import { get_angle, normalize } from "./utils.js";
export class KeyListenerTypes {
    constructor() {
        this.keydown = new Array();
        this.keypressed = new Array();
        this.keyup = new Array();
    }
}
;
export class KeyboardHandler {
    constructor() {
        this.keysHeld = {};
        this.listenerTypeMap = new KeyListenerTypes();
        document.addEventListener("keyup", (e) => this.keyUp(e));
        document.addEventListener("keydown", (e) => this.keyDown(e));
        document.addEventListener("keypressed", (e) => this.keyPressed(e));
    }
    registerCallBack(listenerType, predicate, callBack) {
        this.listenerTypeMap[listenerType].push(new TouchHandler(predicate, callBack));
    }
    callHandler(type, event) {
        const handlers = this.listenerTypeMap[type];
        handlers.forEach((handler) => {
            if (handler.pred(event)) {
                handler.callBack(event);
            }
        });
    }
    keyDown(event) {
        if (this.keysHeld[event.code] === undefined || this.keysHeld[event.code] === null)
            this.keysHeld[event.code] = 1;
        else
            this.keysHeld[event.code]++;
        event.keysHeld = this.keysHeld;
        this.callHandler("keydown", event);
    }
    keyUp(event) {
        this.keysHeld[event.code] = 0;
        event.keysHeld = this.keysHeld;
        this.callHandler("keyup", event);
    }
    keyPressed(event) {
        event.keysHeld = this.keysHeld;
        this.callHandler("keypressed", event);
    }
}
;
export class TouchHandler {
    constructor(pred, callBack) {
        this.pred = pred;
        this.callBack = callBack;
    }
}
;
export class ListenerTypes {
    constructor() {
        this.touchstart = new Array();
        this.touchmove = new Array();
        this.touchend = new Array();
    }
}
;
;
export function isTouchSupported() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0));
}
export class MouseDownTracker {
    constructor() {
        const component = document;
        this.mouseDown = false;
        this.count = null;
        if (isTouchSupported()) {
            this.count = 0;
            component.addEventListener('touchstart', event => { this.mouseDown = true; this.count++; }, false);
            component.addEventListener('touchend', event => { this.mouseDown = false; this.count--; }, false);
        }
        if (!isTouchSupported()) {
            component.addEventListener('mousedown', event => this.mouseDown = true);
            component.addEventListener('mouseup', event => this.mouseDown = false);
        }
    }
    getTouchCount() { return this.count; }
}
export class SingleTouchListener {
    constructor(component, preventDefault, mouseEmulation, stopRightClick = false) {
        this.startTouchTime = Date.now();
        this.timeSinceLastTouch = Date.now() - this.startTouchTime;
        this.offset = [];
        this.moveCount = 0;
        this.touchMoveEvents = [];
        this.translateEvent = (e, dx, dy) => e.touchPos = [e.touchPos[0] + dx, e.touchPos[1] + dy];
        this.scaleEvent = (e, dx, dy) => e.touchPos = [e.touchPos[0] * dx, e.touchPos[1] * dy];
        this.startTouchPos = [0, 0];
        this.component = component;
        this.preventDefault = preventDefault;
        this.touchStart = null;
        this.registeredTouch = false;
        this.touchPos = [0, 0];
        this.touchVelocity = 0;
        this.touchMoveCount = 0;
        this.deltaTouchPos = 0;
        this.listenerTypeMap = {
            touchstart: [],
            touchmove: [],
            touchend: []
        };
        this.mouseOverElement = false;
        if (component) {
            if (isTouchSupported()) {
                component.addEventListener('touchstart', (event) => { this.touchStartHandler(event); });
                component.addEventListener('touchmove', (event) => this.touchMoveHandler(event));
                component.addEventListener('touchend', (event) => this.touchEndHandler(event));
            }
            if (mouseEmulation && !isTouchSupported()) {
                if (stopRightClick)
                    component.addEventListener("contextmenu", (e) => {
                        e.preventDefault();
                        return false;
                    });
                component.addEventListener("mouseover", (event) => { this.mouseOverElement = true; });
                component.addEventListener("mouseleave", (event) => { this.mouseOverElement = false; });
                component.addEventListener('mousedown', (event) => { event.changedTouches = {}; event.changedTouches.item = (x) => event; this.touchStartHandler(event); });
                component.addEventListener('mousemove', (event) => {
                    event.changedTouches = {};
                    event.changedTouches.item = (x) => event;
                    this.touchMoveHandler(event);
                });
                component.addEventListener('mouseup', (event) => { event.changedTouches = {}; event.changedTouches.item = (x) => event; this.touchEndHandler(event); });
            }
        }
    }
    registerCallBack(listenerType, predicate, callBack) {
        this.listenerTypeMap[listenerType].push(new TouchHandler(predicate, callBack));
    }
    callHandler(type, event) {
        const handlers = this.listenerTypeMap[type];
        const touchSupported = isTouchSupported();
        if (SingleTouchListener.mouseDown.getTouchCount() < 2)
            handlers.forEach((handler) => {
                if ((!event.defaultPrevented || touchSupported) && handler.pred(event)) {
                    handler.callBack(event);
                }
            });
    }
    touchStartHandler(event) {
        this.timeSinceLastTouch = Date.now() - this.startTouchTime;
        this.registeredTouch = true;
        this.moveCount = 0;
        event.timeSinceLastTouch = Date.now() - (this.startTouchTime ? this.startTouchTime : 0);
        this.startTouchTime = Date.now();
        this.touchStart = event.changedTouches.item(0);
        this.touchPos = [this.touchStart["offsetX"], this.touchStart["offsetY"]];
        if (!this.touchPos[0]) {
            this.touchPos = [this.touchStart["clientX"] - this.component.getBoundingClientRect().left, this.touchStart["clientY"] - this.component.getBoundingClientRect().top];
        }
        this.startTouchPos = [this.touchPos[0], this.touchPos[1]];
        event.touchPos = this.touchPos ? [this.touchPos[0], this.touchPos[1]] : [0, 0];
        event.translateEvent = this.translateEvent;
        event.scaleEvent = this.scaleEvent;
        this.touchMoveEvents = [];
        this.touchVelocity = 0;
        this.touchMoveCount = 0;
        this.deltaTouchPos = 0;
        this.callHandler("touchstart", event);
        if (this.preventDefault)
            event.preventDefault();
    }
    touchMoveHandler(event) {
        event.timeSinceLastTouch = Date.now() - (this.startTouchTime ? this.startTouchTime : 0);
        if (this.registeredTouch !== SingleTouchListener.mouseDown.mouseDown) {
            this.touchEndHandler(event);
        }
        let touchMove = event.changedTouches.item(0);
        for (let i = 0; i < event.changedTouches["length"]; i++) {
            if (event.changedTouches.item(i).identifier == this.touchStart.identifier) {
                touchMove = event.changedTouches.item(i);
            }
        }
        if (touchMove) {
            try {
                if (!touchMove["offsetY"]) {
                    touchMove.offsetY = touchMove["clientY"] - this.component.getBoundingClientRect().top;
                }
                if (!touchMove["offsetX"]) {
                    touchMove.offsetX = touchMove["clientX"] - this.component.getBoundingClientRect().left;
                }
            }
            catch (error) {
                console.log(error);
            }
            const deltaY = touchMove["offsetY"] - this.touchPos[1];
            const deltaX = touchMove["offsetX"] - this.touchPos[0];
            this.touchPos[1] += deltaY;
            this.touchPos[0] += deltaX;
            if (!this.registeredTouch)
                return false;
            ++this.moveCount;
            const mag = this.mag([deltaX, deltaY]);
            this.touchMoveCount++;
            this.deltaTouchPos += Math.abs(mag);
            this.touchVelocity = 100 * this.deltaTouchPos / (Date.now() - this.startTouchTime);
            const angle = get_angle(deltaX, deltaY);
            event.deltaX = deltaX;
            event.startTouchPos = this.startTouchPos;
            event.deltaY = deltaY;
            event.mag = mag;
            event.angle = angle;
            event.avgVelocity = this.touchVelocity;
            event.touchPos = this.touchPos ? [this.touchPos[0], this.touchPos[1]] : [0, 0];
            event.startTouchTime = this.startTouchTime;
            event.eventTime = Date.now();
            event.moveCount = this.moveCount;
            event.translateEvent = this.translateEvent;
            event.scaleEvent = this.scaleEvent;
            this.touchMoveEvents.push(event);
            this.callHandler("touchmove", event);
        }
        return true;
    }
    touchEndHandler(event) {
        event.timeSinceLastTouch = Date.now() - (this.startTouchTime ? this.startTouchTime : 0);
        if (this.registeredTouch) {
            let touchEnd = event.changedTouches.item(0);
            for (let i = 0; i < event.changedTouches["length"]; i++) {
                if (event.changedTouches.item(i).identifier === this.touchStart.identifier) {
                    touchEnd = event.changedTouches.item(i);
                }
            }
            if (touchEnd) {
                if (!touchEnd["offsetY"]) {
                    touchEnd.offsetY = touchEnd["clientY"] - this.component.getBoundingClientRect().top;
                }
                if (!touchEnd["offsetX"]) {
                    touchEnd.offsetX = touchEnd["clientX"] - this.component.getBoundingClientRect().left;
                }
                const deltaY = touchEnd["offsetY"] - this.startTouchPos[1];
                const deltaX = touchEnd["offsetX"] - this.startTouchPos[0];
                this.touchPos = [touchEnd["offsetX"], touchEnd["offsetY"]];
                const mag = this.mag([deltaX, deltaY]);
                const a = this.normalize([deltaX, deltaY]);
                const b = [1, 0];
                const dotProduct = this.dotProduct(a, b);
                const angle = Math.acos(dotProduct) * (180 / Math.PI) * (deltaY < 0 ? 1 : -1);
                const delay = Date.now() - this.startTouchTime; // from start tap to finish
                this.touchVelocity = 100 * mag / (Date.now() - this.startTouchTime);
                event.deltaX = deltaX;
                event.deltaY = deltaY;
                event.mag = mag;
                event.angle = angle;
                event.avgVelocity = this.touchVelocity;
                event.touchPos = this.touchPos ? [this.touchPos[0], this.touchPos[1]] : [0, 0];
                event.timeDelayFromStartToEnd = delay;
                event.startTouchTime = this.startTouchTime;
                event.eventTime = Date.now();
                event.moveCount = this.moveCount;
                event.translateEvent = this.translateEvent;
                event.scaleEvent = this.scaleEvent;
                try {
                    this.callHandler("touchend", event);
                }
                catch (error) {
                    console.log(error);
                    this.registeredTouch = false;
                }
            }
            this.touchMoveEvents = [];
            this.registeredTouch = false;
        }
    }
    mag(a) {
        return Math.sqrt(a[0] * a[0] + a[1] * a[1]);
    }
    normalize(a) {
        const magA = this.mag(a);
        a[0] /= magA;
        a[1] /= magA;
        return a;
    }
    dotProduct(a, b) {
        return a[0] * b[0] + a[1] * b[1];
    }
}
SingleTouchListener.mouseDown = new MouseDownTracker();
;
;
export class MultiTouchHandler {
    constructor(pred, callBack) {
        this.pred = pred;
        this.callBack = callBack;
    }
}
;
export class MultiTouchListenerTypes {
    constructor() {
        this.pinchIn = [];
        this.pinchOut = [];
        this.rotate = [];
    }
}
;
export class MultiTouchListener {
    constructor(component) {
        this.lastDistance = 0;
        this.start_theta = 0;
        this.rotation_listening = false;
        this.previous_touches = [];
        this.listenerTypeMap = new MultiTouchListenerTypes();
        this.registeredMultiTouchEvent = false;
        if (isTouchSupported()) {
            component.addEventListener('touchmove', event => this.touchMoveHandler(event));
            component.addEventListener('touchend', event => {
                this.registeredMultiTouchEvent = false;
                this.rotation_listening = false;
                this.lastDistance = 0;
                this.start_theta = 0;
                this.previous_touches = [];
                event.preventDefault();
            });
        }
    }
    registerCallBack(listenerType, predicate, callBack) {
        this.listenerTypeMap[listenerType].push(new TouchHandler(predicate, callBack));
    }
    callHandler(type, event) {
        const handlers = this.listenerTypeMap[type];
        handlers.forEach((handler) => {
            if (!event.defaultPrevented && handler.pred(event)) {
                handler.callBack(event);
            }
        });
    }
    touchMoveHandler(event) {
        let touch1 = event.changedTouches.item(0);
        let touch2 = event.changedTouches.item(1);
        if (SingleTouchListener.mouseDown.getTouchCount() > 1) {
            this.registeredMultiTouchEvent = true;
            if (this.lastDistance === 0)
                this.lastDistance = Math.sqrt(Math.pow((touch1.clientX - touch2.clientX), 2) + Math.pow(touch1.clientY - touch2.clientY, 2));
            if (this.start_theta === 0)
                this.start_theta = this.get_theta(touch1, touch2);
        }
        if (this.previous_touches.length > 1) {
            if (!touch1 && !touch2) {
                touch1 = this.previous_touches[0];
                touch2 = this.previous_touches[1];
            }
            else if (!touch2) {
                if (dist(touch1.clientX, touch1.clientY, this.previous_touches[0].clientX, this.previous_touches[0].clientY) <
                    dist(touch1.clientX, touch1.clientY, this.previous_touches[1].clientX, this.previous_touches[1].clientY)) {
                    touch2 = this.previous_touches[1];
                }
                else {
                    const temp = touch1;
                    touch1 = this.previous_touches[0];
                    touch2 = temp;
                }
            }
        }
        if (!(this.registeredMultiTouchEvent || (touch1 && touch2)))
            return;
        const newDist = Math.sqrt(Math.pow((touch1.clientX - touch2.clientX), 2) + Math.pow(touch1.clientY - touch2.clientY, 2));
        event.delta = this.lastDistance - newDist;
        event.distance = newDist;
        const theta = this.get_theta(touch1, touch2);
        event.rotation_theta = theta;
        if (Math.abs(this.start_theta - theta) > Math.PI / 16)
            this.rotation_listening = true;
        if (this.rotation_listening && this.listenerTypeMap.rotate.length) {
            this.callHandler("rotation", event);
        }
        else if (this.lastDistance > newDist) {
            this.callHandler("pinchOut", event);
        }
        else {
            this.callHandler("pinchIn", event);
        }
        event.preventDefault();
        this.lastDistance = newDist;
        if (touch1 && touch2)
            this.previous_touches = [touch1, touch2];
    }
    get_theta(touch1, touch2) {
        const vec = normalize([touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY]);
        return get_angle(vec[0], vec[1]);
    }
}
;
function dist(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}
export async function fetchImage(url) {
    const img = new Image();
    img.src = URL.createObjectURL(await (await fetch(url)).blob());
    return img;
}
