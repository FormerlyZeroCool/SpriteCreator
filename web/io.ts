
import { getHeight, getWidth } from "./gui.js";
import { RollingStack, get_angle, logToServer, normalize } from "./utils.js";

export class KeyListenerTypes {
    keydown:Array<TouchHandler>;
    keypressed:Array<TouchHandler>;
    keyup:Array<TouchHandler>;
    constructor()
    {
        this.keydown = new Array<TouchHandler>();
        this.keypressed = new Array<TouchHandler>();
        this.keyup = new Array<TouchHandler>();
    }
};
export class KeyboardHandler {
    keysHeld:any;
    listener_type_map:KeyListenerTypes;
    constructor()
    {
        this.keysHeld = {};
        this.listener_type_map = new KeyListenerTypes();
        document.addEventListener("keyup", (e:any) => this.keyUp(e));
        document.addEventListener("keydown", (e:any) => this.keyDown(e));
        document.addEventListener("keypressed", (e:any) => this.keyPressed(e));
    }
    registerCallBack(listenerType:string, predicate:(event:any) => boolean, callBack:(event:any) => void):void
    {
        (<any> this.listener_type_map)[listenerType].push(new TouchHandler(predicate, callBack));
    }
    callHandler(type:string, event:any):void
    {
        const handlers:TouchHandler[] = (<any> this.listener_type_map)[type];
        handlers.forEach((handler:TouchHandler) => {
            if(handler.pred(event))
            {
                handler.callBack(event);
            }
        });
    }
    keyDown(event:any)
    {
        if(this.keysHeld[event.code] === undefined || this.keysHeld[event.code] === null)
            this.keysHeld[event.code] = 1;
        else
            this.keysHeld[event.code]++;
        event.keysHeld = this.keysHeld;
        this.callHandler("keydown", event);
    }
    keyUp(event:any)
    {
        this.keysHeld[event.code] = 0;
        event.keysHeld = this.keysHeld;
        this.callHandler("keyup", event);
    }
    keyPressed(event:any)
    {
        event.keysHeld = this.keysHeld;
        this.callHandler("keypressed", event);
    }
    
};
interface Touch {
    identifier:number,
    target:number,
    clientX:number,
    clientY:number,
    pageX:number,
    pageY:number,
    screenX:number,
    screenY:number,
    radiusX:number,
    radiusY:number,
    rotationAngle:number
}
export class TouchHandler {
    pred:(event:any) => boolean; 
    callBack:(event:any) => void;
    constructor(pred:(event:any) => boolean, callBack:(event:any) => void)
    {
        this.pred = pred;
        this.callBack = callBack;
    }
};
export class ListenerTypes {
    touchstart:TouchHandler[];
    touchmove:TouchHandler[];
    touchend:TouchHandler[];
    hover:TouchHandler[];
    tap:TouchHandler[];
    doubletap:TouchHandler[];
    longtap:TouchHandler[]
    swipe:TouchHandler[];
    constructor()
    {
        this.touchstart = [];
        this.touchmove = [];
        this.touchend = [];
        this.hover = [];
        this.doubletap = [];
        this.longtap = [];
        this.tap = [];
        this.swipe = [];
    }
};
export interface TouchMoveEvent {

    deltaX:number;
    deltaY:number;
    mag:number;
    angle:number;
    avgVelocity:number;
    touchPos:number[];
    startTouchTime:number;
    timeSinceLastTouch:number;
    eventTime:number;
    moveCount:number;
    defaultPrevented:boolean;
};
export function isTouchSupported():boolean {
    return (('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0));
}
export class MouseDownTracker {
    mouseDown:boolean;
    count:number | null;
    constructor()
    {
        const component = document;
        this.mouseDown = false;
        this.count = null;
        if(isTouchSupported())
        {
            this.count = 0;
            component.addEventListener('touchstart', event => { this.mouseDown = true; this.count!++; }, false);
            component.addEventListener('touchend', event => { this.mouseDown = false; this.count!--; }, false);
        }
        if(!isTouchSupported()){
            component.addEventListener('mousedown', event => this.mouseDown = true );
            component.addEventListener('mouseup', event => this.mouseDown = false );
    
        }
    }
    getTouchCount(): number
    { return this.count!; }
}
export class SingleTouchListener
{
    startTouchTime:number;
    timeSinceLastTouch:number;
    moveCount:number;
    preventDefault:any;
    touchStart:any;
    registeredTouch:boolean;
    static mouseDown:MouseDownTracker = new MouseDownTracker();
    touchPos:Array<number>;
    startTouchPos:number[];
    offset:Array<number>;
    touchVelocity:number;
    touchMoveCount:number;
    deltaTouchPos:number;
    listener_type_map:ListenerTypes;
    component:HTMLElement;
    touchMoveEvents:TouchMoveEvent[];
    mouseOverElement:boolean;
    tap_and_swipe_delay_limit:number;
    translateEvent:(event:any, dx:number, dy:number) => void;
    scaleEvent:(event:any, dx:number, dy:number) => void;
    start_times:RollingStack<number>;
    double_tapped:boolean;
    constructor(component:HTMLElement | null, preventDefault:boolean, mouseEmulation:boolean, stopRightClick:boolean = false, tap_and_swipe_delay_limit:number = 250)
    {
        this.startTouchTime = Date.now();
        this.timeSinceLastTouch = Date.now() - this.startTouchTime;
        this.offset = [];
        this.moveCount = 0;
        this.tap_and_swipe_delay_limit = tap_and_swipe_delay_limit;
        this.touchMoveEvents = [];
        this.translateEvent = (e:any, dx:number, dy:number) => e.touchPos = [e.touchPos[0] + dx, e.touchPos[1] + dy];
        this.scaleEvent = (e:any, dx:number, dy:number) => e.touchPos = [e.touchPos[0] * dx, e.touchPos[1] * dy];
        this.startTouchPos = [0, 0];
        this.component = component!;
        this.preventDefault = preventDefault;
        this.touchStart = null;
        this.start_times = new RollingStack<number>(2);
        this.registeredTouch = false;
        this.touchPos = [0,0];
        this.touchVelocity = 0;
        this.touchMoveCount = 0;
        this.double_tapped = false;
        this.deltaTouchPos = 0;
        this.listener_type_map = new ListenerTypes();
        this.mouseOverElement = false;
        if(component)
        {
            if(isTouchSupported())
            {
                component.addEventListener('touchstart', (event:any) => {this.touchStartHandler(event);});
                component.addEventListener('touchmove', (event:any) => this.touchMoveHandler(event));
                component.addEventListener('touchend', (event:any) => this.touchEndHandler(event));
            }
            if(mouseEmulation){
                if(stopRightClick)
                    component.addEventListener("contextmenu", (e:any) => {
                        e.preventDefault();
                        return false;
                    });
                component.addEventListener("mouseover", (event:any) => { this.mouseOverElement = true;});
                component.addEventListener("mouseleave", (event:any) => { this.mouseOverElement = false;});
                component.addEventListener('mousedown', (event:any) => {(<any>event).changedTouches = {};(<any>event).changedTouches.item = (x:any) => event; this.touchStartHandler(event)});
                component.addEventListener('mousemove', (event:any) => {
                    (<any>event).changedTouches = {};(<any>event).changedTouches.item = (x:any) => event; this.touchMoveHandler(event)
                });
                component.addEventListener('mouseup', (event:any) => {(<any>event).changedTouches = {};(<any>event).changedTouches.item = (x:any) => event; this.touchEndHandler(event)});
        
            }
        }
    }
    registerCallBack(listenerType:string, predicate:(event:any) => boolean, callBack:(event:any) => void):void
    {
        (<any> this.listener_type_map)[listenerType].push(new TouchHandler(predicate, callBack));
    }
    callHandler(type:string, event:any):void
    {
        const handlers:TouchHandler[] = (<any> this.listener_type_map)[type];
        const touchSupported:boolean = isTouchSupported();
        if(SingleTouchListener.mouseDown.getTouchCount() < 2)
        handlers.forEach((handler:TouchHandler) => {
            if((!event.defaultPrevented || touchSupported) && handler.pred(event))
            {
                handler.callBack(event);
            }
        });
        
    }
    touchStartHandler(event:any):void
    {
        this.timeSinceLastTouch = Date.now() - this.startTouchTime;
        this.registeredTouch = true;
        this.moveCount = 0;
        event.timeSinceLastTouch = Date.now() - (this.startTouchTime?this.startTouchTime:0);
        this.startTouchTime = Date.now();
        this.touchStart = event.changedTouches.item(0);
        this.touchPos = [this.touchStart["offsetX"],this.touchStart["offsetY"]];
        if(!this.touchPos[0]){
            this.touchPos = [this.touchStart["clientX"] - this.component.getBoundingClientRect().left, this.touchStart["clientY"] - this.component.getBoundingClientRect().top];
        }
        this.startTouchPos = [this.touchPos[0], this.touchPos[1]];
        event.touchPos = this.touchPos ? [this.touchPos[0], this.touchPos[1]] : [0,0];
        event.translateEvent = this.translateEvent;
        event.scaleEvent = this.scaleEvent;
        this.touchMoveEvents = [];
        this.touchVelocity = 0;
        this.touchMoveCount = 0;
        this.deltaTouchPos = 0;
        
        
        this.callHandler("touchstart", event);

        if(this.preventDefault)
            event.preventDefault();
    }
    touchMoveHandler(event:any):boolean
    {
        event.timeSinceLastTouch = Date.now() - (this.startTouchTime?this.startTouchTime:0);
        if(this.registeredTouch !== SingleTouchListener.mouseDown.mouseDown){
            this.touchEndHandler(event);
        }
        let touchMove = event.changedTouches.item(0);
        for(let i = 0; i < event.changedTouches["length"]; i++)
        {
            if(event.changedTouches.item(i).identifier == this.touchStart.identifier){
                touchMove = event.changedTouches.item(i);
            }
        }  
        
        if(touchMove)
        {
            try{
                if(!touchMove["offsetY"])
                {
                    touchMove.offsetY = touchMove["clientY"] - this.component.getBoundingClientRect().top;
                }
                if(!touchMove["offsetX"])
                {
                    touchMove.offsetX = touchMove["clientX"] - this.component.getBoundingClientRect().left;
                }
            }
            catch(error:any)
            {
                console.log(error);
            }
            const deltaY:number = touchMove["offsetY"]-this.touchPos[1];
            const deltaX:number = touchMove["offsetX"]-this.touchPos[0];
            this.touchPos[1] += deltaY;
            this.touchPos[0] += deltaX;
             ++this.moveCount;
            const mag:number = this.mag([deltaX, deltaY]);
            this.touchMoveCount++;
            this.deltaTouchPos += Math.abs(mag);
            this.touchVelocity = 100*this.deltaTouchPos/(Date.now() - this.startTouchTime); 
            const angle:number = get_angle(deltaX, deltaY);
            event.deltaX = deltaX;
            event.startTouchPos = this.startTouchPos;
            event.deltaY = deltaY;
            event.mag = mag;
            event.angle = angle;
            event.avgVelocity = this.touchVelocity;
            event.touchPos = this.touchPos ? [this.touchPos[0], this.touchPos[1]] : [0,0];
            event.startTouchTime = this.startTouchTime;
            event.eventTime = Date.now();
            event.moveCount = this.moveCount;
            event.translateEvent = this.translateEvent;
            event.scaleEvent = this.scaleEvent;
            this.callHandler("hover", event);
            if(!this.registeredTouch)
                 return false;
            this.touchMoveEvents.push(event);

            this.callHandler("touchmove", event);
        }
        return true;
    }
    touchEndHandler(event:any):void
    {
        event.timeSinceLastTouch = Date.now() - (this.startTouchTime?this.startTouchTime:0);
        if(this.registeredTouch)
        {
            let touchEnd = event.changedTouches.item(0);
            for(let i = 0; i < event.changedTouches["length"]; i++)
            {
                if(event.changedTouches.item(i).identifier === this.touchStart.identifier){
                    touchEnd = event.changedTouches.item(i);
                }
            } 
            if(touchEnd)
            {
                if(!touchEnd["offsetY"])
                {
                    touchEnd.offsetY = touchEnd["clientY"] - this.component.getBoundingClientRect().top;
                }if(!touchEnd["offsetX"])
                {
                    touchEnd.offsetX = touchEnd["clientX"] - this.component.getBoundingClientRect().left;
                }
                const deltaY:number = touchEnd["offsetY"] - this.startTouchPos[1];

                const deltaX:number = touchEnd["offsetX"] - this.startTouchPos[0];
                this.touchPos = [touchEnd["offsetX"], touchEnd["offsetY"]];
                const mag:number = this.mag([deltaX, deltaY]);
                const a:Array<number> = this.normalize([deltaX, deltaY]);
                const b:Array<number> = [1,0];
                const dotProduct:number = this.dotProduct(a, b);
                const angle:number = Math.acos(dotProduct)*(180/Math.PI)*(deltaY<0?1:-1);
                const delay:number = Date.now()-this.startTouchTime;// from start tap to finish
                this.touchVelocity = 100*mag/(Date.now()-this.startTouchTime)

                event.deltaX = deltaX;
                event.deltaY = deltaY;
                event.mag = mag;
                event.angle = angle;
                event.avgVelocity = this.touchVelocity;
                event.touchPos = this.touchPos ? [this.touchPos[0], this.touchPos[1]] : [0,0];
                event.timeDelayFromStartToEnd = delay;
                event.startTouchTime = this.startTouchTime;
                event.eventTime = Date.now();
                event.moveCount = this.moveCount;
                event.translateEvent = this.translateEvent;
                event.scaleEvent = this.scaleEvent;
                
                try 
                {
                    if(delay < this.tap_and_swipe_delay_limit)
                    {
                        if(this.mag([deltaX, deltaY]) > Math.min(getWidth(), getHeight()) * 0.1)//swipe
                        {
                            event.swipe_direction = Math.abs(deltaX) > Math.abs(deltaY) ? (deltaX < 0 ? "left" : "right") :
                                (deltaY < 0 ? "up" : "down");
                            this.callHandler("swipe", event);
                        }
                        else if(this.timeSinceLastTouch < this.tap_and_swipe_delay_limit)
                        {
                            this.callHandler("doubletap", event);
                            this.double_tapped = true;
                        }
                        else//tap
                            this.callHandler("tap", event);
                        
                    }
                    else//tap
                        this.callHandler("longtap", event);
                    this.double_tapped = false;
                    this.callHandler("touchend", event);
                } 
                catch(error:any)
                {
                    console.log(error);
                    this.registeredTouch = false;
                }
            }
            this.touchMoveEvents = [];
            this.registeredTouch = false;
        }
    }
    mag(a:number[]):number
    {
        return Math.sqrt(a[0]*a[0]+a[1]*a[1]);
    }
    normalize(a:number[]):Array<number>
    {
        const magA = this.mag(a);
        a[0] /= magA;
        a[1] /= magA;
        return a;
    }
    dotProduct(a:number[], b:number[]):number
    {
        return a[0]*b[0]+a[1]*b[1];
    }
};
export interface MultiTouchEvent extends TouchMoveEvent {
    delta:number;
    distance:number;
    rotation_delta:number;
    rotation_theta:number;
    defaultPrevented:boolean;
    touches:TouchEvent[];
    preventDefault():void;
};
export class MultiTouchHandler {
    pred:(event:MultiTouchEvent) => boolean; 
    callBack:(event:MultiTouchEvent) => void;
    constructor(pred:(event:MultiTouchEvent) => boolean, callBack:(event:MultiTouchEvent) => void)
    {
        this.pred = pred;
        this.callBack = callBack;
    }
};
export class MultiTouchListenerTypes {
    pinch:Array<MultiTouchHandler>;
    rotate:Array<MultiTouchHandler>;
    touchstart:Array<TouchHandler>;
    touchmove:Array<TouchHandler>;
    touchend:Array<TouchHandler>;
    tap:Array<TouchHandler>;
    doubletap:Array<TouchHandler>;
    swipe:Array<TouchHandler>;
    constructor(){
        this.pinch = [];
        this.rotate = [];
        this.touchmove = [];
        this.doubletap = new Array<TouchHandler>();
        this.tap = new Array<TouchHandler>();
        this.swipe = new Array<TouchHandler>();
    }
};
export class MultiTouchListener {
    lastDistance:number;
    listener_type_map:MultiTouchListenerTypes;
    registeredMultiTouchEvent:boolean;
    previous_touches:any[];
    pinch_listening:boolean;
    start_delta_distance:number;
    pinch_distance:number;
    start_theta:number;
    rotation_theta:number;
    rotation_listening:boolean;
    single_touch_listener:SingleTouchListener;
    mouse_over_element:boolean;
    constructor(component:HTMLElement, preventDefault:boolean, mouseEmulation:boolean, stopRightClick:boolean, tap_and_swipe_delay_limit:number = 250)
    {
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
        if(isTouchSupported())
        {
            component.addEventListener('touchstart', event => {
                //if(event.touches.length < 1)
                  //  this.reset_state()
                this.touchStartHandler(event);
                this.single_touch_listener.touchStartHandler(event);
                if(preventDefault)
                    event.preventDefault();
            });
            component.addEventListener('touchmove', event => {
                this.touchMoveHandler(event);
                if(event.touches.length < 2)
                this.single_touch_listener.touchMoveHandler(event);
                if(preventDefault)
                    event.preventDefault();
            });
            component.addEventListener('touchend', event => {
                this.reset_state();
                this.single_touch_listener.touchEndHandler(event);
                if(preventDefault)
                    event.preventDefault();
            });
        }

        else if(mouseEmulation){
            if(stopRightClick)
                component.addEventListener("contextmenu", (e:any) => {
                    e.preventDefault();
                    return false;
                });
            component.addEventListener("mouseover", (event:any) => { this.mouse_over_element = true;});
            component.addEventListener("mouseleave", (event:any) => { this.mouse_over_element = false;});
            component.addEventListener('mousedown', (event:any) => {(<any>event).changedTouches = {};(<any>event).changedTouches.item = (x:any) => event; this.single_touch_listener.touchStartHandler(event);});
            component.addEventListener('mousemove', (event:any) => {
                (<any>event).changedTouches = {};(<any>event).changedTouches.item = (x:any) => event;
                this.single_touch_listener.touchMoveHandler(event);
                if(preventDefault)
                    event.preventDefault();
            });
            component.addEventListener('mouseup', (event:any) => {(<any>event).changedTouches = {};(<any>event).changedTouches.item = (x:any) => event; this.single_touch_listener.touchEndHandler(event)});
    
        }
    }    
    reset_state():void
    {
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
    registerCallBackPredicate(listenerType:string, predicate:(event:any) => boolean, callBack:(event:any) => void):void
    {
        if(listenerType in this.single_touch_listener.listener_type_map)
        {
            this.single_touch_listener.registerCallBack(listenerType, predicate, callBack);
        }
        else
            (<any> this.listener_type_map)[listenerType].push(new TouchHandler(predicate, callBack));
    }
    registerCallBack(listenerType, callBack:(event:any) => void):void
    {
        this.registerCallBackPredicate(listenerType, () => true, callBack);
    }
    callHandler(type:string, event:MultiTouchEvent):any
    {
        const handlers:MultiTouchHandler[] = (<any>this.listener_type_map)[type];
        handlers.forEach((handler:MultiTouchHandler) => {
            if(!event.defaultPrevented && handler.pred(event))
            {
                handler.callBack(event);
            }
        });
    }
    touchStartHandler(event:any):void
    {

    }
    touchMoveHandler(event:any):void
    {
        let touch1 = event.touches.item(0);
        let touch2 = event.touches.item(1);
        if(SingleTouchListener.mouseDown.getTouchCount() > 1)
        {
            this.registeredMultiTouchEvent = true;
            if(this.lastDistance === 0)
                this.lastDistance = Math.sqrt(Math.pow((touch1.clientX - touch2.clientX),2) + Math.pow(touch1.clientY - touch2.clientY, 2));
            if(this.start_theta === 0)
            {
                const temp1 = touch1.clientX < touch2.clientX ? touch1 : touch2;
                const temp2 = touch1.clientX < touch2.clientX ? touch2 : touch1;
                touch1 = temp1;
                touch2 = temp2;
                this.start_theta = this.get_theta(touch1, touch2);
            }
        }
        if(this.previous_touches.length > 1)
        {
            if(!touch1 && !touch2)
            {
                touch1 = this.previous_touches[0];
                touch2 = this.previous_touches[1];
            }
            else if(!touch2)
            {
                if(dist(touch1.clientX, touch1.clientY, this.previous_touches[0].clientX, this.previous_touches[0].clientY) < 
                    dist(touch1.clientX, touch1.clientY, this.previous_touches[1].clientX, this.previous_touches[1].clientY))
                {
                    touch2 = this.previous_touches[1];
                }
                else
                {
                    const temp = touch1;
                    touch1 = this.previous_touches[0];
                    touch2 = temp;
                }
            }
        }
        if(!(this.registeredMultiTouchEvent))
            return;
        
        const newDist:number = Math.sqrt(Math.pow((touch1.clientX - touch2.clientX),2) + Math.pow(touch1.clientY - touch2.clientY, 2));
        event.touchPos = [(touch1.clientX + touch2.clientX) / 2, (touch1.clientY + touch2.clientY) / 2];
        event.delta = this.lastDistance - newDist;
        event.distance = newDist;
        this.pinch_distance = newDist;
        const theta = this.get_theta(touch1, touch2);
        event.rotation_theta = theta;
        event.rotation_delta = -theta + this.rotation_theta;
        this.rotation_theta = theta;

        //handle start theta attribute, and rotation listening
        if(this.start_theta === -100)
            this.start_theta = theta;
        else if(!this.pinch_listening && Math.abs(this.start_theta - theta) > Math.PI / 12)
            this.rotation_listening = true;
        

        if(this.start_delta_distance === 0)
            this.start_delta_distance = newDist;
        else if(Math.abs(this.start_delta_distance - newDist) > Math.min(getHeight(), getWidth()) / 20 && Math.abs(event.delta) > Math.min(getHeight(), getWidth()) / 65)
            this.pinch_listening = true;

        if(this.rotation_listening)
            this.callHandler("rotate", event);
        //if(this.pinch_listening)
            this.callHandler("pinch", event);


        this.lastDistance = newDist;
        if(touch1 && touch2)
            this.previous_touches = [touch1, touch2];

    }
    get_theta(touch1:any, touch2:any):number
    {
        const vec = normalize([touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY]);
        return get_angle(vec[0], vec[1]);
    }
};
export class GenericListener extends MultiTouchListener {
    keyboard_listener:KeyboardHandler;
    constructor(component:HTMLElement, preventDefault, mouseEmulation, stopRightClick, tap_and_swipe_delay_limit)
    {
        super(component, preventDefault, mouseEmulation, stopRightClick, tap_and_swipe_delay_limit);
        this.keyboard_listener = new KeyboardHandler();
    }
    registerCallBackPredicate(listenerType:string, predicate:(event:any) => boolean, callBack:(event:any) => void):void
    {
        if(listenerType in this.listener_type_map || listenerType in this.single_touch_listener.listener_type_map)
            this.registerCallBackPredicate(listenerType, predicate, callBack);
        else
            this.keyboard_listener.registerCallBack(listenerType, predicate, callBack);
    }
    registerCallBack(listenerType, callBack:(event:any) => void):void
    {
        this.registerCallBackPredicate(listenerType, () => true, callBack);
    }
    
};
function dist(x1:number, y1:number, x2:number, y2:number):number
{
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}
export async function fetchImage(url:string):Promise<HTMLImageElement>
{
    const img = new Image();
    img.src =  URL.createObjectURL(await (await fetch(url)).blob());
    return img;
}