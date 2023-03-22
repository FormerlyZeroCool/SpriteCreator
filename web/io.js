import { getHeight, getWidth } from "./gui.js";
import { RollingStack, get_angle, normalize } from "./utils.js";
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
        this.listener_type_map = new KeyListenerTypes();
        document.addEventListener("keyup", (e) => this.keyUp(e));
        document.addEventListener("keydown", (e) => this.keyDown(e));
        document.addEventListener("keypressed", (e) => this.keyPressed(e));
    }
    registerCallBack(listenerType, predicate, callBack) {
        this.listener_type_map[listenerType].push(new TouchHandler(predicate, callBack));
    }
    callHandler(type, event) {
        const handlers = this.listener_type_map[type];
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
        this.touchstart = [];
        this.touchmove = [];
        this.touchend = [];
        this.hover = [];
        this.doubletap = [];
        this.longtap = [];
        this.tap = [];
        this.swipe = [];
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
    constructor(component, preventDefault, mouseEmulation, stopRightClick = false, tap_and_swipe_delay_limit = 250) {
        this.startTouchTime = Date.now();
        this.timeSinceLastTouch = Date.now() - this.startTouchTime;
        this.offset = [];
        this.moveCount = 0;
        this.tap_and_swipe_delay_limit = tap_and_swipe_delay_limit;
        this.touchMoveEvents = [];
        this.translateEvent = (e, dx, dy) => e.touchPos = [e.touchPos[0] + dx, e.touchPos[1] + dy];
        this.scaleEvent = (e, dx, dy) => e.touchPos = [e.touchPos[0] * dx, e.touchPos[1] * dy];
        this.startTouchPos = [0, 0];
        this.component = component;
        this.preventDefault = preventDefault;
        this.touchStart = null;
        this.start_times = new RollingStack(2);
        this.registeredTouch = false;
        this.touchPos = [0, 0];
        this.touchVelocity = 0;
        this.touchMoveCount = 0;
        this.double_tapped = false;
        this.deltaTouchPos = 0;
        this.listener_type_map = new ListenerTypes();
        this.mouseOverElement = false;
        if (component) {
            if (isTouchSupported()) {
                component.addEventListener('touchstart', (event) => { this.touchStartHandler(event); });
                component.addEventListener('touchmove', (event) => this.touchMoveHandler(event));
                component.addEventListener('touchend', (event) => this.touchEndHandler(event));
            }
            if (mouseEmulation) {
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
        this.listener_type_map[listenerType].push(new TouchHandler(predicate, callBack));
    }
    callHandler(type, event) {
        const handlers = this.listener_type_map[type];
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
            this.callHandler("hover", event);
            if (!this.registeredTouch)
                return false;
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
                    if (delay < this.tap_and_swipe_delay_limit) {
                        if (this.mag([deltaX, deltaY]) > Math.min(getWidth(), getHeight()) * 0.1) //swipe
                         {
                            event.swipe_direction = Math.abs(deltaX) > Math.abs(deltaY) ? (deltaX < 0 ? "left" : "right") :
                                (deltaY < 0 ? "up" : "down");
                            this.callHandler("swipe", event);
                        }
                        else if (this.timeSinceLastTouch < this.tap_and_swipe_delay_limit) {
                            this.callHandler("doubletap", event);
                            this.double_tapped = true;
                        }
                        else //tap
                            this.callHandler("tap", event);
                    }
                    else //tap
                        this.callHandler("longtap", event);
                    this.double_tapped = false;
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
        this.pinch = [];
        this.rotate = [];
        this.touchmove = [];
        this.doubletap = new Array();
        this.tap = new Array();
        this.swipe = new Array();
    }
}
;
export class MultiTouchListener {
    constructor(component, preventDefault, mouseEmulation, stopRightClick, tap_and_swipe_delay_limit = 250) {
        this.lastDistance = 0;
        this.start_theta = 0;
        this.rotation_theta = 0;
        this.pinch_distance = 0;
        this.start_delta_distance = 0;
        this.rotation_listening = false;
        this.pinch_listening = false;
        this.previous_touches = [];
        this.listener_type_map = new MultiTouchListenerTypes();
        this.registeredMultiTouchEvent = false;
        this.single_touch_listener = new SingleTouchListener(null, preventDefault, false, false, tap_and_swipe_delay_limit);
        this.single_touch_listener.component = component;
        if (isTouchSupported()) {
            component.addEventListener('touchstart', event => {
                //if(event.touches.length < 1)
                //  this.reset_state()
                this.touchStartHandler(event);
                this.single_touch_listener.touchStartHandler(event);
                if (preventDefault)
                    event.preventDefault();
            });
            component.addEventListener('touchmove', event => {
                this.touchMoveHandler(event);
                if (event.touches.length < 2)
                    this.single_touch_listener.touchMoveHandler(event);
                if (preventDefault)
                    event.preventDefault();
            });
            component.addEventListener('touchend', event => {
                this.reset_state();
                this.single_touch_listener.touchEndHandler(event);
                if (preventDefault)
                    event.preventDefault();
            });
        }
        else if (mouseEmulation) {
            if (stopRightClick)
                component.addEventListener("contextmenu", (e) => {
                    e.preventDefault();
                    return false;
                });
            component.addEventListener("mouseover", (event) => { this.mouse_over_element = true; });
            component.addEventListener("mouseleave", (event) => { this.mouse_over_element = false; });
            component.addEventListener('mousedown', (event) => { event.changedTouches = {}; event.changedTouches.item = (x) => event; this.single_touch_listener.touchStartHandler(event); });
            component.addEventListener('mousemove', (event) => {
                event.changedTouches = {};
                event.changedTouches.item = (x) => event;
                this.single_touch_listener.touchMoveHandler(event);
                if (preventDefault)
                    event.preventDefault();
            });
            component.addEventListener('mouseup', (event) => { event.changedTouches = {}; event.changedTouches.item = (x) => event; this.single_touch_listener.touchEndHandler(event); });
        }
    }
    reset_state() {
        this.registeredMultiTouchEvent = false;
        this.rotation_listening = false;
        this.pinch_listening = false;
        this.lastDistance = 0;
        this.start_theta = -100;
        this.rotation_theta = 0;
        this.pinch_distance = 0;
        this.start_delta_distance = 0;
        this.previous_touches = [];
    }
    registerCallBackPredicate(listenerType, predicate, callBack) {
        if (listenerType in this.single_touch_listener.listener_type_map) {
            this.single_touch_listener.registerCallBack(listenerType, predicate, callBack);
        }
        else
            this.listener_type_map[listenerType].push(new TouchHandler(predicate, callBack));
    }
    registerCallBack(listenerType, callBack) {
        this.registerCallBackPredicate(listenerType, () => true, callBack);
    }
    callHandler(type, event) {
        const handlers = this.listener_type_map[type];
        handlers.forEach((handler) => {
            if (!event.defaultPrevented && handler.pred(event)) {
                handler.callBack(event);
            }
        });
    }
    touchStartHandler(event) {
    }
    touchMoveHandler(event) {
        let touch1 = event.touches.item(0);
        let touch2 = event.touches.item(1);
        if (SingleTouchListener.mouseDown.getTouchCount() > 1) {
            this.registeredMultiTouchEvent = true;
            if (this.lastDistance === 0)
                this.lastDistance = Math.sqrt(Math.pow((touch1.clientX - touch2.clientX), 2) + Math.pow(touch1.clientY - touch2.clientY, 2));
            if (this.start_theta === 0) {
                const temp1 = touch1.clientX < touch2.clientX ? touch1 : touch2;
                const temp2 = touch1.clientX < touch2.clientX ? touch2 : touch1;
                touch1 = temp1;
                touch2 = temp2;
                this.start_theta = this.get_theta(touch1, touch2);
            }
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
        if (!(this.registeredMultiTouchEvent))
            return;
        const newDist = Math.sqrt(Math.pow((touch1.clientX - touch2.clientX), 2) + Math.pow(touch1.clientY - touch2.clientY, 2));
        event.touchPos = [(touch1.clientX + touch2.clientX) / 2, (touch1.clientY + touch2.clientY) / 2];
        event.delta = this.lastDistance - newDist;
        event.distance = newDist;
        this.pinch_distance = newDist;
        const theta = this.get_theta(touch1, touch2);
        event.rotation_theta = theta;
        event.rotation_delta = -theta + this.rotation_theta;
        this.rotation_theta = theta;
        //handle start theta attribute, and rotation listening
        if (this.start_theta === -100)
            this.start_theta = theta;
        else if (!this.pinch_listening && Math.abs(this.start_theta - theta) > Math.PI / 12)
            this.rotation_listening = true;
        if (this.start_delta_distance === 0)
            this.start_delta_distance = newDist;
        else if (Math.abs(this.start_delta_distance - newDist) > Math.min(getHeight(), getWidth()) / 20 && Math.abs(event.delta) > Math.min(getHeight(), getWidth()) / 65)
            this.pinch_listening = true;
        if (this.rotation_listening)
            this.callHandler("rotate", event);
        //if(this.pinch_listening)
        this.callHandler("pinch", event);
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
export class GenericListener extends MultiTouchListener {
    constructor(component, preventDefault, mouseEmulation, stopRightClick, tap_and_swipe_delay_limit) {
        super(component, preventDefault, mouseEmulation, stopRightClick, tap_and_swipe_delay_limit);
        this.keyboard_listener = new KeyboardHandler();
    }
    registerCallBackPredicate(listenerType, predicate, callBack) {
        if (listenerType in this.listener_type_map || listenerType in this.single_touch_listener.listener_type_map)
            this.registerCallBackPredicate(listenerType, predicate, callBack);
        else
            this.keyboard_listener.registerCallBack(listenerType, predicate, callBack);
    }
    registerCallBack(listenerType, callBack) {
        this.registerCallBackPredicate(listenerType, () => true, callBack);
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
