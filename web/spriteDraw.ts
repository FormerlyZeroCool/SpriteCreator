function sleep(ms):Promise<void> {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
}
function changeFavicon(src): void
{
    let link = document.createElement('link'),
        oldLink = document.getElementById('dynamic-favicon');
    link.id = 'dynamic-favicon';
    link.rel = 'shortcut icon';
    link.href = src;
    if (oldLink) {
     document.head.removeChild(oldLink);
    }
    document.head.appendChild(link);
}
fetchImage('/SpriteDraw/web/images/favicon.ico').then((value) =>
changeFavicon('/SpriteDraw/web/images/favicon.ico'));
fetchImage('images/favicon.ico').then((value) =>
changeFavicon('images/favicon.ico'));
const dim = [128,128];

function threeByThreeMat(a:number[], b:number[]):number[]
{
    return [a[0]*b[0]+a[1]*b[3]+a[2]*b[6], 
    a[0]*b[1]+a[1]*b[4]+a[2]*b[7], 
    a[0]*b[2]+a[1]*b[5]+a[2]*b[8],
    a[3]*b[0]+a[4]*b[3]+a[5]*b[6], 
    a[3]*b[1]+a[4]*b[4]+a[5]*b[7], 
    a[3]*b[2]+a[4]*b[5]+a[5]*b[8],
    a[6]*b[0]+a[7]*b[3]+a[8]*b[6], 
    a[6]*b[1]+a[7]*b[4]+a[8]*b[7], 
    a[6]*b[2]+a[7]*b[5]+a[8]*b[8]];
}
function matByVec(mat:number[], vec:number[]):number[]
{
    return [mat[0]*vec[0]+mat[1]*vec[1]+mat[2]*vec[2],
            mat[3]*vec[0]+mat[4]*vec[1]+mat[5]*vec[2],
            mat[6]*vec[0]+mat[7]*vec[1]+mat[8]*vec[2]];
}
class Queue<T> {
    data:T[];
    start:number;
    end:number;
    length:number;
    constructor()
    {
        this.data = [];
        this.data.length = 64;
        this.start = 0;
        this.end = 0;
        this.length = 0;
    }
    push(val):void
    {
        if(this.length === this.data.length)
        {
            const newData:T[] = [];
            newData.length = this.data.length << 1;
            for(let i = 0; i < this.data.length; i++)
            {
                newData[i] = this.data[(i+this.start)%this.data.length];
            }
            this.start = 0;
            this.end = this.data.length;
            this.data = newData;
            this.data[this.end++] = val;
            this.length++;
        }
        else
        {
            this.data[this.end++] = val; 
            this.end &= this.data.length - 1;
            this.length++;
        }
    }
    pop():T
    {
        if(this.length)
        {
            const val = this.data[this.start];
            this.start++;
            this.start &= this.data.length - 1;
            this.length--;
            return val;
        }
        throw new Error("No more values in the queue");
    }
    get(index:number):T
    {
        if(index < this.length)
        {
            return this.data[(index+this.start)&(this.data.length-1)];
        }
		throw new Error(`Could not get value at index ${index}`);
    }
    set(index:number, obj:T):void
    {
        if(index < this.length)
        {
            this.data[(index+this.start) & (this.data.length - 1)] = obj;
        }
		throw new Error(`Could not set value at index ${index}`);
    }
};
class RollingStack<T> {
    data:T[];
    start:number;
    end:number;
    size:number;
    reserve:number;
    constructor(size:number = 35)
    {
        this.data = [];
        this.start = 0;
        this.end = 0;
        this.reserve = size;
        this.size = 0;
        for(let i = 0; i < size; i++)
            this.data.push();
    }
    empty():void
    {
        this.start = 0;
        this.end = 0;
        this.size = 0;
    }
    length():number
    {
        return this.size;
    }
    pop():T
    {
        if(this.size)
        {
            this.size--;
            this.end--;
            if(this.end < 0)
                this.end = this.reserve - 1;
            return this.data[this.end];
        }
    }
    push(val:T):void
    {
        if(this.size >= this.reserve)
        {
            this.start++;
            this.start %= this.reserve;
            this.size--;
        }
        this.size++;
        this.data[this.end++] = val;
        this.end %= this.reserve;
    }
    set(index:number, obj:T):void
    {
        this.data[(this.start + index) % this.reserve] = obj;
    }
    get(index:number):T
    {
        return this.data[(this.start + index) % this.reserve];
    }
};

function blendAlphaCopy(color0:RGB, color:RGB):void
{
    const alphant:number = color0.alphaNormal();
    const alphanc:number = color.alphaNormal();
    const a:number = (1 - alphanc);
    const a0:number = (alphanc + alphant * a);
    const a1:number = 1/a0;
    color0.color = (((alphanc*color.red() +   alphant*color0.red() * a ) *a1) << 24) |
        (((alphanc*color.green() + alphant*color0.green() * a)*a1) << 16) | 
        (((alphanc*color.blue() +  alphant*color0.blue() * a) *a1) << 8) |
        (a0 * 255);
    /*this.setRed  ((alphanc*color.red() +   alphant*this.red() * a ) *a1);
    this.setBlue ((alphanc*color.blue() +  alphant*this.blue() * a) *a1);
    this.setGreen((alphanc*color.green() + alphant*this.green() * a)*a1);
    this.setAlpha(a0*255);*/
}
class RGB {
    color:number;
    constructor(r:number = 0, g:number = 0, b:number, a:number = 0)
    {
        this.color = 0;
        this.color = r << 24 | g << 16 | b << 8 | a;
    }
    blendAlphaCopy(color:RGB):void
    {
        blendAlphaCopy(this, color);
        /*this.setRed  ((alphanc*color.red() +   alphant*this.red() * a ) *a1);
        this.setBlue ((alphanc*color.blue() +  alphant*this.blue() * a) *a1);
        this.setGreen((alphanc*color.green() + alphant*this.green() * a)*a1);
        this.setAlpha(a0*255);*/
    }
    compare(color:RGB):boolean
    {
        return this.color === color.color;
    }
    copy(color:RGB):void
    {
        this.color = color.color;
    }
    toInt():number
    {
        return this.color;
    }
    toRGBA():Array<number>
    {
        return [this.red(), this.green(), this.blue(), this.alpha()]
    }
    red():number
    {
        return (this.color >> 24) & ((1<<8)-1);
    }
    green():number
    {
        return (this.color >> 16) & ((1 << 8) - 1);
    }
    blue():number
    {
        return (this.color >> 8) & ((1 << 8) - 1);
    }
    alpha():number
    {
        return (this.color) & ((1 << 8) - 1);
    }
    alphaNormal():number
    {
        return Math.round(((this.color & ((1 << 8) - 1)) / 255)*100)/100;
    }
    setRed(red:number)
    {
        this.color &= (1<<24)-1;
        this.color |= red << 24;
    }
    setGreen(green:number)
    {
        this.color &= ((1 << 16) - 1) | (((1<<8)-1) << 24);
        this.color |= green << 16;
    }
    setBlue(blue:number)
    {
        this.color &= ((1<<8)-1) | (((1<<16)-1) << 16);
        this.color |= blue << 8;
    }
    setAlpha(alpha:number)
    {
        this.color &=  (((1<<24)-1) << 8);
        this.color |= alpha;
    }
    loadString(color:string)
    { 
        let r:number 
        let g:number 
        let b:number 
        let a:number 
        if(color.substring(0,4).toLowerCase() !== "rgba"){
            r = parseInt(color.substring(1,3), 16);
            g = parseInt(color.substring(3,5), 16);
            b = parseInt(color.substring(5,7), 16);
            a = parseFloat(color.substring(7,9))*255;
        }
        else
        {
            const vals = color.split(",");
            vals[0] = vals[0].substring(5);
            vals[3] = vals[3].substring(0, vals[3].length -1);
            r = parseInt(vals[0], 10);
            g = parseInt(vals[1], 10);
            b = parseInt(vals[2], 10);
            a = parseFloat(vals[3])*255;
        }
        if(!isNaN(r) && r <= 255 && r >= 0)
        {
            this.setRed(r);
        }
        if(!isNaN(g) && g <= 255 && g >= 0)
        {
            this.setGreen(g);
        }
        if(!isNaN(b) && b <= 255 && b >= 0)
        {
            this.setBlue(b);
        }
        if(!isNaN(a) && a <= 255 && a >= 0)
        {
            this.setAlpha(a);
        }
    }
    htmlRBGA():string{
        return `rgba(${this.red()}, ${this.green()}, ${this.blue()}, ${this.alphaNormal()})`
    }
    htmlRBG():string{
        const red:string = this.red() < 16?`0${this.red().toString(16)}`:this.red().toString(16);
        const green:string = this.green() < 16?`0${this.green().toString(16)}`:this.green().toString(16);
        const blue:string = this.blue() < 16?`0${this.blue().toString(16)}`:this.blue().toString(16);
        return `#${red}${green}${blue}`
    }
};

class Pair<T,U = T> {
    first:T;
    second:U;
    constructor(first:T, second:U)
    {
        this.first = first;
        this.second = second;
    }

};
class ImageContainer {
    image:HTMLImageElement;
    name:string;
    constructor(imageName:string, imagePath:string)
    {
        this.image = null;
        fetchImage(imagePath).then(img => { 
            this.image = img;
        });
        this.name = imageName;
    }
};
interface GuiElement {
    active():boolean;
    deactivate():void;
    activate():void;
    width():number;
    height():number;
    refresh():void;
    draw(ctx:CanvasRenderingContext2D, x:number, y:number, offsetX:number, offsetY:number);
    handleKeyBoardEvents(type:string, e:any):void;
    handleTouchEvents(type:string, e:any):void;
    isLayoutManager():boolean;
};
class LexicoGraphicNumericPair extends Pair<number, number> {
    rollOver:number;
    constructor(rollOver:number)
    {
        super(0, 0);
        this.rollOver = rollOver;
    }
    incHigher(val:number = 1):number
    {
        this.first += val;
        return this.first;
    }
    incLower(val:number = 1):number
    {
        this.first += Math.floor((this.second + val) / this.rollOver);
        this.second = (this.second + val) % this.rollOver;
        return this.second;
    }
    hash():number
    {
        return this.first * this.rollOver + this.second;
    }
};
class RowRecord {
    x:number;
    y:number;
    width:number;
    height:number;
    element:GuiElement;
    constructor(x:number, y:number, width:number, height:number, element)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.element = element;
    }
}
class SimpleGridLayoutManager implements GuiElement {
    
    elements:GuiElement[];
    x:number;
    y:number;
    refreshRate:number;
    frameCounter:number;
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    matrixDim:number[];
    pixelDim:number[];
    elementsPositions:RowRecord[];
    focused:boolean;
    lastTouched:number;
    constructor(matrixDim:number[], pixelDim:number[], x:number = 0, y:number = 0)
    {
        this.lastTouched = 0;
        this.matrixDim = matrixDim;
        this.pixelDim = pixelDim;
        this.focused = false;
        this.x = x;
        this.y = y;
        this.refreshRate = 4;
        this.frameCounter = 0;
        this.elements = [];
        this.elementsPositions = [];
        this.canvas = document.createElement("canvas");
        this.canvas.width = pixelDim[0];
        this.canvas.height = pixelDim[1];
        this.ctx = this.canvas.getContext("2d");
    } 
    createHandlers(keyboardHandler:KeyboardHandler, touchHandler:SingleTouchListener):void
    {
        if(keyboardHandler)
        {
            keyboardHandler.registerCallBack("keydown", e => this.active(), 
            e => {e.keyboardHandler = keyboardHandler; this.elements.forEach(el => el.handleKeyBoardEvents("keydown", e))});
            keyboardHandler.registerCallBack("keyup", e => this.active(), 
            e => {e.keyboardHandler = keyboardHandler; this.elements.forEach(el => el.handleKeyBoardEvents("keyup", e))});
        }
        if(touchHandler)
        {
            touchHandler.registerCallBack("touchstart", e => this.active(), 
            e => this.handleTouchEvents("touchstart", e));
            touchHandler.registerCallBack("touchmove", e => this.active(), 
            e => this.handleTouchEvents("touchmove", e));
            touchHandler.registerCallBack("touchend", e => this.active(), 
            e => this.handleTouchEvents("touchend", e));
        }
    }  
    isLayoutManager():boolean {
        return true;
    } 
    handleKeyBoardEvents(type:string, e:any):void
    {
        this.elements.forEach(el => el.handleKeyBoardEvents(type, e));
        if(e.repaint)
        {
            this.refreshCanvas();
        }
    }
    handleTouchEvents(type:string, e:any):void
    {
        if(e.touchPos[0] >= 0 && e.touchPos[0] < this.width() &&
            e.touchPos[1] >= 0 && e.touchPos[1] < this.height())
        {
            let record:RowRecord = null;
            let index:number = 0;
            let runningNumber:number = 0;
            this.elementsPositions.forEach(el => {
                el.element.deactivate();
                el.element.refresh();
                if(e.touchPos[0] >= el.x && e.touchPos[0] < el.x + el.element.width() &&
                    e.touchPos[1] >= el.y && e.touchPos[1] < el.y + el.element.height())
                {
                    record = el;
                    index = runningNumber;
                }
                runningNumber++;
            });
            if(record)
            {
                e.preventDefault();
                if(type !== "touchmove")
                    record.element.activate();
                e.translateEvent(e, -record.x , -record.y);
                record.element.handleTouchEvents(type, e);
                e.translateEvent(e, record.x , record.y);
                record.element.refresh();
                if(e.repaint)
                {
                    this.refreshCanvas();
                }
                this.lastTouched = index;
            }
        }
    }
    refresh():void {
        this.refreshMetaData();
        this.refreshCanvas();
    }
    deactivate():void
    {
        this.focused = false;
        this.elements.forEach(el => {
            el.deactivate();
        });
    }
    activate():void
    {
        this.focused = true;
    }
    isCellFree(x:number, y:number):boolean
    {
        const pixelX:number = x * this.pixelDim[0] / this.matrixDim[0];
        const pixelY:number = y * this.pixelDim[1] / this.matrixDim[1];
        let free:boolean = true;
        if(pixelX < this.pixelDim[0] && pixelY < this.pixelDim[1])
        for(let i = 0; free && i < this.elementsPositions.length; i++)
        {
            const elPos:RowRecord = this.elementsPositions[i];
            if(elPos.x <= pixelX && elPos.x + elPos.width >= pixelX &&
                elPos.y <= pixelY && elPos.y + elPos.height >= pixelY)
                free = false;
        }
        else 
            free = false;
        return free;
    }
    refreshMetaData(xPos:number = 0, yPos:number = 0, offsetX:number = 0, offsetY:number = 0):void
    {
        this.elementsPositions.splice(0, this.elementsPositions.length);        
        const width:number = this.columnWidth();
        const height:number = this.rowHeight();
        let counter:LexicoGraphicNumericPair = new LexicoGraphicNumericPair(this.matrixDim[0]);
        let matX:number = 0;
        let matY:number = 0;
        for(let i = 0; i < this.elements.length; i++)
        {
            const element:GuiElement = this.elements[i];
            const elementWidth:number = Math.ceil(element.width() / this.columnWidth());
            let clearSpace:boolean = true;
            do {
                let j = counter.second;
                clearSpace = true;
                for(;clearSpace && j < counter.second + elementWidth; j++)
                {
                    clearSpace = this.isCellFree(j, counter.first);
                }
                if(!clearSpace && j < elementWidth)
                {
                    counter.incLower(j - counter.second);
                }
                else if(!clearSpace && j >= elementWidth)
                {
                    counter.incHigher();
                    counter.second = 0;
                }
            } while(!clearSpace && counter.first < this.matrixDim[1]);
            const x:number = counter.second * this.columnWidth();
            const y:number = counter.first * this.rowHeight();
            counter.second += elementWidth;
            const record:RowRecord = new RowRecord(x + xPos + offsetX, y + yPos + offsetY, element.width(), element.height(), element);
            this.elementsPositions.push(record);
        }
    }
    refreshCanvas(ctx:CanvasRenderingContext2D = this.ctx, x:number = 0, y:number = 0):void
    {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.elementsPositions.forEach(el => 
            el.element.draw(ctx, el.x, el.y, x, y));
    }
    active():boolean
    {
        return this.focused;
    }
    width(): number {
        return this.pixelDim[0];
    }
    setWidth(val:number): void {
        this.pixelDim[0] = val;
        this.canvas.width = val;
    }
    height(): number {
        return this.pixelDim[1];
    }
    setHeight(val:number): void {
        this.pixelDim[1] = val;
        this.canvas.height = val;
    }
    rowHeight():number
    {
        return this.pixelDim[1] / this.matrixDim[1];
    }
    columnWidth():number
    {
        return this.pixelDim[0] / this.matrixDim[0];
    }
    usedRows():number {
        for(let i = 0; i < this.elements.length; i++)
        {
            
        }
        return this.elements.length - 1;
    }
    hasSpace(element:GuiElement):boolean
    {
        const elWidth:number = Math.floor((element.width() / this.columnWidth()) * this.matrixDim[0]);
        const elHeight:number = Math.floor((element.height() / this.rowHeight()) * this.matrixDim[1]);
        if(this.elements.length)
        {
            //todo
        }
        //todo
        return false;
    }
    addElement(element:GuiElement, position:number = -1):boolean //error state
    {
        let inserted:boolean = false;
        if(position === -1)
        {
            this.elements.push(element);
        }
        else
        {
            this.elements.splice(position, 0, element);
        }
        this.refreshMetaData();
        this.refreshCanvas();
        return inserted;
    }
    elementPosition(element:GuiElement):number[]
    {
        const elPos:RowRecord = this.elementsPositions.find(el => el.element === element);
        return [elPos.x, elPos.y];
    }
    draw(ctx:CanvasRenderingContext2D, xPos:number = this.x, yPos:number = this.y, offsetX:number = 0, offsetY:number = 0)
    {
        this.refreshCanvas();
        ctx.drawImage(this.canvas, xPos + offsetX, yPos + offsetY);
    }
};
class GuiListItem extends SimpleGridLayoutManager {
    textBox:GuiTextBox;
    checkBox:GuiCheckBox;
    callBackType:string;
    callBack:(e) => void;
    constructor(text:string, state:boolean, pixelDim:number[], fontSize:number = 16, callBack:(e) => void = () => null, genericCallBack:(e) => void = () => null, flags:number = GuiTextBox.left | GuiTextBox.bottom, genericTouchType:string = "touchend")
    {
        super([20, 1], pixelDim);
        this.callBackType = genericTouchType;
        this.callBack = genericCallBack;
        this.checkBox = new GuiCheckBox(callBack, pixelDim[1], pixelDim[1]);
        this.textBox = new GuiTextBox(false, pixelDim[0] - fontSize * 2 - 10, null, fontSize, pixelDim[1], flags);
        this.textBox.setText(text);
        this.checkBox.checked = state;
        this.checkBox.refresh();
        this.addElement(this.checkBox);
        this.addElement(this.textBox);
    }
    handleTouchEvents(type: string, e: any): void {
        super.handleTouchEvents(type, e);
        if(this.active() && type === this.callBackType)
        {
            e.item = this;
            this.callBack(e);
        }
    }
    state():boolean {
        return this.checkBox.checked;
    }
};
class GuiCheckList implements GuiElement {
    limit:number;
    list:GuiListItem[];
    dragItem:GuiListItem;
    dragItemLocation:number[];
    dragItemInitialIndex:number;
    layoutManager:SimpleGridLayoutManager;
    fontSize:number;
    focused:boolean;
    swapElementsInParallelArray:(x1, x2) => void;
    constructor(matrixDim:number[], pixelDim:number[], fontSize:number, swap:(x1, x2) => void = null)
    {
        this.focused = true;
        this.fontSize = fontSize;
        this.layoutManager = new SimpleGridLayoutManager ([1,matrixDim[1]], pixelDim);
        this.list = [];
        this.limit = 0;
        this.dragItem = null;
        this.dragItemLocation = [-1, -1];
        this.dragItemInitialIndex = -1;
        this.swapElementsInParallelArray = swap;
    }
    push(text:string, state:boolean = true, checkBoxCallback:(event) => void, onClickGeneral:(event) => void): void
    {
        this.list.push(new GuiListItem(text, state, [this.width(),
            this.height() / this.layoutManager.matrixDim[1] - 5], this.fontSize, checkBoxCallback, onClickGeneral));
    }
    selected():number
    {
        return this.layoutManager.lastTouched;
    }
    selectedItem():GuiListItem
    {
        if(this.selected() !== -1)
            return this.list[this.selected()];
        else
            return null;
    }
    findBasedOnCheckbox(checkBox:GuiCheckBox):number
    {
        let index:number = 0;
        for(; index < this.list.length; index++)
        {
            if(this.list[index].checkBox === checkBox)
                break;
        }
        return index;
    }
    get(index:number):GuiListItem
    {
        if(this.list[index])
            return this.list[index];
        else
            return null;
    }
    isChecked(index:number):boolean
    {
        return this.list[index] ? this.list[index].checkBox.checked : null;
    }
    delete(index:number):void 
    {
        if(this.list[index])
        {
            this.list.splice(index, 1);
            this.refresh();
        }
    }
    active():boolean
    {
        return this.focused;
    }
    deactivate():void 
    {
        this.focused = false;
    }
    activate():void
    {
        this.focused = true;
    }
    width():number
    {
        return this.layoutManager.width();
    }
    height():number
    {
        return this.layoutManager.height();
    }
    refresh():void
    {
        this.layoutManager.elements = this.list;
        this.layoutManager.refresh();
    }
    draw(ctx:CanvasRenderingContext2D, x:number, y:number, offsetX:number, offsetY:number)
    {
        //this.layoutManager.draw(ctx, x, y, offsetX, offsetY);
        const itemsPositions:RowRecord[] = this.layoutManager.elementsPositions;
        let offsetI:number = 0;
        for(let i = 0; i < itemsPositions.length; i++)
        {
            if(this.dragItemLocation[1] !== -1 && i === Math.floor((this.dragItemLocation[1] / this.height()) * this.layoutManager.matrixDim[1]))
            {
                offsetI++;
            }
            this.list[i].draw(ctx, x, y + offsetI * (this.height() / this.layoutManager.matrixDim[1]), offsetX, offsetY);
            offsetI++;
        }
        if(this.dragItem)
            this.dragItem.draw(ctx, x + this.dragItemLocation[0] - this.dragItem.width() / 2, y + this.dragItemLocation[1] - this.dragItem.height() / 2, offsetX, offsetY);
    }
    handleKeyBoardEvents(type:string, e:any):void
    {
        this.layoutManager.handleKeyBoardEvents(type, e);
    }
    handleTouchEvents(type:string, e:any):void
    {
        this.layoutManager.handleTouchEvents(type, e);
        const clicked:number = Math.floor((e.touchPos[1] / this.height()) * this.layoutManager.matrixDim[1]);
        this.layoutManager.lastTouched = clicked > this.list.length ? this.list.length - 1 : clicked;
        switch(type)
        {
            case("touchend"):
            if(this.dragItem)
            {
                this.list.splice(clicked, 0, this.dragItem);
                if(this.swapElementsInParallelArray && this.dragItemInitialIndex !== -1)
                {
                    if(clicked > this.list.length)
                        this.swapElementsInParallelArray(this.dragItemInitialIndex, this.list.length - 1);
                    else
                    this.swapElementsInParallelArray(this.dragItemInitialIndex, clicked);
                }
                this.dragItem = null;
                this.dragItemInitialIndex = -1;
                this.dragItemLocation[0] = -1;
                this.dragItemLocation[1] = -1;
            }
            if(this.selectedItem())
                this.selectedItem().callBack(e);
            break;
            case("touchmove"):
            const movesNeeded:number = isTouchSupported()?7:2;
            if(e.moveCount === movesNeeded && this.selectedItem() && this.list.length > 1)
            {
                this.dragItem = this.list.splice(this.selected(), 1)[0];
                this.dragItemInitialIndex = this.selected();
                this.dragItemLocation[0] = e.touchPos[0];
                this.dragItemLocation[1] = e.touchPos[1];
            }
            else if(e.moveCount > movesNeeded)
            {
                this.dragItemLocation[0] += e.deltaX;
                this.dragItemLocation[1] += e.deltaY;
            }
            break;
        }
    }
    isLayoutManager():boolean
    {
        return false;
    }
};
class GuiButton implements GuiElement {

    text:string;
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    dimensions:number[];//[width, height]
    fontSize:number;
    pressedColor:RGB;
    unPressedColor:RGB;
    pressed:boolean;
    focused:boolean;
    font:FontFace;
    fontName:string
    callback:() => void;constructor(callBack:() => void, text:string, width:number = 200, height:number = 50, fontSize:number = 12, pressedColor:RGB = new RGB(150, 150, 200, 1), unPressedColor:RGB = new RGB(255, 255, 255), fontName:string = "button_font")
    {
        this.text = text;
        this.fontSize = fontSize;
        this.dimensions = [width, height];
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext("2d");
        this.pressedColor = pressedColor;
        this.unPressedColor = unPressedColor;
        this.pressed = false;
        this.focused = true;
        this.callback = callBack;
        this.fontName = fontName;
        //if(document.fonts.check(`16px ${this.fontName}`, "a"))
        {
            this.font = new FontFace(`${this.fontName}`, 'url(/SpriteDraw/web/fonts/Minecraft.ttf)');
            this.font.load().then((loaded_face) =>{
                document.fonts.add(loaded_face);
                this.drawInternal();
            }, (error:Error) => {
                this.font = new FontFace(`${this.fontName}`, 'url(/fonts/Minecraft.ttf)');
                this.font.load().then(loaded_face => {
                        document.fonts.add(loaded_face);
                        this.drawInternal();
                    }, (error:Error) => {
                        console.log(error.message);
                        this.drawInternal();
                    });
            });
        }
    }
    handleKeyBoardEvents(type:string, e:any):void
    {
        if(this.active()){
            if(e.code === "Enter"){
                switch(type)
                {
                    case("keydown"):
                        this.pressed = true;
                        this.drawInternal();
                    break;
                    case("keyup"):
                        this.callback();
                        this.pressed = false;
                        this.drawInternal();
                        this.deactivate();
                    break;
                }
            }
        }
    }
    handleTouchEvents(type:string, e:any):void
    {
        if(this.active())
            switch(type)
            {
                case("touchstart"):
                    this.pressed = true;
                    this.drawInternal();
                break;
                case("touchend"):
                    this.callback();
                    this.pressed = false;
                    this.drawInternal();
                break;
            }
            
    }
    isLayoutManager():boolean {
        return false;
    } 
    active():boolean
    {
        return this.focused;
    }
    deactivate():void
    {
        this.focused = false;
    }
    activate():void
    {
        this.focused = true;
    }
    width(): number {
        return this.dimensions[0];
    }
    height(): number {
        return this.dimensions[1];
    }
    setCtxState(ctx:CanvasRenderingContext2D):void
    {
        ctx.strokeStyle = "#000000";
        if(this.pressed)
            ctx.fillStyle = this.pressedColor.htmlRBG();
        else
            ctx.fillStyle = this.unPressedColor.htmlRBG();
        ctx.font = this.fontSize + `px ${this.fontName}`;
    }
    refresh(): void {
        this.drawInternal();
    }
    drawInternal(ctx:CanvasRenderingContext2D = this.ctx):void
    {
        const fs = ctx.fillStyle;
        this.setCtxState(ctx);
        ctx.fillRect(0, 0, this.width(), this.height());
        ctx.strokeRect(0, 0, this.width(), this.height());
        ctx.fillStyle = "#000000";
        const textWidth:number = ctx.measureText(this.text).width;
        const textHeight:number = this.fontSize;
        ctx.fillText(this.text, this.width() / 2 - textWidth / 2, this.height() / 2 + textHeight / 2, this.width());
        ctx.fillStyle = fs;
    } 
    draw(ctx:CanvasRenderingContext2D, x:number, y:number, offsetX:number = 0, offsetY:number = 0):void
    {
        ctx.drawImage(this.canvas, x + offsetX, y + offsetY);
    }
};
class GuiCheckBox implements GuiElement {

    checked:boolean;
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    dimensions:number[];//[width, height]
    fontSize:number;
    pressedColor:RGB;
    unPressedColor:RGB;
    pressed:boolean;
    focused:boolean;
    callback:(event) => void;
    constructor(callBack:(event) => void, width:number = 50, height:number = 50, checked:boolean = false, unPressedColor:RGB = new RGB(255, 255, 255, 255), pressedColor:RGB = new RGB(150, 150, 200, 255), fontSize:number = height - 10)
    {
        this.checked = checked;
        this.fontSize = fontSize;
        this.dimensions = [width, height];
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext("2d");
        this.pressedColor = pressedColor;
        this.unPressedColor = unPressedColor;
        this.pressed = false;
        this.focused = true;
        this.callback = callBack;
        this.drawInternal();
    }
    handleKeyBoardEvents(type:string, e:any):void
    {
        if(this.active()){
            if(e.code === "Enter"){
                switch(type)
                {
                    case("keydown"):
                        this.pressed = true;
                        this.drawInternal();
                    break;
                    case("keyup"):
                        e.checkBox = this;
                        this.callback(e);
                        this.pressed = false;
                        this.drawInternal();
                        this.deactivate();
                    break;
                }
            }
        }
    }
    isLayoutManager():boolean {
        return false;
    } 
    handleTouchEvents(type:string, e:any):void
    {
        if(this.active())
            switch(type)
            {
                case("touchstart"):
                    this.pressed = true;
                    this.drawInternal();
                break;
                case("touchend"):
                    this.checked = !this.checked;
                    this.pressed = false;
                    e.checkBox = this;
                    this.callback(e);
                    this.drawInternal();
                break;
            }
            
    }
    active():boolean
    {
        return this.focused;
    }
    deactivate():void
    {
        this.focused = false;
    }
    activate():void
    {
        this.focused = true;
    }
    width(): number {
        return this.dimensions[0];
    }
    height(): number {
        return this.dimensions[1];
    }
    setCtxState(ctx:CanvasRenderingContext2D):void
    {
        if(this.pressed)
            ctx.fillStyle = this.pressedColor.htmlRBGA();
        else
            ctx.fillStyle = this.unPressedColor.htmlRBGA();
        ctx.font = this.fontSize + 'px Calibri';
    }
    refresh(): void {
        this.drawInternal();
    }
    drawInternal(ctx:CanvasRenderingContext2D = this.ctx):void
    {
        const fs = ctx.fillStyle;
        this.setCtxState(ctx);
        ctx.fillRect(0, 0, this.width(), this.height());
        ctx.fillStyle = "#000000";
        ctx.fillText(this.checked?"\u2713":"", this.width()/2 - this.ctx.measureText("\u2713").width/2, 0 + this.fontSize, this.width());
        ctx.strokeRect(1, 1, this.canvas.width - 2, this.canvas.height - 2);
        ctx.fillStyle = fs;
    } 
    draw(ctx:CanvasRenderingContext2D, x:number, y:number, offsetX:number = 0, offsetY:number = 0):void
    {
        ctx.drawImage(this.canvas, x + offsetX, y + offsetY);
    }
};
class TextRow { 
    text:string;
    x:number;
    y:number;
    width:number;
    constructor(text:string, x:number, y:number, width:number)
    {
        this.text = text;
        this.x = x;
        this.y = y;
        this.width = width;
    }
};
class Optional<T> {
    data:T;
    null:boolean;
    constructor(){
        this.null = true;
    }
    get():T
    {
        if(!this.null)
            return this.data;
        return null;
    } 
    set(data:T):void
    {
        this.data = data;
        this.null = false;
    }
    clear():void
    {
        this.null = true;
    }
};
class GuiTextBox implements GuiElement {
    text:string;
    asNumber:Optional<number>;
    rows:TextRow[];
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    cursor:number;
    scaledCursorPos:number[];
    cursorPos:number[];
    scroll:number[];
    focused:boolean;
    selectedColor:RGB;
    unSelectedColor:RGB;
    dimensions:number[];//[width, height]
    fontSize:number;
    static center:number = 0;
    static bottom:number = 1;
    static top:number = 2;
    static verticalAlignmentFlagsMask:number = 0b0011;
    static left:number = 0;
    static hcenter:number = (1 << 2);
    static right:number = (2 << 2);
    static farleft:number = (3 << 2);
    static horizontalAlignmentFlagsMask:number = 0b1100;
    static default:number =  GuiTextBox.center | GuiTextBox.left;

    static textLookup = {};
    static numbers = {};
    static specialChars = {};
    static textBoxRunningNumber:number = 0;
    textBoxId:number;
    flags:number;
    submissionButton:GuiButton;
    promptText:string;
    font:FontFace;
    fontName:string;
    handleKeyEvents:boolean
    constructor(keyListener:boolean, width:number, submit:GuiButton = null, fontSize:number = 16, height:number = 2*fontSize, flags:number = GuiTextBox.default,
        selectedColor:RGB = new RGB(80, 80, 220), unSelectedColor:RGB = new RGB(100, 100, 100), fontName = "textBox_default", customFontFace:FontFace = null)
    {
        this.handleKeyEvents = keyListener;
        GuiTextBox.textBoxRunningNumber++;
        this.textBoxId = GuiTextBox.textBoxRunningNumber;
        this.cursor = 0;
        this.flags = flags;
        this.focused = false;
        this.promptText = "Enter text here:";
        this.submissionButton = submit;
        this.selectedColor = selectedColor;
        this.unSelectedColor = unSelectedColor;
        this.asNumber = new Optional<number>();
        this.text = "";
        this.scroll = [0, 0];
        this.scaledCursorPos = [0, 0];
        this.cursorPos = [0, 0];
        this.rows = [];
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext("2d");
        this.dimensions = [width, height];
        this.fontSize = fontSize;
        this.fontName = fontName;
        //if(document.fonts.check(`16px ${this.fontName}`))
        {
            if(customFontFace){
                this.font = customFontFace;
                this.font.family
            }
            else
                this.font = new FontFace(fontName, 'url(/SpriteDraw/web/fonts/Minecraft.ttf)');
            this.font.load().then((loaded_face) =>{
                document.fonts.add(loaded_face);
                this.drawInternalAndClear();
            }, (error:Error) => {
                this.font = new FontFace(fontName, 'url(/fonts/Minecraft.ttf)');
                this.font.load().then(loaded_face => {
                        document.fonts.add(loaded_face);
                        this.refresh();
                    }, (error:Error) => {
                        console.log(error.message);
                        this.refresh();
                    });
            });
        }
    }
    //take scaled pos calc delta from cursor pos
    //
    isLayoutManager():boolean {
        return false;
    } 
    hflag():number {
        return this.flags & GuiTextBox.horizontalAlignmentFlagsMask;
    }
    hcenter():boolean {
        return this.hflag() === GuiTextBox.hcenter;
    }
    left():boolean {
        return this.hflag() === GuiTextBox.left;
    }
    farleft():boolean {
        return this.hflag() === GuiTextBox.farleft;
    }
    right():boolean {
        return this.hflag() === GuiTextBox.right;
    }
    center():boolean
    {
        return (this.flags & GuiTextBox.verticalAlignmentFlagsMask) === GuiTextBox.center;
    }
    top():boolean
    {
        return (this.flags & GuiTextBox.verticalAlignmentFlagsMask) === GuiTextBox.top;
    }
    bottom():boolean
    {
        return (this.flags & GuiTextBox.verticalAlignmentFlagsMask) === GuiTextBox.bottom;
    }
    handleKeyBoardEvents(type:string, e:any):void
    {
        let preventDefault:boolean = false;
        if(this.active() && this.handleKeyEvents) {
            preventDefault = true;
            switch(type)
            {
                case("keydown"):
                switch(e.code)
                {
                    case("Enter"):
                    this.deactivate();
                    if(this.submissionButton)
                    {
                        this.submissionButton.activate();
                        this.submissionButton.handleKeyBoardEvents(type, e);
                    }
                    break;
                    case("Space"):
                        this.text = this.text.substring(0, this.cursor) + ' ' + this.text.substring(this.cursor, this.text.length);
                        this.cursor++;
                    break;
                    case("Backspace"):
                        this.text = this.text.substring(0, this.cursor-1) + this.text.substring(this.cursor, this.text.length);
                        this.cursor -= +(this.cursor>0);
                    break;
                    case("Delete"):
                        this.text = this.text.substring(0, this.cursor) + this.text.substring(this.cursor+1, this.text.length);
                    break;
                    case("ArrowLeft"):
                        this.cursor -= +(this.cursor > 0);
                    break;
                    case("ArrowRight"):
                        this.cursor += +(this.cursor < this.text.length);
                    break;
                    case("ArrowUp"):
                        this.cursor = 0;
                    break;
                    case("ArrowDown"):
                        this.cursor = (this.text.length);
                    break;
                    case("Period"):
                    this.text = this.text.substring(0, this.cursor) + "." + this.text.substring(this.cursor, this.text.length);
                    this.cursor++;
                    break;
                    case("Comma"):
                    this.text = this.text.substring(0, this.cursor) + "," + this.text.substring(this.cursor, this.text.length);
                    this.cursor++;
                    break;
                    default:
                    {
                        let letter:string = e.code.substring(e.code.length - 1);
                        if(!e.keysHeld["ShiftRight"] && !e.keysHeld["ShiftLeft"])
                            letter = letter.toLowerCase();
                        if(GuiTextBox.textLookup[e.code] || GuiTextBox.numbers[e.code])
                        {
                            this.text = this.text.substring(0, this.cursor) + letter + this.text.substring(this.cursor, this.text.length);
                            this.cursor++;
                        }
                        else if(GuiTextBox.specialChars[e.code])
                        {
                            //todo
                        }

                    }
                }
                if(!isNaN(Number(this.text)))
                {
                    this.asNumber.set(Number(this.text))
                }
                else
                    this.asNumber.clear();
                this.drawInternalAndClear();
            }
        }
        if(preventDefault)
            e.preventDefault();
    }
    setText(text:string):void
    {
        this.text = text;
        this.cursor = text.length;
        this.calcNumber();
        this.drawInternalAndClear();
    }
    calcNumber():void
    {
        if(!isNaN(Number(this.text)))
        {
            this.asNumber.set(Number(this.text))
        }
        else
            this.asNumber.clear();
    }
    handleTouchEvents(type:string, e:any):void
    {
        if(this.active()){
            switch(type)
            {
                case("touchend"):
                if(isTouchSupported() && this.handleKeyEvents)
                {
                    const value = prompt(this.promptText, this.text);
                    if(value)
                    {
                        this.setText(value);
                        this.calcNumber();
                        this.deactivate();
                        if(this.submissionButton)
                        {
                            this.submissionButton.activate();
                            this.submissionButton.callback();
                        }
                    }
                }
                this.drawInternalAndClear();

            }
        }
    }
    static initGlobalText():void
    {
        for(let i = 65; i < 65+26; i++)
            GuiTextBox.textLookup["Key" + String.fromCharCode(i)] = true;
    };
    static initGlobalNumbers():void
    {
        for(let i = 48; i < 48+10; i++){
            GuiTextBox.numbers["Digit" + String.fromCharCode(i)] = true;
        }
    };
    static initGlobalSpecialChars():void
    {
        //specialChars
    }
    active():boolean
    {
        return this.focused;
    }
    deactivate():void
    {
        this.focused = false;
        this.refresh();
    }
    activate():void
    {
        this.focused = true;
        this.refresh();
    }
    textWidth():number
    {
        return this.ctx.measureText(this.text).width;
    }
    setCtxState():void
    {
        this.ctx.strokeStyle = "#000000";
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.font = this.fontSize + `px ${this.fontName}`;
    }
    width(): number {
        return this.dimensions[0];
    }
    height(): number {
        return this.dimensions[1];
    }
    refreshMetaData(text:string = this.text, x:number = 0, y:number = this.fontSize, cursorOffset:number = 0): Pair<number, number[]>
    {
        if(text.search("\n") !== -1)
        {
            const rows:string[] = text.split("\n");
           let indeces:Pair<number, number[]> = new Pair(cursorOffset, [x, y]);
            rows.forEach(row => {
                indeces = this.refreshMetaData(row, indeces.second[0], indeces.second[1] + this.fontSize, indeces.first);
            });
            return indeces;
        }
        const textWidth:number = this.ctx.measureText(text).width;
        const canvasWidth:number = this.canvas.width;
        const rows:number = Math.ceil(textWidth / (canvasWidth - (20+x)));
        const charsPerRow:number = Math.floor(text.length / rows);
        const cursor:number = this.cursor - cursorOffset;
        let charIndex:number = 0;
        let i = 0;
        for(; i < rows - 1; i++)
        {
            const yPos:number = i * this.fontSize + y;
            if(cursor >= charIndex && cursor <= charIndex + charsPerRow)
            {
                this.cursorPos[1] = yPos;
                const substrWidth:number = this.ctx.measureText(text.substring(charIndex, cursor)).width;
                this.cursorPos[0] = substrWidth + x;
            }
            const substr:string = text.substring(charIndex, charIndex + charsPerRow);
            this.rows.push(new TextRow(substr, x, yPos, this.width() - x));
            charIndex += charsPerRow;
        }
        const yPos = i * this.fontSize + y;
        const substring:string = text.substring(charIndex, text.length);
        const substrWidth:number = this.ctx.measureText(substring).width;
        

        if(substrWidth > this.width() - x)
            this.refreshMetaData(substring, x, i * this.fontSize + y, cursorOffset + charIndex);
        else if(substring.length > 0){
            if(cursor >= charIndex)
            {
                this.cursorPos[1] = yPos;
                const substrWidth:number = this.ctx.measureText(text.substring(charIndex, cursor)).width
                this.cursorPos[0] = substrWidth + x;
            }
            this.rows.push(new TextRow(substring, x, yPos, this.width() - x));
        }
        return new Pair(cursorOffset + charIndex, [x, i * this.fontSize + y]);
    }
    cursorRowIndex():number
    {
        let index:number = 0;
        for(let i = 0; i < this.rows.length; i++)
        {
            const row:TextRow = this.rows[i];
            if(row.y === this.cursor[1])
                index = i;
        }
        return index;
    }
    adjustScrollToCursor():TextRow[]
    {
        let deltaY:number = 0;
        let deltaX:number = 0;
        if(this.top())
        {   
            if(this.cursorPos[1] > this.height() - this.fontSize)
            {
                deltaY += this.cursorPos[1] - this.fontSize;
            }
            else if(this.cursorPos[1] < this.fontSize)
            {
                deltaY -= this.cursorPos[1] + this.fontSize;
            }
        } 
        else if(this.center())
        {
            if(this.cursorPos[1] > this.height()/2 + this.fontSize/2)
            {
                deltaY += this.cursorPos[1] - this.height() + this.height()/2;
            }
            else if(this.cursorPos[1] < this.height()/2 + this.fontSize/2)
            {
                deltaY += this.cursorPos[1] - (this.height()/2);
            }
        }
        else
        {
            if(this.cursorPos[1] > this.height() - 3)
            {
                deltaY += this.cursorPos[1] - this.height() + this.fontSize/3;
            }
            else if(this.cursorPos[1] < this.height() - 3)
            {

                deltaY += this.cursorPos[1] - this.height() + this.fontSize/3;
            }
        }
        if(this.rows.length)
        {
            let freeSpace:number = this.width();// - this.rows[0].width;
            let maxWidth:number = 0;
            this.rows.forEach(el => {
                const width:number = this.ctx.measureText(el.text).width;
                if(freeSpace > this.width() - width)
                {
                    freeSpace = this.width() - width;
                    maxWidth = width;
                }
            });
            if(this.hcenter())
            {
                deltaX -= freeSpace / 2 - maxWidth / 2;
            }
            else if(this.left())
            {
                deltaX -= this.ctx.measureText("0").width / 3;
            }
            else if(this.right())
            {
                deltaX -= freeSpace + this.ctx.measureText("0").width / 3;
            }
        }
        const newRows:TextRow[] = [];
        this.rows.forEach(row => newRows.push(new TextRow(row.text, row.x - deltaX, row.y - deltaY, row.width)));
        this.scaledCursorPos[1] = this.cursorPos[1] - deltaY;
        this.scaledCursorPos[0] = this.cursorPos[0] - deltaX;
        return newRows;
    }
    drawRows(rows:TextRow[]):void
    {
        rows.forEach(row => this.ctx.fillText(row.text, row.x, row.y, row.width));
    }
    drawCursor():void{
        if(this.active() && this.handleKeyEvents)
        {
            this.ctx.fillStyle = "#000000";
            this.ctx.fillRect(this.scaledCursorPos[0], this.scaledCursorPos[1] - this.fontSize+3, 2, this.fontSize-2);
        }
    }
    color():RGB
    {
        if(this.active())
            return this.selectedColor;
        else
            return this.unSelectedColor;
    }
    refresh(): void {
        this.drawInternalAndClear();
    }
    drawInternalAndClear():void
    {
        this.setCtxState();
        this.ctx.fillRect(0, 0, this.width(), this.height());
        this.ctx.fillStyle = "#000000";
        this.rows.splice(0,this.rows.length);
        this.refreshMetaData();
        this.drawRows(this.adjustScrollToCursor());
        this.drawCursor();
        this.ctx.strokeStyle = this.color().htmlRBG();
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(0, 0, this.width(), this.height());
    }
    draw(ctx:CanvasRenderingContext2D, x:number, y:number, offsetX:number = 0, offsetY:number = 0)
    {
        ctx.drawImage(this.canvas, x + offsetX, y + offsetY);
    }
};
class GuiLabel extends GuiTextBox {
    constructor(text:string, width:number, fontSize:number = 16, flags:number = GuiTextBox.bottom, height:number = 2*fontSize, 
        backgroundColor:RGB = new RGB(255, 255, 255, 0))
    {
        super(false, width, null, fontSize, height, flags, backgroundColor, backgroundColor);
        this.setText(text);
    }
    //override the textbox's handlers
    handleKeyBoardEvents(type:string, e:any):void {}
    handleTouchEvents(type:string, e:any):void {}
    active(): boolean {
        return false;
    }
};
GuiTextBox.initGlobalText();
GuiTextBox.initGlobalNumbers();
GuiTextBox.initGlobalSpecialChars();
class GuiToolBar implements GuiElement {
    tools:ToolBarItem[];
    focused:boolean;
    toolRenderDim:number[];
    toolsPerRow:number;//could also be per column depending on render settings
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    vertical:boolean
    selected:number;
    constructor(renderDim:number[], tools:Tool[] = []) {
        this.focused = false;
        this.selected = 0;
        this.vertical = true;
        this.toolsPerRow = 10;
        this.toolRenderDim = [renderDim[0], renderDim[1]];
        this.tools = tools;
        this.canvas = document.createElement("canvas");
        this.canvas.height = this.height();
        this.canvas.width = this.width();
        this.ctx = this.canvas.getContext("2d");
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.strokeStyle = "#000000";
    }
    resize(width:number = this.width(), height:number = this.height()):void
    {
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext("2d");
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.strokeStyle = "#000000";
    }
    active():boolean {
        return this.focused;
    }
    deactivate():void {
        this.focused = false;
    }
    activate():void {
        this.focused = true;
    }
    width():number {
        if(this.vertical)
            return this.toolRenderDim[0] * (1+Math.floor(this.tools.length / this.toolsPerRow));
        else
            return this.toolRenderDim[0] * this.toolsPerRow;
    }
    height():number {
        if(this.vertical)
            return this.toolRenderDim[1] * this.toolsPerRow;
        else
            return this.toolRenderDim[1] * (1+Math.floor(this.tools.length / this.toolsPerRow));
    }
    refresh():void {
        this.ctx.fillRect(0, 0, this.width(), this.height());
        for(let i = 0; i < this.tools.length; i++)
        {
            let gridX:number = 0;
            let gridY:number = 0;
            if(this.vertical)
            {
                const toolsPerColumn:number = this.toolsPerRow;
                gridX = Math.floor(i / toolsPerColumn);
                gridY = i % toolsPerColumn;
            }
            else
            {   
                gridX = i % this.toolsPerRow;
                gridY = Math.floor(i / this.toolsPerRow);
            }
            const pixelX:number = gridX * this.toolRenderDim[0];
            const pixelY:number = gridY * this.toolRenderDim[1];
            const image:HTMLImageElement = this.tools[i].image();
            if(image)
            {
                this.ctx.drawImage(image, pixelX, pixelY, this.toolRenderDim[0], this.toolRenderDim[1]);
            }
            else
            {
                console.log("Still loading image for: ", this.tools[i].name());
            }
            if(this.selected === i)
            {
                this.ctx.strokeRect(pixelX + 1, pixelY + 1, this.toolRenderDim[0] - 2, this.toolRenderDim[1] - 2);
            }
        }
    }
    draw(ctx:CanvasRenderingContext2D, x:number, y:number, offsetX:number = 0, offsetY:number = 0) {
        ctx.drawImage(this.canvas, x + offsetX, y + offsetY);
    }
    handleKeyBoardEvents(type:string, e:any):void {}
    tool():ToolBarItem {
        return this.tools[this.selected];
    }
    handleTouchEvents(type:string, e:any):void {
        if(this.active())
        {
            switch(type){
                case("touchstart"):
                const x:number = Math.floor(e.touchPos[0] / this.toolRenderDim[0]);
                const y:number = Math.floor(e.touchPos[1] / this.toolRenderDim[1]);
                const clicked:number = this.vertical?y + x * this.toolsPerRow : x + y * this.toolsPerRow;
                if(clicked >= 0 && clicked < this.tools.length)
                {
                    this.selected = clicked;
                }
            }
            this.refresh();
        }
    }
    isLayoutManager():boolean {
        return false;
    }
};
class ToolBarItem {
    toolImage:ImageContainer;
    constructor(toolName:string, toolImagePath:string)
    {
        this.toolImage = new ImageContainer(toolName, toolImagePath);
    }
    width():number
    {
        return this.toolImage.image.width;
    }
    height():number
    {
        return this.toolImage.image.height;
    }
    image():HTMLImageElement
    {
        return this.toolImage.image;
    }
    name():string
    {
        return this.toolImage.name;
    }
    drawImage(ctx:CanvasRenderingContext2D, x:number, y:number, width:number, height:number)
    {
        if(this.image())
        {
            ctx.drawImage(this.image(), x, y, width, height);
        }
    }
};
abstract class Tool extends ToolBarItem{
    constructor(toolName:string, toolImagePath:string)
    {
        super(toolName, toolImagePath);
    }
    abstract optionPanelSize():number[];
    abstract activateOptionPanel():void;
    abstract deactivateOptionPanel():void;
    abstract getOptionPanel():SimpleGridLayoutManager;
    abstract drawOptionPanel(ctx, x:number, y:number):void;

};
class ViewLayoutTool extends Tool {
    layoutManager:SimpleGridLayoutManager;
    constructor(layoutManager:SimpleGridLayoutManager, name:string, path:string)
    {
        super(name, path);
        this.layoutManager = layoutManager;
    }

    activateOptionPanel():void { this.layoutManager.activate(); }
    deactivateOptionPanel():void { this.layoutManager.deactivate(); }
    getOptionPanel():SimpleGridLayoutManager {
        return this.layoutManager;
    }
    optionPanelSize():number[]
    {
        return [this.layoutManager.canvas.width, this.layoutManager.canvas.height];
    }
    drawOptionPanel(ctx, x:number, y:number):void
    {
        const optionPanel:SimpleGridLayoutManager = this.getOptionPanel();
        optionPanel.x = x;
        optionPanel.y = y;
        optionPanel.draw(ctx, x, y);
    }
};
class GenericTool extends Tool {
    constructor(name:string, imagePath:string)
    {
        super(name, imagePath);
    }
    activateOptionPanel():void {}
    deactivateOptionPanel():void {}
    getOptionPanel():SimpleGridLayoutManager {
        return null;
    }
    optionPanelSize():number[]
    {
        return [0, 0];
    }
    drawOptionPanel(ctx, x:number, y:number):void {}
};

class ExtendedTool extends ViewLayoutTool {
    localLayout:SimpleGridLayoutManager;
    optionPanels:SimpleGridLayoutManager[];
    constructor(name:string, path:string, optionPanes:SimpleGridLayoutManager[], dim:number[], matrixDim:number[] = [24, 24], parentMatrixDim:number[] = [24, 48])
    {
        super(new SimpleGridLayoutManager([parentMatrixDim[0],parentMatrixDim[1]], [dim[0], dim[1]]), name, path);
        this.localLayout = new SimpleGridLayoutManager([matrixDim[0],matrixDim[1]], [dim[0], dim[1]]);
        const parentPanel:SimpleGridLayoutManager = this.getOptionPanel();
        parentPanel.addElement(this.localLayout);
        this.optionPanels = [this.localLayout];
        let maxY:number = this.localLayout.height();
        let maxX:number = this.localLayout.width();
        optionPanes.forEach(pane => {
            parentPanel.addElement(pane);
            this.optionPanels.push(pane);
            maxY += pane.height();
        });
        parentPanel.setHeight(maxY);
        parentPanel.setWidth(maxX);
        parentPanel.refreshMetaData();
        maxY = 0;
        parentPanel.elementsPositions.forEach(el => {
            if(el.y + el.height > maxY)
            {
                maxY = el.y + el.height;
            }
        });
        parentPanel.setWidth(maxX);
        parentPanel.setHeight(dim[1] + maxY);
        parentPanel.refreshMetaData();

    }
    activateOptionPanel(): void {
        this.getOptionPanel().activate();
        this.optionPanels.forEach(element => {
            element.activate();
        });
    }
    deactivateOptionPanel(): void {
        this.getOptionPanel().deactivate();
        this.optionPanels.forEach(element => {
            element.deactivate();
        });
    }
};
class SingleCheckBoxTool extends GenericTool {
    optionPanel:SimpleGridLayoutManager;
    checkBox:GuiCheckBox;
    constructor(label:string, name:string, imagePath:string, callback:() => void = () => null)
    {
        super(name, imagePath);
        this.optionPanel = new SimpleGridLayoutManager([1,4], [200, 90]);
        this.checkBox = new GuiCheckBox(callback, 40, 40);
        this.optionPanel.addElement(new GuiLabel(label, 200, 16, GuiTextBox.bottom, 40));
        this.optionPanel.addElement(this.checkBox);
    }
    activateOptionPanel():void { this.optionPanel.activate(); }
    deactivateOptionPanel():void { this.optionPanel.deactivate(); }
    getOptionPanel():SimpleGridLayoutManager {
        return this.optionPanel;
    }
    optionPanelSize():number[]
    {
        return [this.optionPanel.width(), this.optionPanel.height()];
    }
    drawOptionPanel(ctx, x:number, y:number):void {
        const optionPanel:SimpleGridLayoutManager = this.getOptionPanel();
        optionPanel.x = x;
        optionPanel.y = y;
        optionPanel.draw(ctx, x, y);
    }
};
class DragTool extends ExtendedTool {
    checkBox:GuiCheckBox;
    checkBox_blendAlpha:GuiCheckBox;
    constructor(name:string, imagePath:string, callBack:() => void, callBackBlendAlphaState:()=>void, optionPanes:SimpleGridLayoutManager[] = [])
    {
        super(name, imagePath, optionPanes, [200, 200]);
        this.checkBox = new GuiCheckBox(callBack, 40, 40);
        this.checkBox_blendAlpha = new GuiCheckBox(callBackBlendAlphaState, 40, 40);
        this.checkBox_blendAlpha.checked = true;
        this.checkBox_blendAlpha.refresh();
        this.localLayout.addElement(new GuiLabel("Only drag\none color:", 200, 16, GuiTextBox.bottom | GuiTextBox.left, 50));
        this.localLayout.addElement(this.checkBox);
        this.localLayout.addElement(new GuiLabel("Blend alpha\nwhen dropping:", 200, 16, GuiTextBox.bottom | GuiTextBox.left, 50));
        this.localLayout.addElement(this.checkBox_blendAlpha);
    }
};
class RotateTool extends ExtendedTool {
    checkBox:GuiCheckBox;
    checkBoxAntiAlias:GuiCheckBox;
    constructor(name:string, imagePath:string, callBack:() => void, callBackAntiAlias:() => void, optionPanes:SimpleGridLayoutManager[] = [])
    {
        super(name, imagePath, optionPanes, [200, 200]);
        this.checkBox = new GuiCheckBox(callBack, 40, 40);
        this.checkBoxAntiAlias = new GuiCheckBox(callBackAntiAlias, 40, 40);
        this.checkBoxAntiAlias.checked = true;
        this.checkBoxAntiAlias.refresh();
        this.localLayout.addElement(new GuiLabel("Only rotate adjacent\npixels of same color:", 200, 16, GuiTextBox.bottom | GuiTextBox.left, 50));
        this.localLayout.addElement(this.checkBox);
        this.localLayout.addElement(new GuiLabel("", 100, 14, GuiTextBox.bottom | GuiTextBox.left, 50));
        this.localLayout.addElement(new GuiLabel("anti-alias\nrotation:", 90, 16, GuiTextBox.bottom | GuiTextBox.left, 50));
        this.localLayout.addElement(this.checkBoxAntiAlias);

    }
};
class UndoRedoTool extends SingleCheckBoxTool {
    stackFrameCountLabel:GuiLabel;
    constructor(toolSelector:ToolSelector, name:string, imagePath:string, callback: () => void)
    {
        super("Slow mode(undo/redo):", name, imagePath, callback);
        this.stackFrameCountLabel = new GuiLabel(`Redoable actions: ${0}\nUndoable actions: ${0}`, 200, 16, GuiTextBox.bottom, 40), 15;
        this.getOptionPanel().matrixDim[1] += 5;
        this.getOptionPanel().setHeight(this.stackFrameCountLabel.height() + this.getOptionPanel().height());
        this.getOptionPanel().addElement(this.stackFrameCountLabel);
    }
    updateLabel(redo:number, undo:number):void{
        this.stackFrameCountLabel.setText(`Redoable actions: ${redo}\nUndoable actions: ${undo}`);
    }
};
class FillTool extends ExtendedTool {
    checkIgnoreAlpha:GuiCheckBox;
    constructor(name:string, path:string, optionPanes:SimpleGridLayoutManager[], updateIgnoreSameColorBoundaries:() => void)
    {
        super(name, path, optionPanes, [200, 100], [30, 10]);
        this.checkIgnoreAlpha = new GuiCheckBox(updateIgnoreSameColorBoundaries);
        this.localLayout.addElement(new GuiLabel("Fill Options:", 200, 16, GuiTextBox.bottom, 35));
        this.localLayout.addElement(new GuiLabel("Ignore Alpha:", 130, 16, GuiTextBox.bottom, 35));
        this.localLayout.addElement(this.checkIgnoreAlpha);
    }
};
class PenViewTool extends ViewLayoutTool {
    pen:PenTool;
    constructor(pen:PenTool, name:string, path:string)
    {
        super(pen.getOptionPanel(), name, path);
        this.pen = pen;
    }
};
class PenTool extends ExtendedTool {
    lineWidth:number;
    layoutManager:SimpleGridLayoutManager;
    tbSize:GuiTextBox;
    btUpdate:GuiButton;
    static checkboxSprayPaint:GuiCheckBox = new GuiCheckBox(null, 40, 40);
    static checkDrawCircular:GuiCheckBox = new GuiCheckBox(null, 40, 40);
    constructor(strokeWith:number, toolName:string = "pen", pathToImage:string = "images/penSprite.png", optionPanes:SimpleGridLayoutManager[], dimLocal:number[] = [200,110])
    {
        super(toolName, pathToImage, optionPanes, dimLocal, [2,30], [1, 50]);
        this.layoutManager.pixelDim = [200, 500];
        this.lineWidth = strokeWith;
        this.tbSize = new GuiTextBox(true, 80);
        this.tbSize.promptText = "Enter line width:";
        this.tbSize.setText(String(this.lineWidth));
        this.btUpdate = new GuiButton(() => { 
            this.lineWidth = this.tbSize.asNumber.get() ? (this.tbSize.asNumber.get() <= 128 ? this.tbSize.asNumber.get() : 128):this.lineWidth; 
            this.tbSize.setText(String(this.lineWidth))},
            "Update", 75, this.tbSize.height(), 16);
        this.tbSize.submissionButton = this.btUpdate;
        this.localLayout.addElement(new GuiLabel("Line width:", 200, 16, GuiTextBox.bottom));
        this.localLayout.addElement(this.tbSize);
        this.localLayout.addElement(this.btUpdate);
        this.localLayout.addElement(new GuiLabel("Round\npen tip:", 90, 16, GuiTextBox.bottom, 40));
        this.localLayout.addElement(PenTool.checkDrawCircular);
    }
    activateOptionPanel():void 
    { 
        this.layoutManager.activate(); 
        //this.tbSize.activate(); this.tbSize.refresh(); 
    }
    deactivateOptionPanel():void 
    { 
        this.layoutManager.deactivate(); 
        //this.tbSize.refresh();
    }
    getOptionPanel():SimpleGridLayoutManager {
        return this.layoutManager;
    }
    optionPanelSize():number[]
    {
        return [this.layoutManager.width(), this.layoutManager.height()];
    }
    drawOptionPanel(ctx:CanvasRenderingContext2D, x:number, y:number):void 
    {
        const optionPanel:SimpleGridLayoutManager = this.getOptionPanel();
        optionPanel.x = x;
        optionPanel.y = y;
        optionPanel.draw(ctx, x, y);
    }
    penSize():number
    {
        return this.lineWidth;
    }
};
class SprayCanTool extends PenTool {
    tbProbability:GuiTextBox;
    constructor(strokeWidth:number, toolName:string, pathToImage:string, callBack:(tbProbability:GuiTextBox)=>void, optionPanes:SimpleGridLayoutManager[])
    {
        super(strokeWidth, toolName, pathToImage, optionPanes, [200, 150]);
        this.tbProbability = new GuiTextBox(true, 99, this.btUpdate, 16);
        this.btUpdate.callback = () => { 
            this.lineWidth = this.tbSize.asNumber.get() ? (this.tbSize.asNumber.get() <= 128 ? this.tbSize.asNumber.get() : 128):this.lineWidth; 
            this.tbSize.setText(String(this.lineWidth));
            callBack(this.tbProbability);
        };
        this.tbProbability.setText(0.5.toString());
        this.localLayout.addElement(new GuiLabel("Spray\nprob:", 99, 16, GuiTextBox.bottom | GuiTextBox.left, 40));
        this.localLayout.addElement(this.tbProbability);
    }
};
class ColorPickerTool extends ExtendedTool {
    field:LayeredDrawingScreen;
    tbColor:GuiTextBox;
    btUpdate:GuiButton;
    constructor(field:LayeredDrawingScreen, toolName:string = "colorPicker", pathToImage:string = "images/colorPickerSprite.png", optionPanes:SimpleGridLayoutManager[] = [])
    {
        super(toolName, pathToImage, optionPanes, [200, 100], [1, 3]);
        this.field = field;
        this.tbColor = new GuiTextBox(true, 200, null, 16);
        this.tbColor.promptText = "Enter RGBA color here (RGB 0-255 A 0-1):";
        this.setColorText();
        this.btUpdate = new GuiButton(() => { 
            this.field.layer().palette.setSelectedColor(this.tbColor.text);
            this.field.layer().state.color = this.field.layer().palette.calcColor();
        },
            "Update", 75, this.tbColor.height(), 16);
        this.tbColor.submissionButton = this.btUpdate;
        this.localLayout.addElement(new GuiLabel("Color:", 150, 16));
        this.localLayout.addElement(this.tbColor);
        this.localLayout.addElement(this.btUpdate);
    }
    color():RGB
    {
        return this.field.layer().state.color;
    }
    setColorText():void
    {
        if(this.color())
            this.tbColor.setText(this.color().htmlRBGA());
        else
            this.tbColor.setText(new RGB(0, 0, 0, 0).htmlRBGA())
    }
    activateOptionPanel():void { this.layoutManager.activate(); }
    deactivateOptionPanel():void { this.layoutManager.deactivate(); }
    getOptionPanel():SimpleGridLayoutManager {
        return this.layoutManager;
    }
    optionPanelSize():number[]
    {
        return [this.layoutManager.width(), this.layoutManager.height()];
    }
    drawOptionPanel(ctx:CanvasRenderingContext2D, x:number, y:number):void 
    {
        const optionPanel:SimpleGridLayoutManager = this.getOptionPanel();
        optionPanel.x = x;
        optionPanel.y = y;
        optionPanel.draw(ctx, x, y);
    }
};
class DrawingScreenSettingsTool extends ExtendedTool {

    layoutManager:SimpleGridLayoutManager;
    tbX:GuiTextBox;
    tbY:GuiTextBox;
    btUpdate:GuiButton;
    dim:number[];
    field:LayeredDrawingScreen;
    constructor(dim:number[] = [524, 524], field:LayeredDrawingScreen, toolName:string, pathToImage:string, optionPanes:SimpleGridLayoutManager[])
    {
        super(toolName, pathToImage, optionPanes, [200, 140], [2, 4]);
        this.dim = dim;
        this.field = field;
        //this.localLayout = new SimpleGridLayoutManager([2,4],[200,150]);
        this.tbX = new GuiTextBox(true, 70);
        this.tbX.promptText = "Enter width:";
        this.tbX.setText(String(this.dim[0]));
        this.tbY = new GuiTextBox(true, 70);//, null, 16, 100);
        this.tbY.promptText = "Enter height:";
        this.tbY.setText(String(this.dim[1]));
        this.btUpdate = new GuiButton(() => this.recalcDim(),
            "Update", 75, 35, 16);
        this.tbX.submissionButton = this.btUpdate;
        this.tbY.submissionButton = this.btUpdate;
        this.localLayout.addElement(new GuiLabel("Sprite Resolution:", 200, 16, GuiTextBox.bottom));
        this.localLayout.addElement(new GuiLabel("Width:", 90, 16));
        this.localLayout.addElement(new GuiLabel("Height:", 90, 16));
        this.localLayout.addElement(this.tbX);
        this.localLayout.addElement(this.tbY);
        this.localLayout.addElement(new GuiLabel(" ", 85));
        this.localLayout.addElement(this.btUpdate);
    }
    activateOptionPanel():void { this.layoutManager.activate(); }
    deactivateOptionPanel():void { this.layoutManager.deactivate(); }
    getOptionPanel():SimpleGridLayoutManager {
        return this.layoutManager;
    }
    recalcDim():void
    {
        let x:number = this.dim[0];
        let y:number = this.dim[1];
        if(this.tbX.asNumber.get())
            x = this.tbX.asNumber.get();
        if(this.tbY.asNumber.get())
            y = this.tbY.asNumber.get();
        this.dim = [x, y];
        this.field.setDimOnCurrent(this.dim);
    }
    optionPanelSize():number[]
    {
        return [this.layoutManager.width(), this.layoutManager.height()];
    }
    drawOptionPanel(ctx:CanvasRenderingContext2D, x:number, y:number):void 
    {
        const optionPanel:SimpleGridLayoutManager = this.getOptionPanel();
        optionPanel.x = x;
        optionPanel.y = y;
        optionPanel.draw(ctx, x, y);
    }
};
class ClipBoard {
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    offscreenCanvas:HTMLCanvasElement;
    clipBoardBuffer:Pair<RGB, number>[];
    currentDim:number[];
    dim:number[];
    touchListener:SingleTouchListener;
    angle:number;
    repaint:boolean;
    focused:boolean;
    constructor(canvas:HTMLCanvasElement, keyboardHandler:KeyboardHandler, pixelCountX:number, pixelCountY:number)
    {
        this.repaint = true;
        this.canvas = document.createElement("canvas");
        this.focused = false;
        this.ctx = this.canvas.getContext("2d");
        this.dim = [pixelCountX,pixelCountY];
        this.canvas.height = this.dim[0];
        this.canvas.width = this.dim[1];
        this.currentDim = [0, 0];
        this.offscreenCanvas = document.createElement("canvas");
        this.clipBoardBuffer = new Array<Pair<RGB, number>>();
        this.offscreenCanvas.width = pixelCountX;
        this.offscreenCanvas.height = pixelCountY;
        this.angle = 0;

    }    
    active():boolean{
        return this.focused;
    }
    deactivate():void{
        this.focused = false;
    }
    activate():void{
        this.focused = true;
    }
    width():number {
        return this.canvas.width;
    }
    height():number{
        return this.canvas.height;
    }
    refresh():void {
        this.repaint = true;
    }
    handleKeyBoardEvents(type:string, e:any):void{

    }
    handleTouchEvents(type:string, e:any):void{
        if(this.active() && type === "touchstart")
        {
            if(this.clipBoardBuffer.length)
            {
                this.rotate(Math.PI / 2);
                this.repaint = true;
            }
        }

    }
    isLayoutManager():boolean{
        return false;
    }
    resize(dim:number[])
    {
        if(dim.length === 2)
        {
            this.dim[0] = dim[0];
            this.dim[1] = dim[1];
            this.offscreenCanvas.width = dim[0];
            this.offscreenCanvas.height = dim[1];
            this.repaint = true;
            this.refreshImageFromBuffer(this.currentDim[0], this.currentDim[1]);
        }
    }
    //only really works for rotation by pi/2
    rotate(theta:number):void
    {
        const dx:number = this.dim[0]/2;
        const dy:number = this.dim[1]/2;
        const initTransMatrix:number[] = [1,0,dx*-1,
                                 0,1,dy*-1,
                                 0,0,1];
        const cos:number = Math.cos(theta);
        const sin:number = Math.sin(theta);
        const rotationMatrix:number[] = [cos, -sin, 0, 
                                         sin, cos, 0,
                                         0, 0, 1];
        const revertTransMatrix:number[] = [1,0,dx,
                                 0,1,dy,
                                 0,0,1];
        const finalTransformationMatrix:number[] = threeByThreeMat(threeByThreeMat(initTransMatrix, rotationMatrix), revertTransMatrix);
        const vec:number[] = [0,0,0];
        for(const rec of this.clipBoardBuffer.entries())
        {
            let x:number = rec[1].second % this.dim[0];
            let y:number = Math.floor(rec[1].second / this.dim[0]);
            vec[0] = x;
            vec[1] = y;
            vec[2] = 1;
            const transformed = matByVec(finalTransformationMatrix, vec);
            x = Math.floor(transformed[0]);
            y = Math.floor(transformed[1]);
            rec[1].second = Math.floor((x) + (y) * this.dim[0]);
        }
        this.clipBoardBuffer.sort((a, b) => a.second - b.second);
        const width:number = this.offscreenCanvas.width;
        this.offscreenCanvas.width = this.offscreenCanvas.height;
        this.offscreenCanvas.height = width;
        this.refreshImageFromBuffer(this.currentDim[1], this.currentDim[0]);
    }
    
    //copies array of rgb values to canvas offscreen, centered within the canvas
    refreshImageFromBuffer(width:number = this.currentDim[0], height:number = this.currentDim[1]):void
    {
        width = Math.floor(width + 0.5);
        height = Math.floor(height + 0.5);
        this.currentDim = [width, height];
        const ctx = this.offscreenCanvas.getContext("2d");
        ctx.fillStyle = "rgba(255,255,255,1)";
        ctx.fillRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
        const start_x:number = this.dim[0] / 2 - this.currentDim[0] / 2;
        const start_y:number = this.dim[1] / 2 - this.currentDim[1] / 2;
        ctx.scale(this.canvas.width / this.offscreenCanvas.width, this.canvas.height / this.offscreenCanvas.height);
           
        for(let y = 0; y < height; y++)
        {
            for(let x = 0; x < width; x++)
            {
                const sx:number = ((x + start_x));
                const sy:number = ((y + start_y));
                ctx.fillStyle = this.clipBoardBuffer[Math.floor(x + y * width)].first.htmlRBGA();
                ctx.fillRect(sx, sy, 1, 1);
            }
        }        
        ctx.scale(this.offscreenCanvas.width / this.canvas.width, this.offscreenCanvas.height / this.canvas.height);
        this.repaint = true;
    }

    draw(ctx:CanvasRenderingContext2D = this.ctx, x:number = 0, y:number = 0)
    {
        if(this.repaint)
        {
            this.repaint = false;
            this.ctx.fillStyle = "rgba(255,255,255,1)";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.offscreenCanvas, 0, 0);
        }
        ctx.drawImage(this.canvas, x, y);
    }
};
class CopyPasteTool extends ExtendedTool {
    blendAlpha:GuiCheckBox;
    constructor(name:string, path:string, optionPanes:SimpleGridLayoutManager[], clipBoard:ClipBoard, updateBlendAlpha: () => void) {
        super(name, path, optionPanes, [200, clipBoard.height()+ 130], [2, 20], [1, 30]);
        this.blendAlpha = new GuiCheckBox(updateBlendAlpha, 40, 40);
        this.blendAlpha.checked = true;
        this.blendAlpha.refresh();
        this.localLayout.addElement(new GuiLabel("Clipboard:", 200, 16));
        this.localLayout.addElement(clipBoard);
        this.localLayout.addElement(new GuiLabel("Preserve\ntransparency:", 200, 16, GuiTextBox.bottom | GuiTextBox.left, 40));
        this.localLayout.addElement(this.blendAlpha);

    }
};
class LayerManagerTool extends Tool {
    list:GuiCheckList;
    layoutManager:SimpleGridLayoutManager;
    field:LayeredDrawingScreen;
    buttonAddLayer:GuiButton;
    runningId:number;
    layersLimit:number;
    constructor(name:string, path:string, field:LayeredDrawingScreen, limit:number = 12)
    {
        super(name, path);
        this.field = field;
        this.layersLimit = isTouchSupported()?limit - Math.floor(limit / 4) : limit;
        this.layoutManager = new SimpleGridLayoutManager([2, 24], [200, 500]);
        this.list = new GuiCheckList([1, this.layersLimit], [200, 400], 20, (x1, x2) => {
            this.field.swapLayers(x1, x2);
            this.field.layer().repaint = true;
        });
        this.buttonAddLayer = new GuiButton(() => { this.pushList(`layer${this.runningId++}`); }, "Add Layer", 99, 40, 16);
        this.layoutManager.addElement(new GuiLabel("Layers list:", 200));
        this.layoutManager.addElement(this.list);
        this.layoutManager.addElement(this.buttonAddLayer);
        this.layoutManager.addElement(new GuiButton(() => this.deleteItem(), "Delete", 99, 40, 16));
        for(let i = 0; i < field.layers.length; i++)
        {
            this.pushList(`layer${i}`);
        }
        this.runningId = field.layers.length;
        this.list.refresh();
    }
    deleteItem(index:number = this.field.selected):void
    {
        if(this.field.layers[index]){
            this.list.delete(index);
            this.field.deleteLayer(index);
        }
    }
    pushList(text:string): void {
        if(this.field.layers.length < this.layersLimit)
        {
            let layer:DrawingScreen;
            if(this.field.layers.length <= this.list.list.length)
                layer = this.field.addBlankLayer();
            else if(this.field.layers[this.list.list.length])
                layer = this.field.layers[this.list.list.length];
            else
                console.log("Error field layers out of sync with layers tool");
            
            this.list.push(text, true, (e) => {
                    const index:number = this.list.findBasedOnCheckbox(e.checkBox);
                    //this.list.get(index).textBox.activate();
                    if(e.checkBox.checked)
                        this.field.selected = index;
                    if(this.field.layers[index]) {
                        this.field.layersState[index] = e.checkBox.checked;
                        this.field.layer().repaint = true;
                    }
                    else
                        console.log("Error changing layer state");
                },
                (e) => {
                    this.field.selected = this.list.selected();
                    this.list.list.forEach(el => el.textBox.deactivate());
                    if(this.list.selectedItem() && this.list.selectedItem().checkBox.checked)
                        this.list.selectedItem().textBox.activate();

                });
                this.list.refresh();
        }
    }
    activateOptionPanel():void { this.layoutManager.activate(); }
    deactivateOptionPanel():void { this.layoutManager.deactivate(); }
    getOptionPanel():SimpleGridLayoutManager {
        return this.layoutManager;
    }
    optionPanelSize():number[]
    {
        return [this.layoutManager.canvas.width, this.layoutManager.canvas.height];
    }
    drawOptionPanel(ctx, x:number, y:number):void
    {
        const optionPanel:SimpleGridLayoutManager = this.getOptionPanel();
        optionPanel.x = x;
        optionPanel.y = y;
        optionPanel.draw(ctx, x, y);
    }
};
class ScreenTransformationTool extends ExtendedTool {
    textBoxZoom:GuiTextBox;
    buttonUpdateZoom:GuiButton;
    constructor(toolName:string, toolImagePath:string, optionPanes:SimpleGridLayoutManager[], field:LayeredDrawingScreen)
    {
        super(toolName, toolImagePath, optionPanes, [200, 120], [2, 30]);
        this.localLayout.addElement(new GuiLabel("Zoom:", 75));
        this.buttonUpdateZoom = new GuiButton(() => {
            let ratio:number = 1;
            if(this.textBoxZoom.asNumber.get()) {
                ratio = this.textBoxZoom.asNumber.get() / field.zoom.zoomX;
                field.zoom.zoomX = this.textBoxZoom.asNumber.get();
                field.zoom.zoomY = field.zoom.zoomY * ratio;
            }
        }, "Set Zoom", 100, 40, 16);
        this.localLayout.addElement(new GuiLabel("", 50))
        this.textBoxZoom = new GuiTextBox(true, 70, this.buttonUpdateZoom, 16, 32);
        this.textBoxZoom.setText(field.zoom.zoomX.toString());
        this.localLayout.addElement(this.textBoxZoom);
        this.localLayout.addElement(this.buttonUpdateZoom);
        this.localLayout.addElement(new GuiButton(() => {field.zoom.offsetX = 0;field.zoom.offsetY = 0;}, "Center Screen", 140, 40, 16));
    }
};
// To do refactor tools to make sure they load in the same order every time
class ToolSelector {// clean up class code remove fields made redundant by GuiToolBar
    toolBar:GuiToolBar;
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    touchListener:SingleTouchListener;
    drawingScreenListener:SingleTouchListener;
    keyboardHandler:KeyboardHandler;
    toolPixelDim:number[];
    penTool:PenTool;
    eraserTool:PenTool;
    settingsTool:DrawingScreenSettingsTool;
    colorPickerTool:ColorPickerTool;
    dragTool:DragTool;
    rotateTool:RotateTool;
    undoTool:UndoRedoTool;
    fillTool:FillTool;
    layersTool:LayerManagerTool;
    repaint:boolean;
    lastDrawTime:number;
    copyTool:CopyPasteTool;
    transformTool:ScreenTransformationTool;
    sprayPaint:boolean;
    field:LayeredDrawingScreen;
    sprayCanTool:SprayCanTool;
    constructor(pallette:Pallette, keyboardHandler:KeyboardHandler, drawingScreenListener:SingleTouchListener, imgWidth:number = 50, imgHeight:number = 50)
    {
        this.lastDrawTime = Date.now();
        const field:LayeredDrawingScreen = new LayeredDrawingScreen(keyboardHandler, pallette);
        field.toolSelector = this;
        field.addBlankLayer();
        this.field = field;
        this.toolBar = new GuiToolBar([50, 50], []);
        this.toolBar.activate();
        this.toolBar.toolRenderDim[1] = imgHeight;
        this.toolBar.toolRenderDim[0] = imgWidth;
        this.sprayPaint = false;
        this.repaint = false;
        this.toolPixelDim = [imgWidth,imgHeight*10];
        this.canvas = <HTMLCanvasElement> document.getElementById("tool_selector_screen");
        this.keyboardHandler = keyboardHandler;
        this.keyboardHandler.registerCallBack("keydown", e => true, event => {
            switch(event.code) {
                case('KeyC'):
                if(this.keyboardHandler.keysHeld["KeyC"] === 1) {
                    field.layer().selectionRect = [0,0,0,0];
                    field.layer().pasteRect = [0,0,0,0];
                }
                break;
                case('KeyV'):
                field.layer().paste();
                break;
                case('KeyU'):
                field.layer().undoLast().then(() =>
                field.layer().updateLabelUndoRedoCount());
                break;
                case('KeyR'):
                field.layer().redoLast().then(() =>
                field.layer().updateLabelUndoRedoCount());
                break;
            }
        });
        this.keyboardHandler.registerCallBack("keydown", e => this.tool().getOptionPanel(), e => {this.tool().getOptionPanel().handleKeyBoardEvents("keydown", e); this.repaint = true;});
        this.keyboardHandler.registerCallBack("keyup", e => this.tool().getOptionPanel(), e => {this.tool().getOptionPanel().handleKeyBoardEvents("keyup", e); this.repaint = true;});
        this.keyboardHandler.registerCallBack("keydown", e => {if(e.code === "ArrowUp" || e.code === "ArrowDown" || e.code === "ArrowLeft" || e.code === "ArrowRight") return true;},
            e => {
                const imgPerColumn:number = (this.canvas.height / this.toolBar.toolRenderDim[1]);
                if((this.keyboardHandler.keysHeld["AltLeft"] || this.keyboardHandler.keysHeld["AltRight"]) && (document.activeElement.id === "body" || field.layer().canvas === document.activeElement || this.canvas === document.activeElement))
                {
                    e.preventDefault();
                    let newToolIndex:number = this.selected();
                    if(e.code === "ArrowUp"){
                        if(this.selected() !== 0)    
                            newToolIndex--;
                        else
                            newToolIndex = this.toolBar.tools.length - 1;
                    }
                    else if(e.code === "ArrowDown"){
                        newToolIndex++;
                        newToolIndex %= this.toolBar.tools.length;
                    }
                    else if(e.code === "ArrowLeft"){
                        if(newToolIndex >= imgPerColumn)
                            newToolIndex -= imgPerColumn;
                        else
                            newToolIndex = 0;
                    }
                    else if(e.code === "ArrowRight"){
                        if(this.toolBar.tools.length - newToolIndex > imgPerColumn)
                            newToolIndex += imgPerColumn;
                        else
                            newToolIndex = this.toolBar.tools.length - 1;
                    }

                    if(this.tool() && this.selected() !== newToolIndex){
                        this.tool().deactivateOptionPanel();
                        this.toolBar.selected = newToolIndex;
                        this.tool().activateOptionPanel();
                    }
                }  
                this.repaint = true;
            });
        this.touchListener = new SingleTouchListener(this.canvas, true, true);  
        this.touchListener.registerCallBack("touchstart", e => this.tool().getOptionPanel(),  e => {
            e.translateEvent(e, -this.tool().getOptionPanel().x , -this.tool().getOptionPanel().y);
            this.tool().getOptionPanel().handleTouchEvents("touchstart", e); this.repaint = true;
            e.translateEvent(e, this.tool().getOptionPanel().x , this.tool().getOptionPanel().y);});

        this.touchListener.registerCallBack("touchmove", e => this.tool().getOptionPanel(),  e => {
            e.translateEvent(e, -this.tool().getOptionPanel().x , -this.tool().getOptionPanel().y);this.tool().getOptionPanel().handleTouchEvents("touchmove", e); this.repaint = true;
            e.translateEvent(e, this.tool().getOptionPanel().x , this.tool().getOptionPanel().y);});
        this.touchListener.registerCallBack("touchend", e => this.tool().getOptionPanel(),  e => {
            e.translateEvent(e, -this.tool().getOptionPanel().x , -this.tool().getOptionPanel().y);this.tool().getOptionPanel().handleTouchEvents("touchend", e); this.repaint = true;
            e.translateEvent(e, this.tool().getOptionPanel().x , this.tool().getOptionPanel().y);});     
        this.touchListener.registerCallBack("touchstart", e => true, e => {
            (<any>document.activeElement).blur();
            const previousTool:number = this.selected();
            const imgPerColumn:number = (this.canvas.height / this.toolBar.toolRenderDim[1]);
            const y:number = Math.floor(e.touchPos[1] / this.toolBar.toolRenderDim[1]);
            const x:number = Math.floor(e.touchPos[0] / this.toolBar.toolRenderDim[0]);
            const clicked:number = y + x * imgPerColumn;
            if(clicked >= 0 && clicked < this.toolBar.tools.length)
            {
                if(this.tool())
                    this.tool().deactivateOptionPanel();
                this.toolBar.handleTouchEvents("touchstart", e);
                
            }
            if(this.selectedToolName() === "undo")
            {
                field.layer().undoLast().then(() =>
                this.undoTool.updateLabel(field.layer().undoneUpdatesStack.length(), field.layer().updatesStack.length()));
                this.toolBar.selected = previousTool;
            }
            else if(this.selectedToolName() === "redo")
            {
                field.layer().redoLast().then(() =>
                this.undoTool.updateLabel(field.layer().undoneUpdatesStack.length(), field.layer().updatesStack.length()));
                this.toolBar.selected = previousTool;
            }
            if(this.tool()){
                this.tool().activateOptionPanel();
            }
            this.repaint = true;
        });
        {
            //field.layer() listeners
        const colorBackup:RGB = new RGB(0,0,0,0);
        this.drawingScreenListener = drawingScreenListener;
        this.drawingScreenListener.registerCallBack("touchstart", 
            e => this.layersTool.list.selectedItem() && this.layersTool.list.selectedItem().checkBox.checked, 
            e => {
            const touchPos:number[] = [this.field.zoom.invZoomX(e.touchPos[0]),this.field.zoom.invZoomY(e.touchPos[1])];

            const gx:number = Math.floor((touchPos[0]-field.layer().offset.first)/field.layer().bounds.first*field.layer().dimensions.first);
            const gy:number = Math.floor((touchPos[1]-field.layer().offset.second)/field.layer().bounds.second*field.layer().dimensions.second);
            
            //save for undo
            if(field.layer().updatesStack.length() === 0 || field.layer().updatesStack.get(field.layer().updatesStack.length() - 1).length)
            {
                if(field.layer().toolSelector.selectedToolName() !== "redo" && field.layer().toolSelector.selectedToolName() !== "undo")
                {
                    field.layer().updatesStack.push(new Array<Pair<number,RGB>>());
                    field.layer().undoneUpdatesStack.empty();
                }
            }
            (<any>document.activeElement).blur();
            if(field.layer().toolSelector.selectedToolName() != "paste")
            {
                field.layer().pasteRect = [0,0,0,0];
            }
            else
            {
                field.layer().pasteRect = [touchPos[0] , touchPos[1], field.layer().clipBoard.currentDim[0] * (field.layer().bounds.first / field.layer().dimensions.first),field.layer().clipBoard.currentDim[1] * (field.layer().bounds.second / field.layer().dimensions.second)];
            }

            switch (field.layer().toolSelector.selectedToolName())
            {
                case("spraycan"):
                this.field.layer().state.lineWidth = this.sprayCanTool.tbSize.asNumber.get()?this.sprayCanTool.tbSize.asNumber.get():this.field.layer().state.lineWidth;
                field.layer().handleTapSprayPaint(touchPos[0], touchPos[1]);
                break;
                case("eraser"):
                colorBackup.copy(field.layer().state.color);
                {
                    const eraser:PenTool = field.layer().toolSelector.eraserTool;
                    field.layer().state.lineWidth = eraser.lineWidth;
                    eraser.tbSize.setText(String(field.layer().state.lineWidth));
                    field.layer().state.color.copy(field.layer().noColor);
                }
                break;
                case("fill"):
                break;
                case("rotate"):
                if(field.layer().state.antiAliasRotation)
                    field.layer().saveDragDataToScreenAntiAliased();
                else
                    field.layer().saveDragDataToScreen();
                if(field.layer().state.rotateOnlyOneColor || this.keyboardHandler.keysHeld["AltLeft"])
                    field.layer().dragData = field.layer().getSelectedPixelGroup(new Pair<number>(gx,gy), true);
                else
                    field.layer().dragData = field.layer().getSelectedPixelGroup(new Pair<number>(gx,gy), false);
                break;
                case("drag"):
                    field.layer().saveDragDataToScreen();
                if(field.layer().state.dragOnlyOneColor || this.keyboardHandler.keysHeld["AltLeft"])
                    field.layer().dragData = field.layer().getSelectedPixelGroup(new Pair<number>(gx,gy), true);
                else
                    field.layer().dragData = field.layer().getSelectedPixelGroup(new Pair<number>(gx,gy), false);
                break;
                case("oval"):
                case("rect"):
                case("copy"):
                case("line"):
                field.layer().selectionRect = [touchPos[0], touchPos[1],0,0];
                case("pen"):
                {
                    field.layer().setLineWidthPen();            
                }
                break;
                case("paste"):                
                field.layer().pasteRect = [touchPos[0] - field.layer().pasteRect[2]/2, touchPos[1] - field.layer().pasteRect[3]/2,field.layer().pasteRect[2],field.layer().pasteRect[3]];
                break;
                case("colorPicker"):
                field.state.color.copy(field.layer().screenBuffer[gx + gy*field.layer().dimensions.first]);
                // for Gui lib
                field.layer().toolSelector.updateColorPickerTextBox();
                break;
            }
        });

        this.drawingScreenListener.registerCallBack("touchmove",
            e => this.layersTool.list.selectedItem() && this.layersTool.list.selectedItem().checkBox.checked,
            e => {
            const deltaX:number = this.field.zoom.invJustZoomX(e.deltaX);
            const deltaY:number = this.field.zoom.invJustZoomY(e.deltaY);
            const touchPos:number[] = [this.field.zoom.invZoomX(e.touchPos[0]),this.field.zoom.invZoomY(e.touchPos[1])];
            const x1:number = touchPos[0] - deltaX;
            const y1:number = touchPos[1] - deltaY;
            const gx:number = Math.floor((touchPos[0])/field.layer().bounds.first*field.layer().dimensions.first);
            const gy:number = Math.floor((touchPos[1])/field.layer().bounds.second*field.layer().dimensions.second);
            let repaint:boolean = true;
            switch (field.toolSelector.selectedToolName())
            {
                case("layers"):
                case("move"):
                field.zoom.offsetX -= e.deltaX;
                field.zoom.offsetY -= e.deltaY;
                repaint = false;
                break;
                case("spraycan"):
                field.layer().handleDraw(x1, touchPos[0], y1, touchPos[1], (x, y, screen) => screen.handleTapSprayPaint(x, y));
                
                break;
                case("pen"):
                field.layer().handleDraw(x1, touchPos[0], y1, touchPos[1]);
                break;
                case("eraser"):
                field.layer().handleDraw(x1, touchPos[0], y1, touchPos[1]);
                break;
                case("drag"):
                field.layer().dragData.first.first += (deltaX / field.layer().bounds.first) * field.layer().dimensions.first;
                field.layer().dragData.first.second += (deltaY / field.layer().bounds.second) * field.layer().dimensions.second;
                break;
                case("rotate"):
                let angle:number = Math.PI / 2;
                let moveCountBeforeRotation:number = 10;
                if(field.state.antiAliasRotation){
                    angle = Math.PI / 32;
                    moveCountBeforeRotation = 2;
                }
                if(e.moveCount % moveCountBeforeRotation === 0)
                    if(e.deltaY > 0)
                        field.layer().rotateSelectedPixelGroup(angle, [(this.drawingScreenListener.startTouchPos[0] / field.layer().bounds.first) * field.layer().dimensions.first,
                            (this.field.zoom.invZoomY(this.drawingScreenListener.startTouchPos[1]) / field.layer().bounds.second) * field.layer().dimensions.second]);
                    else if(e.deltaY < 0)
                        field.layer().rotateSelectedPixelGroup(-angle, [(this.drawingScreenListener.startTouchPos[0] / field.layer().bounds.first) * field.layer().dimensions.first,
                            (this.field.zoom.invZoomY(this.drawingScreenListener.startTouchPos[1]) / field.layer().bounds.second) * field.layer().dimensions.second]);
                    
                    if(field.state.antiAliasRotation){
                        field.layer().dragData.second;
                    }
                break;
                case("fill"):
                field.layer().fillArea(new Pair<number>(gx, gy));
                break;
                case("line"):
                case("oval"):
                case("rect"):
                field.layer().selectionRect[2] += (deltaX);
                field.layer().selectionRect[3] += (deltaY);
                break;
                case("copy"):
                field.layer().selectionRect[2] += (deltaX);
                field.layer().selectionRect[3] += (deltaY);
                field.layer().pasteRect[2] = field.layer().selectionRect[2];
                field.layer().pasteRect[3] = field.layer().selectionRect[3];
                break;
                case("paste"):
                field.layer().pasteRect[0] += (deltaX);
                field.layer().pasteRect[1] += (deltaY);

                break;
                case("colorPicker"):
                field.state.color.copy(field.layer().screenBuffer[gx + gy*field.layer().dimensions.first]);
                field.layer().toolSelector.updateColorPickerTextBox();
                repaint = false;
                break;
            }
            field.layer().repaint = repaint;
            
        });

        this.drawingScreenListener.registerCallBack("touchend",
        e => this.layersTool.list.selectedItem() && this.layersTool.list.selectedItem().checkBox.checked,
        e => {
            const deltaX:number = this.field.zoom.invJustZoomX(e.deltaX);
            const deltaY:number = this.field.zoom.invJustZoomY(e.deltaY);
            const touchPos:number[] = [this.field.zoom.invZoomX(e.touchPos[0]),this.field.zoom.invZoomY(e.touchPos[1])];
            const x1:number = touchPos[0] - deltaX;
            const y1:number = touchPos[1] - deltaY;
            const gx:number = Math.floor((touchPos[0])/field.layer().bounds.first*field.layer().dimensions.first);
            const gy:number = Math.floor((touchPos[1])/field.layer().bounds.second*field.layer().dimensions.second);
            let repaint:boolean = true;
            switch (this.selectedToolName())
            {
                case("oval"):
                const start_x:number = Math.min(touchPos[0] - deltaX, touchPos[0]);
                const end_x:number = Math.max(touchPos[0] - deltaX, touchPos[0]);
                const min_y:number = Math.min(touchPos[1] - deltaY, touchPos[1]);
                const max_y:number = Math.max(touchPos[1] - deltaY, touchPos[1]);
                field.layer().selectionRect = [0,0,0,0];
                field.layer().handleEllipse(start_x, end_x, min_y, max_y);
                break;
                case("pen"):
                if(deltaX === 0 && deltaY === 0)
                {
                    field.layer().handleTap(touchPos[0], touchPos[1], field.layer());
                }
                break;
                case("eraser"):
                    field.layer().handleTap(touchPos[0], touchPos[1], field.layer());
                    field.state.color.copy(colorBackup);
                break;
                case("rotate"):
                    if(field.state.antiAliasRotation)
                        field.layer().saveDragDataToScreenAntiAliased();
                    else
                        field.layer().saveDragDataToScreen();
                    field.layer().dragData = null;
                break;
                case("drag"):
                    field.layer().saveDragDataToScreen();
                    field.layer().dragData = null;
                break;
                case("fill"):
                    const gx:number = Math.floor((touchPos[0]-field.layer().offset.first)/field.layer().bounds.first*field.layer().dimensions.first);
                    const gy:number = Math.floor((touchPos[1]-field.layer().offset.second)/field.layer().bounds.second*field.layer().dimensions.second);

                    field.layer().fillArea(new Pair<number>(gx, gy));
                break;
                case("line"):
                    if(deltaX === 0 && deltaY === 0)
                    {
                        field.layer().handleTap(touchPos[0], touchPos[1], field.layer());
                    }
                    field.layer().handleDraw(x1, touchPos[0], y1, touchPos[1]);
                    field.layer().selectionRect = [0,0,0,0];
                break;
                case("copy"):
                    const bounds:Pair<number> = field.layer().saveToBuffer(field.layer().selectionRect, field.layer().clipBoard.clipBoardBuffer);
                    field.layer().clipBoard.refreshImageFromBuffer(bounds.first, bounds.second);
                    field.layer().selectionRect = [0,0,0,0];
                break;
                case("paste"):
                    field.layer().paste();
                break;
                case("rect"):
                    field.layer().drawRect([field.layer().selectionRect[0], field.layer().selectionRect[1]], [field.layer().selectionRect[0]+field.layer().selectionRect[2], field.layer().selectionRect[1]+ field.layer().selectionRect[3]]);
                    field.layer().selectionRect = [0,0,0,0];
                break;
                case("colorPicker"):
                repaint = false;
                break;
            }
            field.layer().updateLabelUndoRedoCount();
            field.layer().repaint = repaint;
        });
        }
        this.layersTool = new LayerManagerTool("layers", "images/layersSprite.png", field);
        this.undoTool = new UndoRedoTool(this, "undo", "images/undoSprite.png", () => field.state.slow = !field.state.slow);
        this.transformTool = new ScreenTransformationTool("move", "images/favicon.ico", [this.undoTool.getOptionPanel()], field);
        this.colorPickerTool = new ColorPickerTool(field, "colorPicker", "images/colorPickerSprite.png", [this.transformTool.localLayout, this.undoTool.getOptionPanel()]);
        this.rotateTool = new RotateTool("rotate", "images/rotateSprite.png", () => field.state.rotateOnlyOneColor = this.rotateTool.checkBox.checked, 
            () => field.state.antiAliasRotation = this.rotateTool.checkBoxAntiAlias.checked, [this.undoTool.getOptionPanel(), this.transformTool.localLayout]);
        this.dragTool = new DragTool("drag", "images/dragSprite.png", () => field.state.dragOnlyOneColor = this.dragTool.checkBox.checked,
        () => field.state.blendAlphaOnPutSelectedPixels = this.dragTool.checkBox_blendAlpha.checked, [this.transformTool.localLayout, this.undoTool.getOptionPanel()]);
        this.settingsTool = new DrawingScreenSettingsTool([524, 524], field, "move","images/settingsSprite.png", [ this.transformTool.getOptionPanel() ]);
        this.copyTool = new CopyPasteTool("copy", "images/copySprite.png", [this.transformTool.localLayout], field.layer().clipBoard, () => field.state.blendAlphaOnPaste = this.copyTool.blendAlpha.checked);
        PenTool.checkDrawCircular.checked = true;
        PenTool.checkDrawCircular.refresh();
        this.sprayCanTool = new SprayCanTool(field.layer().suggestedLineWidth(), "spraycan", "images/spraycanSprite.png", (tbprob)=>{
            this.field.layer().sprayProbability = tbprob.asNumber.get()?tbprob.asNumber.get():this.field.layer().sprayProbability;
            this.field.layer().state.lineWidth = this.sprayCanTool.tbSize.asNumber.get()?this.sprayCanTool.tbSize.asNumber.get():this.field.layer().state.lineWidth;
        }, [this.colorPickerTool.localLayout, this.transformTool.localLayout]);
        this.penTool = new PenTool(field.layer().suggestedLineWidth(), "pen","images/penSprite.png", [this.colorPickerTool.localLayout, this.transformTool.localLayout, this.undoTool.getOptionPanel()]);
        this.penTool.activateOptionPanel();
        this.eraserTool = new PenTool(field.layer().suggestedLineWidth() * 3, "eraser","images/eraserSprite.png", [this.transformTool.localLayout, this.undoTool.getOptionPanel()]);

        PenTool.checkDrawCircular.callback = () => field.state.drawCircular = PenTool.checkDrawCircular.checked;
        this.fillTool = new FillTool("fill", "images/fillSprite.png", [this.transformTool.localLayout, this.colorPickerTool.localLayout, this.undoTool.getOptionPanel()],
            () => {
                field.layer().state.ignoreAlphaInFill = this.fillTool.checkIgnoreAlpha.checked;
            });
        this.toolBar.tools = [];
        this.toolBar.tools.push(this.penTool);
        this.toolBar.tools.push(this.sprayCanTool);
        this.toolBar.tools.push(this.fillTool);
        this.toolBar.tools.push(new PenViewTool(this.penTool, "line", "images/LineDrawSprite.png"));
        this.toolBar.tools.push(new PenViewTool(this.penTool, "rect", "images/rectSprite.png"));
        this.toolBar.tools.push(new PenViewTool(this.penTool, "oval", "images/ovalSprite.png"));
        this.toolBar.tools.push(this.copyTool);
        this.toolBar.tools.push(new ViewLayoutTool(this.copyTool.getOptionPanel(), "paste", "images/pasteSprite.png"));
        this.toolBar.tools.push(this.dragTool);
        this.toolBar.tools.push(new ViewLayoutTool(this.undoTool.getOptionPanel(), "redo", "images/redoSprite.png"));
        this.toolBar.tools.push(this.undoTool);
        this.toolBar.tools.push(this.colorPickerTool);
        this.toolBar.tools.push(this.eraserTool);
        this.toolBar.tools.push(this.rotateTool);
        this.toolBar.tools.push(this.layersTool);
        this.toolBar.tools.push(this.settingsTool);
        //this.toolBar.tools.push(this.transformTool);
        this.toolBar.resize();
        this.ctx = this.canvas.getContext("2d");
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = "#000000";
        this.ctx.fillStyle = "#FFFFFF";
        this.repaint = true;
        this.lastDrawTime = Date.now();
    }
    selected():number {
        return this.toolBar.selected;
    }
    updateColorPickerTextBox():void{
        this.colorPickerTool.setColorText();
        this.repaint = true;
    }
    resizeCanvas():void
    {
        const imgPerColumn:number = (this.toolPixelDim[1] / this.toolBar.toolRenderDim[1]);
        const imgPerRow:number = (this.toolPixelDim[0] / this.toolBar.toolRenderDim[0]);
        if(this.tool() && this.tool().image() && this.toolBar.tools.length > imgPerColumn * imgPerRow){
            this.toolPixelDim[0] = this.toolBar.toolRenderDim[0] * Math.ceil(this.toolBar.tools.length / imgPerColumn);
            this.canvas.width = this.toolPixelDim[0] + this.tool().optionPanelSize()[0];
            this.toolPixelDim[1] = this.toolBar.toolRenderDim[1] * 10;

            this.canvas.height = this.toolPixelDim[1] > this.tool().height() ? this.toolPixelDim[1] : this.tool().height();
            this.ctx = this.canvas.getContext("2d");
            this.ctx.fillStyle = "#FFFFFF";
        }
    }
    draw()
    {
        if(this.repaint || Date.now() - this.lastDrawTime > 600)
        {
            this.repaint = false;
            this.lastDrawTime = Date.now();
            this.resizeCanvas();
            const imgPerColumn:number = (this.toolPixelDim[1] / this.toolBar.toolRenderDim[1]);
            const imgPerRow:number = (this.toolPixelDim[0] / this.toolBar.toolRenderDim[0]);
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.toolBar.refresh();
            this.toolBar.draw(this.ctx, 0, 0);
            if(this.tool()){
                (<Tool>this.toolBar.tools[this.selected()]).drawOptionPanel(this.ctx, this.toolBar.toolRenderDim[0]*imgPerRow, 0);
            }
        }
    }
    selectedToolName():string
    {
        if(this.tool())
            return this.tool().name();
        return null;
    }
    tool():Tool
    {
        if(this.selected() >= 0 && this.selected() < this.toolBar.tools.length){
            return <Tool> this.toolBar.tools[this.selected()];
        }
        return null;
    }

};
class DrawingScreenState {
    color:RGB;
    lineWidth:number;
    screenBufUnlocked:boolean;
    ignoreAlphaInFill:boolean;
    drawCircular:boolean;
    dragOnlyOneColor:boolean;
    rotateOnlyOneColor:boolean;
    blendAlphaOnPaste:boolean;
    blendAlphaOnPutSelectedPixels:boolean;
    antiAliasRotation:boolean;
    sprayPaintFactor:number;
    slow:boolean;
    constructor(lineWidth:number) {
        this.antiAliasRotation = true;
        this.screenBufUnlocked = true;
        this.blendAlphaOnPutSelectedPixels = true;
        this.ignoreAlphaInFill = false;
        this.dragOnlyOneColor = false;
        this.rotateOnlyOneColor = false;
        this.drawCircular = true;
        this.slow = false;
        this.blendAlphaOnPaste = true;
        this.lineWidth = lineWidth;//dimensions[0] / bounds[0] * 4;
    }
};
class DrawingScreen {
    offset:Pair<number>;
    bounds:Pair<number>;
    dimensions:Pair<number>;
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    repaint:boolean;
    spriteScreenBuf:Sprite;
    screenBuffer:Array<RGB>;
    clipBoard:ClipBoard;
    noColor:RGB;
    palette:Pallette;
    selectionRect:Array<number>;
    pasteRect:Array<number>;
    updatesStack:RollingStack<Array<Pair<number,RGB>>>;
    undoneUpdatesStack:RollingStack<Array<Pair<number,RGB>>>;
    toolSelector:ToolSelector;
    dragData:Pair<Pair<number>, number[] >;
    dragDataMaxPoint:number;
    dragDataMinPoint:number;
    state:DrawingScreenState;
    imageDataBuffer:ImageData;
    sprayProbability:number;

    constructor(canvas:HTMLCanvasElement, keyboardHandler:KeyboardHandler, palette:Pallette, offset:Array<number>, dimensions:Array<number>, toolSelector:ToolSelector, state:DrawingScreenState, clipBoard:ClipBoard)
    {
        const bounds:Array<number> = [dim[0], dim[1]];
        this.sprayProbability = 0.5;
        this.clipBoard = clipBoard;
        this.palette = palette;
        this.noColor = new RGB(255, 255, 255, 0);
        this.state = state;
        this.repaint = true;
        this.dimensions = new Pair<number>(dimensions[0], dimensions[1]);
        this.offset = new Pair<number>(offset[0], offset[1]);
        this.bounds = new Pair<number>(bounds[0], bounds[1]);
        this.ctx = canvas.getContext("2d");
        canvas.width = bounds[0];
        canvas.height = bounds[1];
        this.dragDataMaxPoint = 0;
        this.canvas = canvas;
        this.dragData = null;
        this.spriteScreenBuf = new Sprite([], this.canvas.width, this.canvas.height, false);
        this.toolSelector = toolSelector;
        this.updatesStack = new RollingStack<Array<Pair<number,RGB>>>();
        this.undoneUpdatesStack = new RollingStack<Array<Pair<number,RGB>>>();
        this.selectionRect = new Array<number>();
        this.screenBuffer = new Array<RGB>();
        this.selectionRect = [0,0,0,0];
        this.pasteRect = [0,0,0,0];
        for(let i = 0; i < dimensions[0] * dimensions[1]; i++)
        {
            this.screenBuffer.push(new RGB(this.noColor.red(), this.noColor.green(), this.noColor.blue(), this.noColor.alpha()));
        }
        const colorBackup:RGB = new RGB(this.noColor.red(), this.noColor.green(), this.noColor.blue(), this.noColor.alpha());

        
        this.state.color = new RGB(0,0,0,255);
        this.setDim(dim);
    }
    updateLabelUndoRedoCount(): void 
    {
        this.toolSelector.undoTool.updateLabel(this.undoneUpdatesStack.length(), this.updatesStack.length());
    }
    suggestedLineWidth():number
    {
        return this.dimensions.first / this.bounds.first * 4;
    }
    setLineWidthPen():void
    {
        const pen:PenTool = this.toolSelector.penTool;
        this.state.lineWidth = pen.penSize();
        pen.tbSize.setText(String(this.state.lineWidth));
    }
    saveToBuffer(selectionRect:Array<number>, buffer:Array<Pair<RGB, number>>):Pair<number>
    {
        if(selectionRect[2] < 0)
        {
            selectionRect[0] += selectionRect[2];
            selectionRect[2] *= -1;
        }
        if(selectionRect[3] < 0)
        {
            selectionRect[1] += selectionRect[3];
            selectionRect[3] *= -1;
        }
        
        buffer.length = 0;
        const source_x:number = Math.floor((selectionRect[0]-this.offset.first)/this.bounds.first*this.dimensions.first);
        const source_y:number = Math.floor((selectionRect[1]-this.offset.second)/this.bounds.second*this.dimensions.second);
        const width:number = Math.floor((selectionRect[2]-this.offset.first)/this.bounds.first*this.dimensions.first);
        const height:number = Math.floor((selectionRect[3]-this.offset.second)/this.bounds.second*this.dimensions.second);
        const area:number = width * height;
        for(let i = 0; i < area; i++)
        {
            const copyAreaX:number = i%width;
            const copyAreaY:number = Math.floor(i/width);
            const sourceIndex:number = source_x + source_y*this.dimensions.first + copyAreaX + copyAreaY*this.dimensions.first;
            
            if(this.inBufferBounds(source_x + copyAreaX, source_y + copyAreaY))
            {
                const pixel:RGB = this.screenBuffer[sourceIndex];
                buffer.push(new Pair(new RGB(pixel.red(), pixel.green(), pixel.blue(), pixel.alpha()), sourceIndex));
            }
        }
        return new Pair(width, height);
    }
    paste():void
    {
        if(this.state.screenBufUnlocked)
        {
            this.state.screenBufUnlocked = false;
            const dest_x:number = Math.floor((this.pasteRect[0]-this.offset.first)/this.bounds.first*this.dimensions.first);
            const dest_y:number = Math.floor((this.pasteRect[1]-this.offset.second)/this.bounds.second*this.dimensions.second);
            const width:number = this.clipBoard.currentDim[0];
            const height:number = this.clipBoard.currentDim[1];
            const initialIndex:number = dest_x + dest_y*this.dimensions.first;
            const blendAlpha:boolean = this.state.blendAlphaOnPaste;
            for(let i = 0; i < this.clipBoard.clipBoardBuffer.length; i++)
            {
                const copyAreaX:number = i%width;
                const copyAreaY:number = Math.floor(i/width);
                const destIndex:number = initialIndex + copyAreaX + copyAreaY*this.dimensions.first;
                const dest:RGB = this.screenBuffer[destIndex];
                const source:RGB = this.clipBoard.clipBoardBuffer[i].first;
                if(this.inBufferBounds(dest_x + copyAreaX, dest_y + copyAreaY) && (!dest.compare(source) || source.alpha() != 255))
                {
                    const oldColor:number = dest.color;
                    if(blendAlpha)
                        dest.blendAlphaCopy(source);
                    else
                        dest.copy(source);

                    if(oldColor !== dest.color)
                    {
                        const color:RGB = new RGB(0, 0, 0, 0);
                        color.color = oldColor
                        this.updatesStack.get(this.updatesStack.length()-1).push(new Pair(destIndex, color)); 
                    }
                }
            }
            this.state.screenBufUnlocked = true;
        }
    }

    handleTap(px:number, py:number, drawingScreen:DrawingScreen):void
    {
        const gx:number = Math.floor((px-drawingScreen.offset.first)/drawingScreen.bounds.first*drawingScreen.dimensions.first);
        const gy:number = Math.floor((py-drawingScreen.offset.second)/drawingScreen.bounds.second*drawingScreen.dimensions.second);
        if(gx < drawingScreen.dimensions.first && gy < drawingScreen.dimensions.second && drawingScreen.state.screenBufUnlocked){
            drawingScreen.state.screenBufUnlocked = false;
            const radius:number = drawingScreen.state.lineWidth * 0.5;
            if(drawingScreen.state.drawCircular)
            {
                const radius:number = drawingScreen.state.lineWidth * 0.5;
                for(let i = -0.5*drawingScreen.state.lineWidth; i < radius; i++)
                {
                    for(let j = -0.5*drawingScreen.state.lineWidth;  j < radius; j++)
                    {
                        const ngx:number = gx+Math.round(j);
                        const ngy:number = (gy+Math.round(i));
                        const dx:number = ngx - gx;
                        const dy:number = ngy - gy;
                        const pixel:RGB = drawingScreen.screenBuffer[ngx + ngy*drawingScreen.dimensions.first];
                        if(pixel && !pixel.compare(drawingScreen.state.color) && Math.sqrt(dx*dx+dy*dy) <= radius){
                            drawingScreen.updatesStack.get(drawingScreen.updatesStack.length()-1).push(new Pair(ngx + ngy*drawingScreen.dimensions.first, new RGB(pixel.red(),pixel.green(),pixel.blue(), pixel.alpha()))); 
                            pixel.copy(drawingScreen.state.color);
                        }
                    }
                }
            }
            else
            {
                const radius:number = drawingScreen.state.lineWidth * 0.5;
                for(let i = -0.5*drawingScreen.state.lineWidth; i < radius; i++)
                {
                    for(let j = -0.5*drawingScreen.state.lineWidth;  j < radius; j++)
                    {
                        const ngx:number = gx+Math.round(j);
                        const ngy:number = (gy+Math.round(i));
                        const pixel:RGB = drawingScreen.screenBuffer[ngx + ngy*drawingScreen.dimensions.first];
                        if(pixel && !pixel.compare(drawingScreen.state.color)){
                            drawingScreen.updatesStack.get(drawingScreen.updatesStack.length()-1).push(new Pair(ngx + ngy*drawingScreen.dimensions.first, new RGB(pixel.red(),pixel.green(),pixel.blue(), pixel.alpha()))); 
                            pixel.copy(drawingScreen.state.color);
                        }
                    }
                }
            }
            drawingScreen.repaint = true;
            drawingScreen.state.screenBufUnlocked = true;
        }
    }
    handleTapSprayPaint(px:number, py:number):void
    {
        const gx:number = Math.floor((px-this.offset.first)/this.bounds.first*this.dimensions.first);
        const gy:number = Math.floor((py-this.offset.second)/this.bounds.second*this.dimensions.second);
        if(gx < this.dimensions.first && gy < this.dimensions.second && this.state.screenBufUnlocked){
            this.state.screenBufUnlocked = false;
            const radius:number = this.state.lineWidth * 0.5;
            if(this.state.drawCircular)
            {
                const radius:number = this.state.lineWidth * 0.5;
                for(let i = -0.5*this.state.lineWidth; i < radius; i++)
                {
                    for(let j = -0.5*this.state.lineWidth;  j < radius; j++)
                    {
                        const ngx:number = gx+Math.round(j);
                        const ngy:number = (gy+Math.round(i));
                        const dx:number = ngx - gx;
                        const dy:number = ngy - gy;
                        const pixel:RGB = this.screenBuffer[ngx + ngy*this.dimensions.first];
                        if(pixel && !pixel.compare(this.state.color) && Math.sqrt(dx*dx+dy*dy) <= radius && Math.random() < this.sprayProbability){
                            this.updatesStack.get(this.updatesStack.length()-1).push(new Pair(ngx + ngy*this.dimensions.first, new RGB(pixel.red(),pixel.green(),pixel.blue(), pixel.alpha()))); 
                            pixel.copy(this.state.color);
                        }
                    }
                }
            }
            else
            {
                const radius:number = this.state.lineWidth * 0.5;
                for(let i = -0.5*this.state.lineWidth; i < radius; i++)
                {
                    for(let j = -0.5*this.state.lineWidth;  j < radius; j++)
                    {
                        const ngx:number = gx+Math.round(j);
                        const ngy:number = (gy+Math.round(i));
                        const pixel:RGB = this.screenBuffer[ngx + ngy*this.dimensions.first];
                        if(pixel && !pixel.compare(this.state.color) && Math.random() < this.sprayProbability){
                            this.updatesStack.get(this.updatesStack.length()-1).push(new Pair(ngx + ngy*this.dimensions.first, new RGB(pixel.red(),pixel.green(),pixel.blue(), pixel.alpha()))); 
                            pixel.copy(this.state.color);
                        }
                    }
                }
            }
            this.repaint = true;
            this.state.screenBufUnlocked = true;
        }
    }
    fillArea(startCoordinate:Pair<number>):void
    {
        if(this.state.screenBufUnlocked && 
            startCoordinate.first > 0 && startCoordinate.first < this.dimensions.first &&
            startCoordinate.second > 0 && startCoordinate.second < this.dimensions.second)
        {
            this.state.screenBufUnlocked = false;
        
            let stack:any;
            if(this.state.slow)//possibly more visiually appealling algo (bfs), 
            //but slower because it makes much worse use of the cache with very high random access
                stack = new Queue<number>();
            else
                stack = [];
            const checkedMap:Array<boolean> = new Array<boolean>(this.dimensions.first * this.dimensions.second).fill(false);
            const startIndex:number = startCoordinate.first + startCoordinate.second*this.dimensions.first;
            const startPixel:RGB = this.screenBuffer[startIndex];
            const spc:RGB = new RGB(startPixel.red(), startPixel.green(), startPixel.blue(), startPixel.alpha());

            stack.push(startIndex);
            const length:number = this.screenBuffer.length;
            while(stack.length > 0)
            {
                const cur:number = stack.pop();
                const pixelColor:RGB = this.screenBuffer[cur];
                if(cur >= 0 && cur < length && 
                    (pixelColor.compare(spc) || (this.state.ignoreAlphaInFill && pixelColor.alpha() === 0)) && !checkedMap[cur])
                {
                    checkedMap[cur] = true;
                    if(!pixelColor.compare(this.state.color)){
                        this.updatesStack.get(this.updatesStack.length()-1).push(new Pair(cur, new RGB(pixelColor.red(), pixelColor.green(), pixelColor.blue(), pixelColor.alpha())));
                        pixelColor.copy(this.state.color);
                    }
                    stack.push(cur + this.dimensions.first);
                    stack.push(cur - this.dimensions.first);
                    stack.push(cur-1);
                    stack.push(cur+1);
                }
            }
            this.state.screenBufUnlocked = true;
            this.repaint = true;
        }
    }
    //Pair<offset point>, Map of colors encoded as numbers by location>
    getSelectedPixelGroup(startCoordinate:Pair<number>, countColor:boolean):Pair<Pair<number>, number[] >
    {
        const data:number[] = [];
        if(this.state.screenBufUnlocked && 
            startCoordinate.first > 0 && startCoordinate.first < this.dimensions.first &&
            startCoordinate.second > 0 && startCoordinate.second < this.dimensions.second)
        {
            this.state.screenBufUnlocked = false;
            const stack:number[] = [];
            const defaultColor = this.noColor;
            const checkedMap:Array<boolean> = new Array<boolean>(this.dimensions.first * this.dimensions.second).fill(false);
            
            const startIndex:number = startCoordinate.first + startCoordinate.second*this.dimensions.first;
            const startPixel:RGB = this.screenBuffer[startIndex];
            const spc:RGB = new RGB(startPixel.red(), startPixel.green(), startPixel.blue(), startPixel.alpha());
            stack.push(startIndex);
            this.dragDataMaxPoint = 0;
            this.dragDataMinPoint = this.dimensions.first*this.dimensions.second;
            while(stack.length > 0)
            {
                const cur:number = stack.pop();
                const pixelColor:RGB = this.screenBuffer[cur];
                if(cur >= 0 && cur < this.dimensions.first * this.dimensions.second && 
                    (pixelColor.alpha() !== 0 && (!countColor || pixelColor.color === spc.color)) && !checkedMap[cur])
                {
                    checkedMap[cur] = true;
                    this.updatesStack.get(this.updatesStack.length()-1).push(new Pair(cur, new RGB(pixelColor.red(), pixelColor.green(), pixelColor.blue(), pixelColor.alpha())));
                    //top left
                    data.push(cur % this.dimensions.first);
                    data.push(Math.floor(cur / this.dimensions.first));
                    //top right
                    data.push(cur % this.dimensions.first + 1);
                    data.push(Math.floor(cur / this.dimensions.first));
                    //bottom left
                    data.push(cur % this.dimensions.first);
                    data.push(Math.floor(cur / this.dimensions.first) + 1);
                    //bottom right
                    data.push(cur % this.dimensions.first + 1);
                    data.push(Math.floor(cur / this.dimensions.first) + 1);

                    data.push(pixelColor.color);
                    pixelColor.copy(defaultColor);
                    if(cur > this.dragDataMaxPoint)
                        this.dragDataMaxPoint = cur;
                    if(cur < this.dragDataMinPoint)
                        this.dragDataMinPoint = cur;
                    if(!checkedMap[cur+1])
                        stack.push(cur+1);
                    if(!checkedMap[cur-1])
                        stack.push(cur-1);
                    if(!checkedMap[cur + this.dimensions.first])
                        stack.push(cur + this.dimensions.first);
                    if(!checkedMap[cur - this.dimensions.first])
                        stack.push(cur - this.dimensions.first);
                    if(!checkedMap[cur + this.dimensions.first - 1])
                        stack.push(cur + this.dimensions.first - 1);
                    if(!checkedMap[cur + this.dimensions.first + 1])
                        stack.push(cur + this.dimensions.first + 1);
                    if(!checkedMap[cur - this.dimensions.first - 1])
                        stack.push(cur - this.dimensions.first - 1);
                    if(!checkedMap[cur - this.dimensions.first + 1])
                        stack.push(cur - this.dimensions.first + 1);
                }
            }
            this.updatesStack.push([]);
            this.state.screenBufUnlocked = true;
        }
        return new Pair(new Pair(0,0), data);
    }
    rotateSelectedPixelGroup(theta:number, centerPoint:number[]):void
    {
        const min = [this.dragDataMinPoint%this.dimensions.first, Math.floor(this.dragDataMinPoint/this.dimensions.first)];
        const max = [this.dragDataMaxPoint%this.dimensions.first, Math.floor(this.dragDataMaxPoint/this.dimensions.first)];
        const dx:number = Math.floor(centerPoint[0]);
        const dy:number = Math.floor(centerPoint[1]);
        this.dragDataMinPoint = this.dimensions.first * this.dimensions.second;
        this.dragDataMaxPoint = 0;
        const initTransMatrix:number[] = [1,0,dx,
                                          0,1,dy,
                                          0,0,1];
        const cos:number = Math.cos(theta);
        const sin:number = Math.sin(theta);
        const rotationMatrix:number[] = [cos, -sin, 0, 
                                         sin, cos, 0,
                                         0, 0, 1];
        const revertTransMatrix:number[] = [1,0,dx*-1,
                                            0,1,dy*-1,
                                            0,0,1];
        const finalTransformationMatrix:number[] = threeByThreeMat(threeByThreeMat(initTransMatrix, rotationMatrix), revertTransMatrix);
        const vec:number[] = [0,0,0];
        const data:number[] = [];
        for(let i = 0; i < this.dragData.second.length; i+=9)
        {
            for(let j = i; j < i+8; j += 2)
            {
                vec[0] = this.dragData.second[j];
                vec[1] = this.dragData.second[j+1];
                vec[2] = 1;
                let transformed:number[] = matByVec(finalTransformationMatrix, vec);
                const point:number =  Math.floor(transformed[0]) + Math.floor(transformed[1]) * this.dimensions.first;
                if(point < this.dragDataMinPoint && point >= 0)
                    this.dragDataMinPoint = point;
                if(point > this.dragDataMaxPoint)
                    this.dragDataMaxPoint = point;
                if(this.state.antiAliasRotation){
                    data.push(transformed[0]);
                    data.push(transformed[1]);
                }
                else {
                    data.push(Math.round(transformed[0]));
                    data.push(Math.round(transformed[1]));
                }
            }
            data.push(this.dragData.second[i+8]);
        }
        this.dragData.second = data;
    }
    drawRect(start:Array<number>, end:Array<number>, drawPoint:(x:number, y:number, screen:DrawingScreen) => void = this.handleTap):void
    {
        this.drawLine(start, [start[0], end[1]], drawPoint);
        this.drawLine(start, [end[0], start[1]], drawPoint);
        this.drawLine([start[0], end[1]], end, drawPoint);
        this.drawLine([end[0], start[1]], end, drawPoint);
    }
    drawLine(start:Array<number>, end:Array<number>, drawPoint:(x:number, y:number, screen:DrawingScreen) => void = this.handleTap):void
    {
        this.handleDraw(start[0], end[0], start[1], end[1], drawPoint);
    }
    handleDraw(x1:number, x2:number, y1:number, y2:number, drawPoint:(x:number, y:number, screen:DrawingScreen) => void = this.handleTap):void
    {
        //draw line from current touch pos to the touchpos minus the deltas
        //calc equation for line
        const deltaY = y2 - y1;
        const deltaX = x2 - x1;
        const m:number = deltaY/deltaX;
        const b:number = y2-m*x2;
        const delta:number = this.state.lineWidth <= 2? 0.1 : 1;
        if(Math.abs(deltaX) > Math.abs(deltaY))
        {
            const min:number = Math.min(x1, x2);
            const max:number = Math.max(x1, x2);
            for(let x = min; x < max; x+=delta)
            {
                const y:number = m*x + b;
                drawPoint(x, y, this);
            }
        }
        else
        {
            const min:number = Math.min(y1, y2);
            const max:number = Math.max(y1, y2);
            for(let y = min; y < max; y+=delta)
            {
                const x:number = Math.abs(deltaX)>0?(y - b)/m:x2;
                drawPoint(x, y, this);
            }
        }
        this.repaint = true;
    }
    handleEllipse(sx:number, ex:number, mx:number, my:number, drawPoint:(x:number, y:number, screen:DrawingScreen) => void = this.handleTap):void
    {
        const start_x:number = sx;
        const end_x:number = ex;
        const min_y:number = mx;
        const max_y:number = my;
        const height:number = (max_y - min_y) / 2;
        const width:number = (end_x - start_x) / 2;
        const h:number = start_x + (end_x - start_x) / 2;
        const k:number = min_y + (max_y - min_y) / 2;

        let last:number[] = [h + width*Math.cos(0), k + height*Math.sin(0)];
        for(let x = -0.1; x < 2*Math.PI; x += 0.05)
        { 
            const cur = [h + width*Math.cos(x), k + height*Math.sin(x)];
            this.drawLine([last[0], last[1]], [cur[0], cur[1]], drawPoint);
            last = cur;
        }
    }
    async undoLast()
    {
        if(this.updatesStack.length() && this.state.screenBufUnlocked)
        {
            this.state.screenBufUnlocked = false;
            const data:Pair<number, RGB>[] = this.updatesStack.pop();
            const backedUpFrame = [];
            const divisor:number =  60*10;
            const interval:number = Math.floor(data.length/divisor) === 0 ? 1 : Math.floor(data.length / divisor);
            let intervalCounter:number = 0;
            for(let i = 0; i < data.length; i++)
            {
                intervalCounter++;
                const el:Pair<number, RGB> = data[i];
                    backedUpFrame.push(el);
                    const color:number = (this.screenBuffer[el.first]).color;
                    this.screenBuffer[el.first].copy(el.second);
                    el.second.color = color;
                    if(intervalCounter % interval === 0 && this.state.slow)
                    {
                        await sleep(1);
                        this.repaint = true;
                    }
            }
            this.undoneUpdatesStack.push(backedUpFrame);
            this.repaint = true;
            this.state.screenBufUnlocked = true;
        }
        else{
            console.log("Error, nothing to undo");
        }
            
    }
    async redoLast()
    {
        if(this.undoneUpdatesStack.length() && this.state.screenBufUnlocked)
        {
            this.state.screenBufUnlocked = false;
            const data = this.undoneUpdatesStack.pop();
            const backedUpFrame = [];
            const divisor:number =  60*10;
            const interval:number = Math.floor(data.length/divisor) === 0 ? 1 : Math.floor(data.length / divisor);
            let intervalCounter:number = 0;
            for(let i = 0; i < data.length; i++)
            {
                intervalCounter++;
                const el:Pair<number, RGB> = data[i];
                    backedUpFrame.push(el);
                    const color:number = this.screenBuffer[el.first].color;
                    this.screenBuffer[el.first].copy(el.second);
                    el.second.color = color;
                    if(intervalCounter % interval === 0 && this.state.slow)
                    {
                        await sleep(1);
                        this.repaint = true;
                    }
            }
            this.repaint = true;
            this.updatesStack.push(backedUpFrame);
            this.state.screenBufUnlocked = true;
        }
        else{
            console.log("Error, nothing to redo");
        }
    }
    inBufferBounds(x:number, y:number)
    {
        return x >= 0 && x < this.dimensions.first && y >= 0 && y < this.dimensions.second;
    }
    setDim(newDim:number[]): Pair<number,number>
    {
        let zoom:Pair<number> = new Pair<number>(1,1);
        if(newDim.length === 2)
        { 
            if(newDim[0] < 300)
            {
                this.bounds.first = newDim[0] * Math.floor(600 / newDim[0]);
                zoom.first = 1 / Math.floor(600 / newDim[0]);
            }
            else
            {
                this.bounds.first = newDim[0];
            } 
            if(newDim[1] < 300)
            {
                this.bounds.second = newDim[1] * Math.floor(600 / newDim[1]);
                zoom.second = 1 / Math.floor(600 / newDim[1]);
            }
            else
            {
                this.bounds.second = newDim[1];
            }
            const bounds:Array<number> = [this.bounds.first, this.bounds.second];
            const dimensions:Array<number> = [this.dimensions.first, this.dimensions.second];
            this.undoneUpdatesStack.empty();
            this.updatesStack.empty();

            if(this.screenBuffer.length != newDim[0]*newDim[1])
            {
                const canvas = document.createElement("canvas");
                canvas.width = newDim[0];
                canvas.height = newDim[1];
                const ctx = canvas.getContext("2d");
                this.screenBuffer = [];
                for(let i = 0; i < newDim[0] * newDim[1]; i++)
                    this.screenBuffer.push(new RGB(0,0,0,0));
                ctx.drawImage(this.canvas, 0, 0, newDim[0], newDim[1]);
                const sprite:Sprite = new Sprite([], newDim[0], newDim[1], false);
                sprite.pixels = ctx.getImageData(0, 0, newDim[0], newDim[1]).data;
                sprite.copyToBuffer(this.screenBuffer);
                this.spriteScreenBuf = new Sprite([], this.bounds.first, this.bounds.second); 
            }
            this.canvas.width = bounds[0];
            this.canvas.height = bounds[1];
            this.ctx = this.canvas.getContext("2d");
            this.imageDataBuffer = this.ctx.getImageData(0,0,bounds[0],bounds[1]);
            this.dimensions = new Pair(newDim[0], newDim[1]);
            this.clipBoard.resize(newDim);
            this.repaint = true;
        }
        return zoom;
    }
    lowerPixelPercentage(a:number):number
    {
        const frac:number = a - Math.floor(a);
        return 1 - frac;
    }
    reboundKey(key:number):number
    {
        /*let newKey:number = (key) % (this.dimensions.first * this.dimensions.second);
        if(newKey < 0)
            newKey += this.dimensions.first * this.dimensions.second;*/
        return (key) % (this.screenBuffer.length) + +(key<0) * this.screenBuffer.length;
    }
    loadSprite(sprite:Sprite):void {
        sprite.copyToBuffer(this.screenBuffer);
        this.undoneUpdatesStack.empty();
        this.updatesStack.empty();
        this.updateLabelUndoRedoCount();
        this.repaint = true;
    }
    saveDragDataToScreen():void
    {
        if(this.dragData)
        {
            let counter:number = 0;
            const color:RGB = new RGB(0,0,0,0);
            const dragDataColors = this.dragData.second;
            for(let i = 0; i < this.dragData.second.length; i += 9)
            {
                counter++;
                const x:number = Math.floor(dragDataColors[i + 0] + this.dragData.first.first);
                const y:number = Math.floor(dragDataColors[i + 1] + this.dragData.first.second);
                let key:number = this.reboundKey(x + y * this.dimensions.first);
                color.color = dragDataColors[i + 8];
                this.updatesStack.get(this.updatesStack.length()-1).push(new Pair(key, new RGB(this.screenBuffer[key].red(), this.screenBuffer[key].green(), this.screenBuffer[key].blue(), this.screenBuffer[key].alpha())));
                if(color.alpha() !== 255 && this.state.blendAlphaOnPutSelectedPixels)
                    this.screenBuffer[key].blendAlphaCopy(color);
                else
                    this.screenBuffer[key].color = color.color;
                
            }
            this.repaint = true;
        }
    }
    async saveDragDataToScreenAntiAliased():Promise<void>
    {
        if(this.dragData)
        {
            let counter:number = 0;
            const color0:RGB = new RGB(0,0,0,0);
            const color1:RGB = new RGB(0,0,0,0);
            const dragDataColors = this.dragData.second;
            const map:Map<number, number[]> = new Map<number,number[]>();
            for(let i = 0; i < this.dragData.second.length; i += 9){
                counter++;
                if((counter & ((2<<20) - 1)) === 0)
                    await sleep(1);
                const x1:number = dragDataColors[i + 0] + Math.floor(this.dragData.first.first);
                const y1:number = dragDataColors[i + 1] + Math.floor(this.dragData.first.second);
                const x2:number = dragDataColors[i + 2] + Math.floor(this.dragData.first.first);
                const y2:number = dragDataColors[i + 3] + Math.floor(this.dragData.first.second);
                const x3:number = dragDataColors[i + 6] + Math.floor(this.dragData.first.first);
                const y3:number = dragDataColors[i + 7] + Math.floor(this.dragData.first.second);
                const deltaX:number = Math.max(x1,x2) - Math.min(x1, x2);
                const deltaY:number = Math.max(y1,y2) - Math.min(y1, y2);
                const deltaX2:number = Math.max(x1,x3) - Math.min(x1, x3);
                const deltaY2:number = Math.max(y1,y3) - Math.min(y1, y3);

                    color0.color = dragDataColors[i + 8];
                    const limit:number = 15;
                    const ratio:number = 1/limit;
                    const percent = 1/(limit*limit);
                    for(let j = 0; j <= limit; j++)
                    {
                        for(let k = 0; k <= limit; k++)
                        {
                            counter++;
                            const sub_x:number = Math.floor(k*ratio * deltaX + j*ratio * deltaX2 + x1);
                            const sub_y:number = Math.floor(k*ratio * deltaY + j*ratio * deltaY2 + y1);
                            const pixelIndex = sub_x + sub_y * this.dimensions.first;
                            let color:number[] = map.get(pixelIndex);
                            if(!color)
                            {
                                color = [0, 0, 0, 0, 0];
                            }
                            if(color[4] < 1)
                            {
                                color[0] += color0.red() * percent;
                                color[1] += color0.green() * percent;
                                color[2] += color0.blue() * percent;
                                color[3] += color0.alpha() * percent;
                                color[4] += percent;
                            }
                            map.set(pixelIndex, color);
                        }
                    }
                
            }
            for(const [key, value] of map.entries())
            {
                color0.setRed(value[0]);
                color0.setGreen(value[1]);
                color0.setBlue(value[2]);
                color0.setAlpha(value[3]);
                
                let newKey:number = this.reboundKey(key);
                if(this.screenBuffer[newKey])
                {
                    this.updatesStack.get(this.updatesStack.length()-1).push(new Pair(newKey, new RGB(this.screenBuffer[newKey].red(), this.screenBuffer[newKey].green(), this.screenBuffer[newKey].blue(), this.screenBuffer[newKey].alpha())));
                    this.screenBuffer[newKey].blendAlphaCopy(color0);
                }
            };
            this.repaint = true;
        }
    }
    draw():void
    {
        if(this.repaint)
        {
            this.repaint = false;
            const ctx:CanvasRenderingContext2D = this.ctx;
            const cellHeight:number = (this.bounds.second / this.dimensions.second);
            const cellWidth:number = (this.bounds.first / this.dimensions.first);
            const white:RGB = new RGB(255,255,255);
            const spriteScreenBuf:Sprite = this.spriteScreenBuf;
            const source:RGB = new RGB(0,0,0,0);
            const toCopy:RGB = new RGB(0,0,0,0);
            spriteScreenBuf.fillRect(white, 0, 0, this.canvas.width, this.canvas.height);
        
            if(this.dimensions.first === this.canvas.width && this.dimensions.second === this.canvas.height)
            {//if drawing screen dimensions, and canvas dimensions are the same just update per pixel
                let index = 0
                for(; index < this.screenBuffer.length - 4;)
                {
                    spriteScreenBuf.pixels[(index<<2)] = this.screenBuffer[index].red();  
                    spriteScreenBuf.pixels[(index<<2) + 1] = this.screenBuffer[index].green();   
                    spriteScreenBuf.pixels[(index<<2) + 2] = this.screenBuffer[index].blue();   
                    spriteScreenBuf.pixels[(index<<2) + 3] = this.screenBuffer[index].alpha();   
                    ++index;
                    spriteScreenBuf.pixels[(index<<2)] = this.screenBuffer[index].red();  
                    spriteScreenBuf.pixels[(index<<2) + 1] = this.screenBuffer[index].green();   
                    spriteScreenBuf.pixels[(index<<2) + 2] = this.screenBuffer[index].blue();   
                    spriteScreenBuf.pixels[(index<<2) + 3] = this.screenBuffer[index].alpha(); 
                    ++index;
                    spriteScreenBuf.pixels[(index<<2)] = this.screenBuffer[index].red();  
                    spriteScreenBuf.pixels[(index<<2) + 1] = this.screenBuffer[index].green();   
                    spriteScreenBuf.pixels[(index<<2) + 2] = this.screenBuffer[index].blue();   
                    spriteScreenBuf.pixels[(index<<2) + 3] = this.screenBuffer[index].alpha(); 
                    ++index;
                    spriteScreenBuf.pixels[(index<<2)] = this.screenBuffer[index].red();  
                    spriteScreenBuf.pixels[(index<<2) + 1] = this.screenBuffer[index].green();   
                    spriteScreenBuf.pixels[(index<<2) + 2] = this.screenBuffer[index].blue();   
                    spriteScreenBuf.pixels[(index<<2) + 3] = this.screenBuffer[index].alpha(); 
                    ++index;
                }

                for(; index < this.screenBuffer.length; )
                {
                    spriteScreenBuf.pixels[(index<<2)] = this.screenBuffer[index].red();  
                    spriteScreenBuf.pixels[(index<<2) + 1] = this.screenBuffer[index].green();   
                    spriteScreenBuf.pixels[(index<<2) + 2] = this.screenBuffer[index].blue();   
                    spriteScreenBuf.pixels[(index<<2) + 3] = this.screenBuffer[index].alpha();
                    index++; 
                }
            }
            else//use fill rect method to fill rectangle the size of pixels(more branch mispredicts, but more general)
                for(let y = 0; y < this.dimensions.second; y++)
                {
                    for(let x = 0; x < this.dimensions.first; x++)
                    {
                        spriteScreenBuf.fillRect(this.screenBuffer[x + y*this.dimensions.first], x * cellWidth, y * cellHeight, cellWidth, cellHeight);   
                    }
                }
            if(this.dragData)
            {
                const dragDataColors:number[] = this.dragData.second;
                const dragDataOffsetX:number = Math.floor(this.dragData.first.first);
                const dragDataOffsetY:number = Math.floor(this.dragData.first.second);
                for(let i:number = 0; i < this.dragData.second.length; i += 9){
                    const bx:number = Math.floor(dragDataColors[i] + dragDataOffsetX);
                    const by:number = Math.floor(dragDataColors[i+1] + dragDataOffsetY);
                    let key:number = this.reboundKey(bx + by * this.dimensions.first);
                    toCopy.color = dragDataColors[i + 8];
                    source.color = this.screenBuffer[key].color;
                    source.blendAlphaCopy(toCopy);
                    const sy:number = Math.floor(Math.floor(key / this.dimensions.first) * cellHeight);
                    const sx:number = Math.floor((key % this.dimensions.first) * cellWidth);
                    spriteScreenBuf.fillRect(source, sx, sy, cellWidth, cellHeight);
                             
                };
    
            }
            if(this.pasteRect[3] !== 0 && this.toolSelector.drawingScreenListener && this.toolSelector.drawingScreenListener.registeredTouch && this.toolSelector.selectedToolName() === "paste")
            {
                const dest_x:number = Math.floor((this.pasteRect[0]-this.offset.first)/this.bounds.first*this.dimensions.first);
                const dest_y:number = Math.floor((this.pasteRect[1]-this.offset.second)/this.bounds.second*this.dimensions.second);
                const width:number = this.clipBoard.currentDim[0];
                const height:number = this.clipBoard.currentDim[1];
                const initialIndex:number = dest_x + dest_y*this.dimensions.first;
                for(let i = 0; i < this.clipBoard.clipBoardBuffer.length; i++)
                {
                    const copyAreaX:number = i%width;
                    const copyAreaY:number = Math.floor(i/width);
                    const destIndex:number = initialIndex + copyAreaX + copyAreaY*this.dimensions.first;
                    const x:number = destIndex % this.dimensions.first;
                    const y:number = Math.floor(destIndex/this.dimensions.first);
                    source.color = this.clipBoard.clipBoardBuffer[i].first.color;
                    if(this.screenBuffer[destIndex] && source.alpha() > 0)
                    {
                        toCopy.color = this.screenBuffer[destIndex].color;
                        if(this.state.blendAlphaOnPaste)
                            spriteScreenBuf.fillRectAlphaBlend(toCopy, source, x*cellWidth, y*cellHeight, cellWidth, cellHeight);
                        else
                            spriteScreenBuf.fillRect(source, x*cellWidth, y*cellHeight, cellWidth, cellHeight);
                    
                    }
                }
            }
            
            spriteScreenBuf.putPixels(ctx, this.imageDataBuffer);
            if(this.toolSelector.drawingScreenListener && this.toolSelector.drawingScreenListener.registeredTouch && this.toolSelector.selectedToolName() === "line")
            {
                let touchStart = [this.selectionRect[0], this.selectionRect[1]];
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.strokeStyle = this.state.color.htmlRBGA();
                ctx.moveTo(touchStart[0], touchStart[1]);
                ctx.lineTo(this.selectionRect[2] + touchStart[0], this.selectionRect[3] + touchStart[1]);
                ctx.stroke();
            }
            else if(this.toolSelector.drawingScreenListener && this.toolSelector.drawingScreenListener.registeredTouch && this.selectionRect[3] !== 0)
            {
                ctx.lineWidth = 6;
                const xr:number = Math.abs(this.selectionRect[2]/2);
                const yr:number = Math.abs(this.selectionRect[3]/2);
                if(this.toolSelector.selectedToolName() === "copy")
                {
                    ctx.strokeStyle = "#FFFFFF";
                    ctx.strokeRect(this.selectionRect[0]+2, this.selectionRect[1]+2, this.selectionRect[2]-4, this.selectionRect[3]-4);
                    ctx.strokeStyle = "#FF0000";
                    ctx.strokeRect(this.selectionRect[0], this.selectionRect[1], this.selectionRect[2], this.selectionRect[3]);
               
                }
                else if(this.toolSelector.selectedToolName() !== "oval")
                {
                    ctx.strokeStyle = "#FFFFFF";
                    ctx.strokeRect(this.selectionRect[0]+2, this.selectionRect[1]+2, this.selectionRect[2]-4, this.selectionRect[3]-4);
                    ctx.strokeStyle = this.state.color.htmlRBG();
                    ctx.strokeRect(this.selectionRect[0], this.selectionRect[1], this.selectionRect[2], this.selectionRect[3]);
                }
                else if(this.selectionRect[2] / 2 > 0 && this.selectionRect[3] / 2 > 0)
                {
                    ctx.beginPath();
                    ctx.strokeStyle = this.state.color.htmlRBG();
                    ctx.ellipse(this.selectionRect[0] + xr, this.selectionRect[1]+yr, xr, yr, 0, 0, 2*Math.PI);
                    ctx.stroke();
                }
                else if(this.selectionRect[2] < 0 && this.selectionRect[3] >= 0)
                {
                    ctx.beginPath();
                    ctx.strokeStyle = this.state.color.htmlRBG();
                    ctx.ellipse(this.selectionRect[0] - xr, this.selectionRect[1] + yr, xr, yr, 0, 0, 2*Math.PI);
                    ctx.stroke();
                }
                else if(this.selectionRect[2] < 0 && this.selectionRect[3] < 0)
                {
                    ctx.beginPath();
                    ctx.strokeStyle = this.state.color.htmlRBG();
                    ctx.ellipse(this.selectionRect[0] - xr, this.selectionRect[1] - yr, xr, yr, 0, 0, 2*Math.PI);
                    ctx.stroke();
                }
                else if(this.selectionRect[2] != 0 && this.selectionRect[3] != 0)
                {
                    ctx.beginPath();
                    ctx.strokeStyle = this.state.color.htmlRBG();
                    ctx.ellipse(this.selectionRect[0] + xr, this.selectionRect[1] - yr, xr, yr, 0, 0, 2*Math.PI);
                    ctx.stroke();
                }
            }
            if(this.toolSelector.drawingScreenListener && this.toolSelector.drawingScreenListener.registeredTouch && this.pasteRect[3] !== 0)
            {
                ctx.lineWidth = 6;
                ctx.strokeStyle = "#FFFFFF";
                ctx.strokeRect(this.pasteRect[0]+2, this.pasteRect[1]+2, this.pasteRect[2]-4, this.pasteRect[3]-4);
                ctx.strokeStyle = "#0000FF";
                ctx.strokeRect(this.pasteRect[0], this.pasteRect[1], this.pasteRect[2], this.pasteRect[3]);
            }
        }

        
    }
    drawToContext(ctx:CanvasRenderingContext2D, x:number, y:number, width:number = this.dimensions.first, height:number = this.dimensions.second):void
    {
        this.draw();
        ctx.drawImage(this.canvas, x, y, width, height);
    }
};
class ZoomState {
    zoomX:number; // 0 to 1;
    zoomY:number;
    zoomedX:number;
    zoomedY:number;
    offsetX:number;
    offsetY:number;

    constructor() {
        this.zoomX = 1;
        this.zoomY = 1;
        this.zoomedX = 0;
        this.zoomedY = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }
    invZoomX(x:number)
    {
        return (1 / this.zoomX) * (x - this.zoomedX) ;
    }
    invZoomY(y:number)
    {
        return (1 / this.zoomY) * (y - this.zoomedY);
    }
    invJustZoomX(x:number)
    {
        return (1 / this.zoomX) * (x) ;
    }
    invJustZoomY(y:number)
    {
        return (1 / this.zoomY) * (y);
    }
};
class LayeredDrawingScreen {
    layers:DrawingScreen[];
    layersState:boolean[];
    state:DrawingScreenState;
    selected:number;
    clipBoard:ClipBoard;
    canvas:HTMLCanvasElement;
    canvasTransparency:HTMLCanvasElement;
    spriteTest:Sprite;
    dim:number[];
    ctx:CanvasRenderingContext2D;
    redraw:boolean;
    keyboardHandler:KeyboardHandler;
    pallette:Pallette;
    toolSelector:ToolSelector;
    offscreenCanvas:HTMLCanvasElement;
    zoom:ZoomState;
    constructor(keyboardHandler:KeyboardHandler, pallette:Pallette) {
        this.canvas = document.createElement("canvas");
        this.offscreenCanvas = document.createElement("canvas");
        this.canvasTransparency = document.createElement("canvas");
        this.state = new DrawingScreenState(3);
        this.dim = [524, 524];
        this.canvas.width = this.dim[0];
        this.canvas.height = this.dim[1];
        this.spriteTest = new Sprite([], this.dim[0], this.dim[1], false);
        this.ctx = this.canvas.getContext("2d");
        this.ctx.fillStyle = "#FFFFFF";
        this.selected = 0;
        this.layers = [];
        this.layersState = [];
        this.keyboardHandler = keyboardHandler;
        this.pallette = pallette;
        this.resizeTransparencyCanvas([4000,4000]);
        this.setDimOnCurrent(this.dim);
        this.zoom = new ZoomState();
        this.clipBoard = new ClipBoard(<HTMLCanvasElement> document.getElementById("clipboard_canvas"), keyboardHandler, 128, 128);
    }
    repaint():boolean {
        let repaint:boolean = false;
        for(let i = 0; !repaint && i < this.layers.length; i++)
        {
            repaint = this.layers[i].repaint;
        }
        return repaint;
    }
    setDimOnCurrent(dim:number[]):void {
        if(this.layer())
        {
            this.layers.forEach(layer => {
                const zoom:Pair<number> = layer.setDim(dim);
                this.zoom.zoomX = zoom.first;
                this.zoom.zoomY = zoom.second;
            });
            
            const bounds:number[] = [this.layer().bounds.first, this.layer().bounds.second];
            this.dim = [bounds[0], bounds[1]];
            this.canvas.width = bounds[0];
            this.canvas.height = bounds[1];
        }
        //this.resizeTransparencyCanvas(this.dim);
    }
    resizeTransparencyCanvas(bounds:number[]):void
    {
        if((this.canvasTransparency.width !== bounds[0] || this.canvasTransparency.height !== bounds[1]))
        {
            this.canvasTransparency.width = bounds[0];
            this.canvasTransparency.height = bounds[0];
            const ctx:CanvasRenderingContext2D = this.canvasTransparency.getContext("2d");
            ctx.fillStyle = "#DCDCDF";
            ctx.fillRect(0, 0, bounds[0], bounds[1]);
            ctx.fillStyle = "#FFFFFF";
            let i = 0;
            for(let y = 0; y < bounds[1] + 100; y += 10)
            {
                let offset = +(i % 2 === 0);
                for(let x = offset*10 ; x < bounds[0] + 200; x += 20)
                {
                    ctx.fillRect(x,  y, 10, 10);
                }
                i++;
            }
        }
    }
    swapLayers(x1:number, x2:number):void
    {
        if(this.layers[x1] && this.layers[x2])
        {
            const temp:DrawingScreen = this.layers[x1];
            const temp2:boolean = this.layersState[x1];
            this.layers[x1] = this.layers[x2];
            this.layers[x2] = temp;
            this.layersState[x1] = this.layersState[x2];
            this.layersState[x2] = temp2;
        }
    }
    layer():DrawingScreen {
        return this.layers[this.selected];
    }
    deleteLayer(index:number): void
    {
        this.layers.splice(index, 1);
        this.layersState.splice(index, 1);
        this.layer().repaint = true;
    }
    loadImageToLayer(image:HTMLImageElement):void
    {
        this.offscreenCanvas.height = image.height;
        this.offscreenCanvas.width = image.width;
        const ctx:CanvasRenderingContext2D = this.offscreenCanvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        const sprite:Sprite = new Sprite([], this.offscreenCanvas.width, this.offscreenCanvas.width, false);
        sprite.pixels = ctx.getImageData(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height).data;
        const layer:DrawingScreen = this.layers[this.layers.length - 1];
        this.layers.forEach(layer => layer.setDim([image.width, image.height]));
        const bounds:number[] = [this.layer().bounds.first, this.layer().bounds.second];
        this.dim = [bounds[0], bounds[1]];
        this.canvas.width = bounds[0];
        this.canvas.height = bounds[1];
        sprite.copyToBuffer(layer.screenBuffer);
    }

    addBlankLayer():DrawingScreen
    {
        const layer:DrawingScreen = new DrawingScreen(
            document.createElement("canvas"), this.keyboardHandler, this.pallette, [0, 0], [this.dim[0], this.dim[1]], this.toolSelector, this.state, this.clipBoard);
        layer.setDim(this.dim);
        this.layers.push(layer);
        this.layersState.push(true);
        return layer;
    }
    width():number {
        return this.dim[0];
    }
    height():number {
        return this.dim[1];
    }
    saveToFile(fileName:string):void {
        const a:HTMLAnchorElement = document.createElement("a");
        this.toSprite();
        this.offscreenCanvas.toBlob(blob => {
            a.href = window.URL.createObjectURL(blob);
            a.download = fileName;
            a.click();
        });
    }
    toSprite():Sprite
    {
        //set offscreen canvas state, and get ctx for rescale
        this.offscreenCanvas.width = this.layer().dimensions.first;
        this.offscreenCanvas.height = this.layer().dimensions.second;
        const ctx:CanvasRenderingContext2D = this.offscreenCanvas.getContext("2d");
        //rescale main canvas with offscreen canvas
        //ctx.drawImage(this.canvas, 0, 0, this.layer().dimensions.first, this.layer().dimensions.second);

        for(let i = 0; i < this.layers.length; i++)
        {
            if(this.layersState[i])
            {
                const layer:DrawingScreen = this.layers[i];
                layer.drawToContext(ctx, 0, 0, this.layer().dimensions.first, this.layer().dimensions.second);
            }
        }
        //save rescaled offscreen canvas to sprite
        const sprite:Sprite = new Sprite([], this.layer().dimensions.first, this.layer().dimensions.second, false);
        sprite.pixels = ctx.getImageData(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height).data;
        sprite.refreshImage();

        return sprite;
    }
    draw(canvas:HTMLCanvasElement, ctx:CanvasRenderingContext2D, x:number, y:number, width:number, height:number):void 
    {
        if(width !== this.width() || height !== this.height())
        {
            canvas.width = this.width();
            canvas.height = this.height();
            width = this.width();
            height = this.height();
        }
        ctx.drawImage(this.canvasTransparency, 0, 0);
        if(this.repaint())
        {
            this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
            for(let i = 0; i < this.layers.length; i++)
            {
                if(this.layersState[i])
                {
                    const layer:DrawingScreen = this.layers[i];
                    layer.drawToContext(this.ctx, 0, 0, width, height);
                }
            }
        }
        {
            const zoomedWidth:number = width * this.zoom.zoomX;
            const zoomedHeight:number = height * this.zoom.zoomY;
            this.zoom.zoomedX = x  - this.zoom.offsetX + (width - zoomedWidth) / 2;
            this.zoom.zoomedY = y  - this.zoom.offsetY + (height - zoomedHeight) / 2;
            ctx.fillRect(0,0,this.zoom.zoomedX, height);
            ctx.fillRect(0,0,width, this.zoom.zoomedY);
            ctx.fillRect(this.zoom.zoomedX + zoomedWidth, 0, width, height);
            ctx.fillRect(0, this.zoom.zoomedY + zoomedHeight, width, height);
            ctx.drawImage(this.canvas, this.zoom.zoomedX, this.zoom.zoomedY, zoomedWidth, zoomedHeight);
            ctx.strokeStyle = "#000000";
            ctx.strokeRect(this.zoom.zoomedX, this.zoom.zoomedY, zoomedWidth, zoomedHeight)
        }
    }
};
class KeyListenerTypes {
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
class KeyboardHandler {
    keysHeld:any;
    listenerTypeMap:KeyListenerTypes;
    constructor()
    {
        this.keysHeld = {};
        this.listenerTypeMap = new KeyListenerTypes();
        document.addEventListener("keyup", e => this.keyUp(e));
        document.addEventListener("keydown", e => this.keyDown(e));
        document.addEventListener("keypressed", e => this.keyPressed(e));
    }
    registerCallBack(listenerType:string, predicate, callBack):void
    {
        this.listenerTypeMap[listenerType].push(new TouchHandler(predicate, callBack));
    }
    callHandler(type:string, event):void
    {
        const handlers = this.listenerTypeMap[type];
        handlers.forEach(handler => {
            if(handler.pred(event))
            {
                handler.callBack(event);
            }
        });
    }
    keyDown(event)
    {
        if(this.keysHeld[event.code] === undefined || this.keysHeld[event.code] === null)
            this.keysHeld[event.code] = 1;
        else
            this.keysHeld[event.code]++;
        event.keysHeld = this.keysHeld;
        this.callHandler("keydown", event);
    }
    keyUp(event)
    {
        this.keysHeld[event.code] = 0;
        event.keysHeld = this.keysHeld;
        this.callHandler("keyup", event);
    }
    keyPressed(event)
    {
        event.keysHeld = this.keysHeld;
        this.callHandler("keypressed", event);
    }
    
};
class TouchHandler {
    pred:(event) => void; 
    callBack:(event) => void;
    constructor(pred:(event) => void, callBack:(event) => void)
    {
        this.pred = pred;
        this.callBack = callBack;
    }
};
class ListenerTypes {
    touchstart:Array<TouchHandler>;
    touchmove:Array<TouchHandler>;
    touchend:Array<TouchHandler>;
    constructor()
    {
        this.touchstart = new Array<TouchHandler>();
        this.touchmove = new Array<TouchHandler>();
        this.touchend = new Array<TouchHandler>();
    }
};
interface TouchMoveEvent {

    deltaX:number;
    deltaY:number;
    mag:number;
    angle:number;
    avgVelocity:number;
    touchPos:number[];
    startTouchTime:number;
    eventTime:number;
    moveCount:number;

}
function isTouchSupported():boolean {
    return (('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0));
}
class MouseDownTracker {
    mouseDown:boolean;
    constructor()
    {
        const component = document;
        this.mouseDown = false;
        if(isTouchSupported())
        {
            component.addEventListener('touchstart', event => this.mouseDown = true, false);
            component.addEventListener('touchend', event => this.mouseDown = false, false);
        }
        if(!isTouchSupported()){
            component.addEventListener('mousedown', event => this.mouseDown = true );
            component.addEventListener('mouseup', event => this.mouseDown = false );
    
        }
    }
}
class SingleTouchListener
{
    lastTouchTime:number;
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
    listenerTypeMap:ListenerTypes;
    component:HTMLElement;
    touchMoveEvents:TouchMoveEvent[];
    translateEvent:(event:any, dx:number, dy:number) => void;
    constructor(component:HTMLElement, preventDefault:boolean, mouseEmulation:boolean)
    {
        this.lastTouchTime = Date.now();
        this.offset = [];
        this.translateEvent = (e:any, dx:number, dy:number) => e.touchPos = [e.touchPos[0] + dx, e.touchPos[1] + dy];
        this.startTouchPos = [0, 0];
        this.component = component;
        this.preventDefault = preventDefault;
        this.touchStart = null;
        this.registeredTouch = false;
        this.touchPos = [0,0];
        this.touchVelocity = 0;
        this.touchMoveCount = 0;
        this.deltaTouchPos = 0;
        this.listenerTypeMap = {
            touchstart:[],
            touchmove:[],
            touchend:[]
        };
        if(isTouchSupported())
        {
            component.addEventListener('touchstart', event => {this.touchStartHandler(event);}, false);
            component.addEventListener('touchmove', event => this.touchMoveHandler(event), false);
            component.addEventListener('touchend', event => this.touchEndHandler(event), false);
        }
        if(mouseEmulation && !isTouchSupported()){
            component.addEventListener('mousedown', event => {(<any>event).changedTouches = {};(<any>event).changedTouches.item = x => event; this.touchStartHandler(event)});
            component.addEventListener('mousemove', event => {(<any>event).changedTouches = {};(<any>event).changedTouches.item = x => event; this.touchMoveHandler(event)});
            component.addEventListener('mouseup', event => {(<any>event).changedTouches = {};(<any>event).changedTouches.item = x => event; this.touchEndHandler(event)});
    
        }
    }
    registerCallBack(listenerType:string, predicate, callBack):void
    {
        this.listenerTypeMap[listenerType].push(new TouchHandler(predicate, callBack));
    }
    callHandler(type:string, event):void
    {
        const handlers = this.listenerTypeMap[type];
        handlers.forEach(handler => {
            if(!event.defaultPrevented && handler.pred(event))
            {
                handler.callBack(event);
            }
        });
    }
    touchStartHandler(event:any):void
    {
        this.registeredTouch = true;
        this.moveCount = 0;
        event.timeSinceLastTouch = Date.now() - (this.lastTouchTime?this.lastTouchTime:0);
        this.lastTouchTime = Date.now();
        this.touchStart = event.changedTouches.item(0);
        this.touchPos = [this.touchStart["offsetX"],this.touchStart["offsetY"]];
        if(!this.touchPos[0]){
            this.touchPos = [this.touchStart["clientX"] - this.component.getBoundingClientRect().left, this.touchStart["clientY"] - this.component.getBoundingClientRect().top];
        }
        this.startTouchPos = [this.touchPos[0], this.touchPos[1]];
        event.touchPos = this.touchPos;
        event.translateEvent = this.translateEvent;
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
        if(this.registeredTouch !== SingleTouchListener.mouseDown.mouseDown){
            this.touchEndHandler(event);
        }
       if(!this.registeredTouch)
            return false;
        ++this.moveCount;
        let touchMove = event.changedTouches.item(0);
        for(let i = 0; i < event.changedTouches["length"]; i++)
        {
            console.log(this.touchStart.identifier, event.changedTouches.item(i).identifier)
            if(event.changedTouches.item(i).identifier == this.touchStart.identifier){
                touchMove = event.changedTouches.item(i);
            }
        }  
        
        if(touchMove)
        {
            if(!touchMove["offsetY"])
            {
                touchMove.offsetY = touchMove["clientY"] - this.component.getBoundingClientRect().top;
            }
            if(!touchMove["offsetX"])
            {
                touchMove.offsetX = touchMove["clientX"] - this.component.getBoundingClientRect().left;
            }
            const deltaY:number = touchMove["offsetY"]-this.touchPos[1];
            const deltaX:number = touchMove["offsetX"]-this.touchPos[0];
            this.touchPos[1] += deltaY;
            this.touchPos[0] += deltaX;
            const mag:number = this.mag([deltaX, deltaY]);
            this.touchMoveCount++;
            this.deltaTouchPos += Math.abs(mag);
            this.touchVelocity = 100*this.deltaTouchPos/(Date.now() - this.lastTouchTime); 
            const a:Array<number> = this.normalize([deltaX, deltaY]);
            const b:Array<number> = [1,0];
            const dotProduct:number = this.dotProduct(a, b);
            const angle:number = Math.acos(dotProduct)*(180/Math.PI)*(deltaY<0?1:-1);
            event.deltaX = deltaX;
            event.deltaY = deltaY;
            event.mag = mag;
            event.angle = angle;
            event.avgVelocity = this.touchVelocity;
            event.touchPos = this.touchPos;
            event.startTouchTime = this.lastTouchTime;
            event.eventTime = Date.now();
            event.moveCount = this.moveCount;
            event.translateEvent = this.translateEvent;
            this.touchMoveEvents.push(event);
            this.callHandler("touchmove", event);
        }
        return true;
    }
    touchEndHandler(event):void
    {
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
                const delay:number = Date.now()-this.lastTouchTime;// from start tap to finish
                this.touchVelocity = 100*mag/(Date.now()-this.lastTouchTime)

                event.deltaX = deltaX;
                event.deltaY = deltaY;
                event.mag = mag;
                event.angle = angle;
                event.avgVelocity = this.touchVelocity;
                event.touchPos = this.touchPos
                event.timeDelayFromStartToEnd = delay;
                event.startTouchTime = this.lastTouchTime;
                event.eventTime = Date.now();
                event.moveCount = this.moveCount;
                event.translateEvent = this.translateEvent;
                
                try 
                {
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
    mag(a):number
    {
        return Math.sqrt(a[0]*a[0]+a[1]*a[1]);
    }
    normalize(a):Array<number>
    {
        const magA = this.mag(a);
        a[0] /= magA;
        a[1] /= magA;
        return a;
    }
    dotProduct(a, b):number
    {
        return a[0]*b[0]+a[1]*b[1];
    }
};
class MultiTouchListenerTypes {
    pinchOut:Array<TouchHandler>;
    pinchIn:Array<TouchHandler>;
    constructor(){
        this.pinchIn = [];
        this.pinchOut = [];
    }
};
class MultiTouchListener {
    lastDistance:number;
    listenerTypeMap:MultiTouchListenerTypes;
    registeredMultiTouchEvent:boolean
    constructor(component:HTMLElement)
    {
        this.lastDistance = 0;
        this.listenerTypeMap = new MultiTouchListenerTypes();
        this.registeredMultiTouchEvent = false;
        if(isTouchSupported())
        {
            component.addEventListener('touchmove', event => this.touchMoveHandler(event), false);
            component.addEventListener('touchend', event => {this.registeredMultiTouchEvent = false; event.preventDefault()}, false);
        }
    }    
    registerCallBack(listenerType:string, predicate, callBack):void
    {
        this.listenerTypeMap[listenerType].push(new TouchHandler(predicate, callBack));
    }
    callHandler(type:string, event):void
    {
        const handlers = this.listenerTypeMap[type];
        handlers.forEach(handler => {
            if(!event.defaultPrevented && handler.pred(event))
            {
                handler.callBack(event);
            }
        });
    }
    touchMoveHandler(event):void
    {
        const touch1 = event.changedTouches.item(0);
        const touch2 = event.changedTouches.item(1);
        if(event.changedTouches.length > 1)
        {
            this.registeredMultiTouchEvent = true;
        }
        if(this.registeredMultiTouchEvent)
        {
            const newDist:number = Math.sqrt(Math.pow((touch1.clientX - touch2.clientX),2) || Math.pow(touch1.clientY - touch2.clientY, 2));
            if(this.lastDistance > newDist)
            {
                this.callHandler("pinchOut", event);
            }
            else
            {
                this.callHandler("pinchIn", event);
            }
            event.preventDefault();
            this.lastDistance = newDist;
        }
    }
};
class Pallette {
    highLightedCell:number;
    colors:Array<RGB>;
    canvas:any;
    listeners:SingleTouchListener;
    keyboardHandler:KeyboardHandler;
    ctx:any;
    repaint:boolean;

    constructor(canvas:any, keyboardHandler:KeyboardHandler, colorCount:number = 10, colors:Array<RGB> = null)
    {
        this.repaint = true;
        this.canvas = canvas;
        this.keyboardHandler = keyboardHandler;
        this.ctx = canvas.getContext("2d");
        this.highLightedCell = 0;
        this.listeners = new SingleTouchListener(canvas, true, true);
        this.colors = new Array<RGB>();
        const width = canvas.width / colorCount;
        const height = canvas.height;
        for(let i = 0; i < colorCount; i++)
        {
            const left = i / colorCount;
            const right = (i + 1) / colorCount;
            const top = 0;
            const bottom = 1;
            const depth = 0;
        }
        if(colors !== null)
        {
            colors.forEach(el => {
                this.colors.push(new RGB(el.red(), el.green(), el.blue(), el.alpha()));
            });

        }
        else
        {
            this.colors.push(new RGB(0, 0, 0, 255));
            this.colors.push(new RGB(255, 255, 255, 255));
            this.colors.push(new RGB(194, 49, 28, 255));
            this.colors.push(new RGB(224, 135, 19, 255));
            this.colors.push(new RGB(224, 220, 129, 255));
            this.colors.push(new RGB(220, 180, 19, 255));
            this.colors.push(new RGB(19, 220, 20, 255));
            this.colors.push(new RGB(23, 49, 198, 255));
            this.colors.push(new RGB(224, 49, 213, 255));
            this.colors.push(new RGB(24, 220, 229, 255));
        }
        this.listeners.registerCallBack("touchstart", e => true, e => {
            (<any>document.activeElement).blur();
            this.handleClick(e);
            this.repaint = true;
        });
        this.keyboardHandler.registerCallBack("keydown", e => true, e => this.repaint = true);
        this.keyboardHandler.registerCallBack("keyup", e => true, e => this.repaint = true);

    }
    calcColor(i:number = this.highLightedCell):RGB
    {
        const color = new RGB(this.colors[i].red(), this.colors[i].green(), this.colors[i].blue(), this.colors[i].alpha());
        const scale = 1.6;
        if(this.keyboardHandler.keysHeld["ShiftLeft"] || this.keyboardHandler.keysHeld["ShiftRight"])
        {
            color.setRed(Math.floor(color.red()*scale) < 256 ? Math.floor(color.red()*scale) : 255);
            color.setGreen(Math.floor(color.green()*scale) < 256 ? Math.floor(color.green()*scale) : 255);
            color.setBlue(Math.floor(color.blue()*scale) < 256 ? Math.floor(color.blue()*scale) : 255);
        }
        return color;
    }
    handleClick(event):void
    {
        this.highLightedCell = Math.floor((event.touchPos[0] / this.canvas.width) * this.colors.length);
    }
    setSelectedColor(color:string)
    {
        this.colors[this.highLightedCell].loadString(color);
    }
    cloneColor(color:RGB):RGB
    {
        const newc = new RGB(0,0,0,0);
        newc.copy(color);
        return newc;
    }
    draw():void
    {
        const ctx = this.ctx;
        if(this.repaint)
        for(let i = 0; i < this.colors.length; i++)
        {
            const width:number = (this.canvas.width/this.colors.length);
            const height:number = this.canvas.height;
            this.ctx.strokeStyle = "#000000";
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(i * width, 0, width, height);
            ctx.fillStyle = this.calcColor(i).htmlRBGA();
            ctx.fillRect(i * width, 0, width, height);
            ctx.strokeRect(i * width, 0, width, height);
            this.ctx.font = '16px Calibri';
            const visibleColor:RGB = (this.calcColor(i));

            ctx.strokeStyle = "#000000";

            this.ctx.strokeText((i+1)%10,i*width+width*0.5, height/3);

            visibleColor.setBlue(Math.floor(visibleColor.blue()/2));
            visibleColor.setRed(Math.floor(visibleColor.red()/2));
            visibleColor.setGreen(Math.floor(visibleColor.green()/2));
            visibleColor.setAlpha(255);
            this.ctx.fillStyle = visibleColor.htmlRBGA();
            this.ctx.fillText((i+1)%10, i*width+width*0.5, height/3);
       
            if(i === this.highLightedCell)
            {
                this.ctx.strokeStyle = "#000000";
                for(let j = 0; j < height; j += 5)
                    ctx.strokeRect(i * width + j, j, width - j*2, height - j*2);
            }
        }
    }
};
class Sprite {
    pixels:Uint8ClampedArray;
    image:HTMLImageElement;
    fillBackground:boolean;
    width:number;
    height:number;
    constructor(pixels:Array<RGB>, width:number, height:number, fillBackground:boolean = true)
    {
        this.fillBackground = fillBackground;
        this.copy(pixels, width, height);
    }
    copy(pixels:Array<RGB>, width:number, height:number):void
    {
        if(!this.pixels || this.pixels.length !== pixels.length){
            this.pixels = new Uint8ClampedArray(width * height * 4);
            this.width = width;
            this.height = height;

        }
        for(let i = 0; i < pixels.length; i++)
        {
            this.pixels[(i<<2)] = pixels[i].red();
            this.pixels[(i<<2)+1] = pixels[i].green();
            this.pixels[(i<<2)+2] = pixels[i].blue();
            this.pixels[(i<<2)+3] = pixels[i].alpha();
        }
        if(pixels.length)
            this.refreshImage();
    }
    putPixels(ctx:CanvasRenderingContext2D, idata:ImageData = ctx.getImageData(0, 0, this.width, this.height)):void
    {
        let i = 0;
        const pview:Uint32Array = new Uint32Array(this.pixels.buffer);
        const iview:Uint32Array = new Uint32Array(idata.data.buffer);
        const limit:number = this.pixels.length >> 2;
        const offsetLimit:number = limit - (32)
        for(; i < offsetLimit;)
            {
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                iview[i] = pview[i];
                ++i;
                
        }
        for(; i < limit;)
        {
            iview[i] = pview[i];
            ++i;
        }
        ctx.putImageData(idata, 0, 0);
    }
    fillRect(color:RGB, x:number, y:number, width:number, height:number)
    {
        const red:number = color.red();
        const green:number = color.green();
        const blue:number = color.blue();
        const alpha:number = color.alpha();
        for(let yi = y; yi < y+height; yi++)
        {
            for(let xi = x; xi < x+width; xi++)
            {
                let index:number = (xi<<2) + (yi*this.width<<2);
                this.pixels[index] = red;
                this.pixels[++index] = green;
                this.pixels[++index] = blue;
                this.pixels[++index] = alpha;
            }
        }
    }
    fillRectAlphaBlend(source:RGB, color:RGB, x:number, y:number, width:number, height:number)
    {
        for(let yi = y; yi < y+height; yi++)
        {
            for(let xi = x; xi < x+width; xi++)
            {
                let index:number = (xi<<2) + (yi*this.width<<2);
                source.color = (this.pixels[index] << 24) | (this.pixels[index+1] << 16) |
                    (this.pixels[index+2] << 8) | this.pixels[index+3];
                source.blendAlphaCopy(color);
                this.pixels[index] = source.red();
                this.pixels[++index] = source.green();
                this.pixels[++index] = source.blue();
                this.pixels[++index] = source.alpha();
            }
        }
    }
    copyToBuffer(buf:Array<RGB>)
    {
        for(let i = 0; i < buf.length; i++)
        {
            buf[i].setRed(this.pixels[(i<<2)]);
            buf[i].setGreen(this.pixels[(i<<2)+1]);
            buf[i].setBlue(this.pixels[(i<<2)+2]);
            buf[i].setAlpha(this.pixels[(i<<2)+3]);
        }
    }
    binaryFileSize():number
    {
        return 3 + this.width * this.height;
    }
    saveToUint32Buffer(buf:Uint32Array, index:number):number
    {
        buf[index++] = this.binaryFileSize();
        buf[index++] = 2;
        buf[index] |= this.height << 16; 
        buf[index++] |= this.width; 
        for(let i = 0; i < this.pixels.length; i += 4)
        {
            buf[index] ^= buf[index];
            buf[index] |= this.pixels[i] << 24;
            buf[index] |= this.pixels[i + 1] << 16;
            buf[index] |= this.pixels[i + 2] << 8;
            buf[index++] |= this.pixels[i + 3];
        }
        return ++index;
    }
    refreshImage():void 
    {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const idata = ctx.createImageData(this.width, this.height);
        idata.data.set(this.pixels);
        canvas.width = this.width;
        canvas.height = this.height;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.putImageData(idata, 0, 0);
    
        this.image = new Image();
        this.image.src = canvas.toDataURL();
    }
    copySprite(sprite:Sprite):void
    {
        if(this.pixels.length !== sprite.pixels.length)
            this.pixels = new Uint8ClampedArray(sprite.pixels.length);
        this.width = sprite.width;
        this.height = sprite.height;
        for(let i = 0; i < this.pixels.length;)
        {
            this.pixels[i] = sprite.pixels[i++];
            this.pixels[i] = sprite.pixels[i++];
            this.pixels[i] = sprite.pixels[i++];
            this.pixels[i] = sprite.pixels[i++];
        }
    }
    copySpriteBlendAlpha(sprite:Sprite):void
    {
        if(this.pixels.length !== sprite.pixels.length)
            this.pixels = new Uint8ClampedArray(sprite.pixels.length);
        this.width = sprite.width;
        this.height = sprite.height;
        const o:RGB = new RGB(0, 0, 0, 0);
        const t:RGB = new RGB(0, 0, 0, 0);

        for(let i = 0; i < this.pixels.length; i += 4)
        {
            o.setRed(sprite.pixels[i]);
            o.setGreen(sprite.pixels[i+1]);
            o.setBlue(sprite.pixels[i+2]);
            o.setAlpha(sprite.pixels[i+3]);
            t.setRed(this.pixels[i]);
            t.setGreen(this.pixels[i+1]);
            t.setBlue(this.pixels[i+2]);
            t.setAlpha(this.pixels[i+3]);
            t.blendAlphaCopy(o);
            this.pixels[i] = t.red();
            this.pixels[i+1] = t.green();
            this.pixels[i+2] = t.blue();
            this.pixels[i+3] = t.alpha();
        }
    }
    draw(ctx, x:number, y:number, width:number, height:number):void
    {
        if(this.pixels){ 
            if(this.fillBackground){
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(x, y, width, height);
            }
            ctx.drawImage(this.image, x, y, width, height);
        }
    }
};
class SpriteAnimation {
    sprites:Sprite[];
    x:number;
    y:number;
    width:number;
    height:number;
    animationIndex:number;

    constructor(x:number, y:number, width:number, height:number)
    {
        this.sprites = [];
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.animationIndex = 0;
    }
    pushSprite(sprite:Sprite):void
    {
        this.sprites.push(sprite);
    }
    binaryFileSize():number
    {
        let size:number = 2;
        this.sprites.forEach(sprite => size += sprite.binaryFileSize());
        return size;
    }
    toGifBlob(callBack:(blob:Blob) => void, fps:number = 30):void
    {
        const frameTime:number = 1000/fps;
        const gif = new GIF({
            workers: 2,
            quality: 10
          });
          // add an image element
          for(let i = 0; i < this.sprites.length; i++)
            gif.addFrame(this.sprites[i].image, {delay:Math.ceil(frameTime)});
          
          gif.on('finished', function(blob) {
            callBack(blob);
          });
          
          gif.render();
    }
    saveToUint32Buffer(buf:Uint32Array, index:number):number
    {
        buf[index++] = this.binaryFileSize();
        buf[index++] = 1;
        this.sprites.forEach(sprite => index += sprite.saveToUint32Buffer(buf, index));
        return index;
    }
    cloneAnimation():SpriteAnimation
    {
        
        const cloned:SpriteAnimation = new SpriteAnimation(0, 0, this.width, this.height);
        const original:SpriteAnimation = this;
        original.sprites.forEach(sprite => {
            const clonedSprite:Sprite = new Sprite([], sprite.width, sprite.height);
            clonedSprite.copySprite(sprite);
            clonedSprite.refreshImage();
            cloned.sprites.push(clonedSprite);
        });
        return cloned;
    }
    draw(ctx, x:number, y:number, width:number, height:number):void
    {
        if(this.sprites.length){
            ++this.animationIndex;
            this.sprites[this.animationIndex %= this.sprites.length].draw(ctx, x, y, width, height);
        }
        else{
            this.animationIndex = -1;
        }
    }
};
class SpriteSelector {
    canvas:HTMLCanvasElement;
    ctx:any;
    listener:SingleTouchListener;
    keyboardHandler:KeyboardHandler;
    selectedSprite:number;
    spriteHeight:number;
    spriteWidth:number;
    spritesPerRow:number;
    drawingField:LayeredDrawingScreen;
    animationGroup:AnimationGroup;
    spritesCount:number;
    dragSprite:Sprite;
    dragSpriteLocation:Array<number>;
    clickTime:number;
    constructor(canvas, drawingField:LayeredDrawingScreen, animationGroup:AnimationGroup, keyboardHandler:KeyboardHandler, spritesPerRow:number, width:number, height:number)
    {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.ctx.strokeStyle = "#000000";
        this.ctx.lineWidth = 2;
        this.dragSprite = null;
        this.keyboardHandler = keyboardHandler;
        this.dragSpriteLocation = [-1,-1];
        this.drawingField = drawingField;
        this.animationGroup = animationGroup;
        this.spritesPerRow = spritesPerRow;
        this.spriteWidth = canvas.width / spritesPerRow;
        this.spriteHeight = this.spriteWidth;
        this.selectedSprite = 0;
        canvas.height = this.spriteWidth;
        const listener = new SingleTouchListener(canvas, true, true);
        this.listener = listener;
        this.spritesCount = this.sprites()?this.sprites().length:0;
        listener.registerCallBack("touchstart", e => true, e => {

            (<any>document.activeElement).blur();
            const clickedSprite:number = Math.floor(e.touchPos[0]/canvas.width*this.spritesPerRow) + spritesPerRow*Math.floor(e.touchPos[1] / this.spriteHeight);
            
            
        });
        listener.registerCallBack("touchmove", e => true, e => {
            const clickedSprite:number = Math.floor(e.touchPos[0]/canvas.width*this.spritesPerRow) + spritesPerRow*Math.floor(e.touchPos[1] / this.spriteHeight);
            
            if(e.moveCount === 1 && this.sprites() && this.sprites()[clickedSprite] && this.sprites().length > 1)
            {
                if(this.keyboardHandler.keysHeld["AltLeft"] || this.keyboardHandler.keysHeld["AltRight"])
                {
                    const dragSprite = new Sprite([],1,1);
                    dragSprite.copySprite(this.sprites()[clickedSprite]);
                    dragSprite.refreshImage();
                    this.dragSprite = dragSprite;

                }
                else
                    this.dragSprite = this.sprites().splice(clickedSprite, 1)[0];
                this.dragSpriteLocation[0] = e.touchPos[0];
                this.dragSpriteLocation[1] = e.touchPos[1];
            }
            else if(e.moveCount > 1)
            {
                this.dragSpriteLocation[0] += e.deltaX;
                this.dragSpriteLocation[1] += e.deltaY;
            }
        });
        listener.registerCallBack("touchend", e => true, e => {
            const clickedSprite:number = Math.floor(e.touchPos[0]/canvas.width*this.spritesPerRow) + spritesPerRow*Math.floor(e.touchPos[1] / this.spriteHeight);
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            if(clickedSprite >= 0 && this.dragSprite !== null)
            {
                this.sprites().splice(clickedSprite, 0, this.dragSprite);
                this.spritesCount = this.sprites().length;
                this.dragSprite = null;
            }
            if(this.sprites() && this.sprites()[clickedSprite])
            {
                this.selectedSprite = clickedSprite;

                const sprite:Sprite = this.sprites()[clickedSprite];
                if(sprite.width !== this.drawingField.layer().spriteScreenBuf.width || sprite.height !== this.drawingField.layer().spriteScreenBuf.height)
                {
                    this.drawingField.setDimOnCurrent([sprite.width, sprite.height]);
                }
                this.drawingField.layer().loadSprite(sprite);
            }
            else if(this.sprites() && this.sprites().length > 1)
                this.selectedSprite = this.sprites().length - 1;
            else
                this.selectedSprite = 0;
        });
    }
    update()
    {
        if(this.sprites())
        {
            if((1+Math.floor(this.sprites().length / this.spritesPerRow) * this.spriteHeight) > this.canvas.height)
            {
                this.canvas.height = (1+Math.floor(this.sprites().length / this.spritesPerRow)) * this.spriteHeight;
            }
            if(this.spritesCount !== this.sprites().length)
            {
                this.spritesCount = this.sprites()?this.sprites().length:0;
                this.selectedSprite = this.spritesCount - 1;
                this.loadSprite();
            }
        }
    }
    draw()
    {
        if(this.sprites())
        {
            const position = this.canvas.getBoundingClientRect();
	        if(position.top < window.innerHeight && position.bottom >= 0) 
            {
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                const touchX:number = Math.floor(this.listener.touchPos[0] / this.canvas.width * this.spritesPerRow);
                const touchY:number = Math.floor(this.listener.touchPos[1] / this.canvas.height * Math.floor(this.canvas.height / this.spriteHeight));
                let setOffForDragSprite:number = 0;
                for(let i = 0; i < this.sprites().length; i++)
            {
                if(this.dragSprite && i === touchX + touchY * this.spritesPerRow)
                    setOffForDragSprite++;
                const x:number = (setOffForDragSprite % this.spritesPerRow) * this.spriteWidth;
                const y:number = Math.floor(setOffForDragSprite / this.spritesPerRow) * this.spriteHeight;
                this.sprites()[i].draw(this.ctx, x, y, this.spriteHeight, this.spriteWidth);
                setOffForDragSprite++;
                } 
                if(this.dragSprite)
            {
                this.dragSprite.draw(this.ctx, this.dragSpriteLocation[0] - this.spriteWidth*0.5, this.dragSpriteLocation[1] - this.spriteHeight * 0.5, this.spriteWidth, this.spriteHeight);
                this.ctx.strokeRect(this.dragSpriteLocation[0] - this.spriteWidth*0.5+2, this.dragSpriteLocation[1] - this.spriteHeight * 0.5 + 2, this.spriteWidth - 4, this.spriteHeight - 4);
                
                }
                else
                    this.ctx.strokeRect(this.selectedSprite % this.spritesPerRow * this.spriteWidth+2, Math.floor(this.selectedSprite / this.spritesPerRow) * this.spriteHeight + 2, this.spriteWidth - 4, this.spriteHeight - 4);
            }
        }
    }
    deleteSelectedSprite()
    {
        if(this.sprites().length > 1)
            this.sprites().splice(this.selectedSprite--, 1);
    }
    loadSprite()
    {
        if(this.selectedSpriteVal())
            this.selectedSpriteVal().copyToBuffer(this.drawingField.layer().screenBuffer);
    }
    pushSelectedToCanvas()
    {
        const spriteWidth:number = this.drawingField.layer().dimensions.first;
        const spriteHeight:number = this.drawingField.layer().dimensions.second;
        if(this.selectedSpriteVal())
        {
            this.selectedSpriteVal().copySprite(this.drawingField.toSprite());
            this.selectedSpriteVal().refreshImage();
        }
    }
    selectedSpriteVal():Sprite
    {
        if(this.sprites())
            return this.sprites()[this.selectedSprite];
        return null;
    }
    sprites():Array<Sprite>
    {
        if(this.animationGroup.animations[this.animationGroup.selectedAnimation] && this.animationGroup.animations[this.animationGroup.selectedAnimation].sprites)
            return this.animationGroup.animations[this.animationGroup.selectedAnimation].sprites;
        else if(this.animationGroup.animations.length && this.animationGroup.animations[0])
        {
            this.animationGroup.selectedAnimation = 0;
            return this.animationGroup.animations[0].sprites;
        }
        this.animationGroup.selectedAnimation = -1;
        return null;
        }
};
class AnimationGroup {
    drawingField:LayeredDrawingScreen;
    animations:SpriteAnimation[];
    animationDiv:any;
    animationSpritesDiv:any;
    animationCanvas:HTMLCanvasElement;
    selectedAnimation:number;
    spriteSelector:SpriteSelector;
    keyboardHandler:KeyboardHandler;
    animationsPerRow:number;
    animationWidth:number;
    animationHeight:number;
    dragSprite:SpriteAnimation;
    dragSpritePos:number[];
    listener:SingleTouchListener;
    constructor(drawingField:LayeredDrawingScreen, keyboardHandler:KeyboardHandler, animiationsID:string, animationsSpritesID:string, spritesPerRow:number = 10, spriteWidth:number = 64, spriteHeight:number = 64, animationWidth:number = 128, animationHeight:number = 128, animationsPerRow:number = 5)
    {
        this.drawingField = drawingField;
        this.keyboardHandler = keyboardHandler;
        this.animationDiv = document.getElementById(animiationsID);
        this.animations = new Array<SpriteAnimation>();
        this.animationCanvas = <HTMLCanvasElement> document.getElementById(animiationsID);
        this.selectedAnimation = 0;
        this.animationsPerRow = animationsPerRow;
        this.animationWidth = animationWidth;
        this.animationHeight = animationHeight;
        this.dragSpritePos = [0, 0];
        this.spriteSelector = new SpriteSelector(document.getElementById(animationsSpritesID), this.drawingField, this, keyboardHandler, spritesPerRow, spriteWidth, spriteHeight);
        this.dragSprite = null;
        const listener:SingleTouchListener = new SingleTouchListener(this.animationCanvas, false, true);
        this.listener = listener;
        listener.registerCallBack("touchstart", e => true, e => {
            (<any>document.activeElement).blur();
        });
        listener.registerCallBack("touchmove", e => true, e => {
            if(e.moveCount === 1 && this.animations.length > 1)
            { 
                const clickedSprite:number = Math.floor(e.touchPos[0] / spriteWidth) + Math.floor(e.touchPos[1] / spriteHeight) * animationsPerRow;
    
                this.dragSprite = this.animations.splice(clickedSprite, 1)[0];
                this.dragSpritePos[0] = e.touchPos[0] - this.animationWidth / 2;
                this.dragSpritePos[1] = e.touchPos[1] - this.animationWidth / 2;
            }
            else if(e.moveCount > 1)
            {
                this.dragSpritePos[0] += e.deltaX;
                this.dragSpritePos[1] += e.deltaY;
            }
        });
        listener.registerCallBack("touchend", e => true, e => {
            let clickedSprite:number = Math.floor(e.touchPos[0] / animationWidth) + Math.floor(e.touchPos[1] / animationHeight) * animationsPerRow;

            if(clickedSprite >= 0)
            {
                if(this.dragSprite !== null){
                    if(clickedSprite >= this.animations.length)
                        clickedSprite = this.animations.length?this.animations.length-1:0;
                    this.animations.splice(clickedSprite, 0, this.dragSprite);
                }

                this.dragSprite = null;
                this.dragSpritePos[0] = -1;
                this.dragSpritePos[1] = -1;
            }
            if(clickedSprite < this.animations.length && this.spriteSelector.sprites())
            {
                this.selectedAnimation = clickedSprite;
                if(this.spriteSelector.sprites().length)
                {
                    const sprite:Sprite = this.spriteSelector.sprites()[0];
                    if(sprite.width !== this.drawingField.layer().spriteScreenBuf.width || sprite.height !== this.drawingField.layer().spriteScreenBuf.height)
                    {
                        this.drawingField.setDimOnCurrent([sprite.width, sprite.height]);
                    }
                    sprite.copyToBuffer(this.drawingField.layer().screenBuffer);
                }
            }
        });
        this.autoResizeCanvas();
    }
    pushAnimation(animation:SpriteAnimation):void
    {
        this.animations.push(animation);
        //if this animation has no sprites in it 
        //then push the current buffer in the drawing screen as new sprite to animation
        if(animation.sprites.length  ===  0)
            this.pushDrawingScreenToAnimation(animation);
        //resize canvas if necessary
        this.autoResizeCanvas();
    }
    deleteAnimation(index:number):boolean
    {
        if(index >= 0 && index < this.animations.length)
        {
            this.animations.splice(index, 1);
            if(this.selectedAnimation >= this.animations.length)
                this.selectedAnimation--;
            
            //resize canvas if necessary
            this.autoResizeCanvas();
            return true;
        }
        return false;
    }
    cloneAnimation(index:number):SpriteAnimation
    {
        if(index >= 0 && index < this.animations.length)
        {
            const original:SpriteAnimation = this.animations[index];
            const cloned:SpriteAnimation = original.cloneAnimation();
            //resize canvas if necessary
            this.autoResizeCanvas();
            return cloned;
        }
        return null;
    }
    pushDrawingScreenToAnimation(animation:SpriteAnimation):void
    {
        const sprites:Array<Sprite> = animation.sprites;
        this.spriteSelector.spritesCount = sprites.length;
        this.spriteSelector.selectedSprite = sprites.length - 1;
        sprites.push(new Sprite(this.drawingField.layer().screenBuffer, this.drawingField.layer().dimensions.first, this.drawingField.layer().dimensions.second));
        this.spriteSelector.loadSprite();
    }
    pushSprite()
    {
        if(this.selectedAnimation >= this.animations.length)
        {
            this.pushAnimation(new SpriteAnimation(0,0,this.spriteSelector.spriteWidth,this.spriteSelector.spriteHeight));      
        }
        else
        { 
            const sprites:Sprite[] = this.animations[this.selectedAnimation].sprites;
            this.spriteSelector.selectedSprite = sprites.length - 1;
            const copy:Sprite = new Sprite([], 0, 0, false);
            copy.copySprite(this.drawingField.toSprite());
            copy.refreshImage();
            sprites.push(copy);
            this.spriteSelector.loadSprite();
        }
    }
    maxAnimationsOnCanvas():number
    {
        return Math.floor(this.animationCanvas.height / this.animationHeight) * this.animationsPerRow;
    }
    neededRowsInCanvas():number
    {
        return Math.floor(this.animations.length / this.animationsPerRow) + 1;
    }
    autoResizeCanvas()
    {
        this.animationCanvas.width = this.animationWidth * this.animationsPerRow;
        if(this.maxAnimationsOnCanvas() < this.animations.length)
        {
            this.animationCanvas.height += this.animationHeight;
        }
        else if(this.maxAnimationsOnCanvas() / this.animationsPerRow > this.neededRowsInCanvas())
        {
            this.animationCanvas.height = this.neededRowsInCanvas() * this.animationHeight;
        }
    }
    binaryFileSize():number
    {
        let size:number = 2;
        this.animations.forEach(animation => size += animation.binaryFileSize());
        return size;
    }
    buildFromBinary(binary:Uint32Array):AnimationGroup[]
    {
        let i = 0;
        const groupSize:number = binary[i];
        const color:RGB = new RGB(0, 0, 0, 0);
        const groups:AnimationGroup[] = [];
        while(i < binary.length)
        {
            if(i++ != 0)
                throw "Corrupted File, animation group project header corrupted";
            let j:number = 0;
            const animationSize:number = binary[i+2];
            groups.push(new AnimationGroup(this.drawingField, this.keyboardHandler, "test", "test", this.spriteSelector.spritesPerRow, this.spriteSelector.spriteWidth, this.spriteSelector.spriteHeight)
                );
            if(binary[i + 1] != 1)
                throw "Corrupted File, animation header corrupted";
            for(;j < groupSize; j += animationSize)
            {
                const animationSize:number = binary[i + j + 2];
                groups[groups.length - 1].animations.push(new SpriteAnimation(0, 0, this.spriteSelector.spriteWidth, this.spriteSelector.spriteHeight));
                const animations:SpriteAnimation[] = groups[groups.length - 1].animations;
                const sprites:Sprite[] = animations[animations.length - 1].sprites;
                let k = 0;
                const spriteSize:number = binary[i + j + 4];
                if(binary[i + j + 5] != 2)
                    throw "Corrupted sprite header file";
                for(; k < animationSize; k += spriteSize)
                {
                    const spriteSize:number = binary[i + j + k + 4];
                    const spriteWidth:number = binary[i + j + k + 5] & ((1<<16)-1);
                    const spriteHeight:number = binary[i + j + k + 5] >> 16;
                    let binaryPixelIndex:number = i + j + k + 7;
                    let l:number = 0;
                    const sprite:Sprite = new Sprite(undefined, spriteWidth, spriteHeight);
                    sprites.push(sprite);
                    for(; l < spriteSize; l++, binaryPixelIndex++)
                    {
                        color.color = binary[binaryPixelIndex];
                        const pixelIndex:number = (l<<2);
                        sprite.pixels[pixelIndex] = color.red();
                        sprite.pixels[pixelIndex + 1] = color.blue();
                        sprite.pixels[pixelIndex + 2] = color.green();
                        sprite.pixels[pixelIndex + 3] = color.alpha();
                    }
                }
            }
        }
        return groups;
    }
    toBinary():Uint32Array
    {
        const size:number = this.binaryFileSize();
        const buffer:Uint32Array = new Uint32Array(size);
        buffer[0] = size;
        buffer[1] = 0;
        let index:number = 0;
        this.animations.forEach(animation => index += animation.saveToUint32Buffer(buffer, index));
        return buffer;
    }
    selectedAnimationX():number
    {
        return (this.selectedAnimation % this.animationsPerRow) * this.animationWidth;
    }
    selectedAnimationY():number
    {
        return Math.floor(this.selectedAnimation / this.animationsPerRow) * this.animationHeight;
    }
    chosenAnimation():SpriteAnimation
    {
        return this.animations[this.selectedAnimation];
    }
    drawAnimation(ctx:CanvasRenderingContext2D, animationIndex:number, spriteIndex:number, x:number, y:number, width:number, height:number):void
    {
        if(this.animations[animationIndex] && spriteIndex < this.animations[animationIndex].sprites.length)
        {
            this.animations[animationIndex].sprites[spriteIndex].draw(ctx, x, y, width, height);
        }
    }
    draw():void
    {

        const position = this.animationCanvas.getBoundingClientRect();

        if(this.animations.length)
        {
            this.spriteSelector.update();
            this.spriteSelector.draw();
        }
        if(position.top < window.innerHeight && position.bottom >= 0) 
        {
            const ctx:CanvasRenderingContext2D = this.animationCanvas.getContext("2d");
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, this.animationCanvas.width, this.animationCanvas.height);
            let dragSpriteAdjustment:number = 0;
            const touchX:number = Math.floor(this.listener.touchPos[0] / this.animationCanvas.width * this.animationsPerRow);
            const touchY:number = Math.floor((this.listener.touchPos[1]) / this.animationCanvas.height * Math.floor(this.animationCanvas.height / this.animationHeight));
            
            let x:number = (dragSpriteAdjustment) % this.animationsPerRow;
            let y:number = Math.floor((dragSpriteAdjustment) / this.animationsPerRow);
            for(let i = 0; i < this.animations.length; i++)
            {
                x = (dragSpriteAdjustment) % this.animationsPerRow;
                y = Math.floor((dragSpriteAdjustment) / this.animationsPerRow);
                if(this.dragSprite && x === touchX && y === touchY)
            {
                dragSpriteAdjustment++;
                x = (dragSpriteAdjustment) % this.animationsPerRow;
                y = Math.floor((dragSpriteAdjustment) / this.animationsPerRow);
                }
                if(this.animations[i])
                    this.animations[i].draw(ctx, x*this.animationWidth, y*this.animationHeight, this.animationWidth, this.animationHeight);
                dragSpriteAdjustment++;
            }
            if(this.animations.length){
                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 3;
                ctx.strokeRect(1 + this.selectedAnimationX(), 1 + this.selectedAnimationY(), this.animationWidth - 2, this.animationHeight - 2);
            }
            if(this.dragSprite)
                this.dragSprite.draw(ctx, this.dragSpritePos[0], this.dragSpritePos[1], this.animationWidth, this.animationHeight);
        }
    }
};
class AnimationGroupsSelector {
    selectedAnimationGroup:number;
    //group, then index of current sprite, and animation to draw in each group
    animationGroups:Pair<AnimationGroup, Pair<number> >[];
    dragAnimationGroup:Pair<AnimationGroup, Pair<number> >;
    dragAnimationGroupPos:number[];
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    keyboardHandler:KeyboardHandler;
    listener:SingleTouchListener;
    field:LayeredDrawingScreen;

    animationsCanvasId:string;
    spritesCanvasId:string;

    renderWidth:number;
    renderHeight:number;
    spriteWidth:number;
    spriteHeight:number;
    spritesPerRow:number;

    constructor(field:LayeredDrawingScreen, keyboardHandler:KeyboardHandler,animationGroupSelectorId:string, animationsCanvasId:string, spritesCanvasId:string, spriteWidth:number, spriteHeight:number, renderWidth:number, renderHeight:number, spritesPerRow:number = 5)
    {
        this.animationGroups = [];
        this.field = field;
        this.dragAnimationGroup = null;
        this.dragAnimationGroupPos = [0, 0];
        this.spritesPerRow = spritesPerRow;
        this.renderWidth = renderWidth;
        this.renderHeight = renderHeight;
        this.canvas = <HTMLCanvasElement> document.getElementById(animationGroupSelectorId);
        this.canvas.height = renderHeight;
        this.canvas.width = renderWidth * spritesPerRow;
        this.ctx = this.canvas.getContext("2d");
        this.animationsCanvasId = animationsCanvasId;
        this.spritesCanvasId = spritesCanvasId;
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.keyboardHandler = keyboardHandler;
        this.listener = new SingleTouchListener(this.canvas, true, true);
        this.listener.registerCallBack("touchstart", e => true, e => {
            (<any>document.activeElement).blur();
        });
        this.listener.registerCallBack("touchmove", e => true, e => {
            const clickedIndex:number = Math.floor(e.touchPos[0] / this.renderWidth) + Math.floor(e.touchPos[1] / this.renderHeight);
            if(e.moveCount === 1 && this.animationGroups.length > 1)
            {
                this.dragAnimationGroup = this.animationGroups.splice(clickedIndex, 1)[0];
                if(this.selectedAnimationGroup > 0 && this.selectedAnimationGroup >= this.animationGroups.length)
                {
                    this.selectedAnimationGroup--;
                }
            }
            else if(e.moveCount > 1)
            {
                this.dragAnimationGroupPos[0] += e.deltaX;
                this.dragAnimationGroupPos[1] += e.deltaY;
            }
        });
        this.listener.registerCallBack("touchend", e => true, e => {
            const clickedIndex:number = Math.floor(e.touchPos[0] / this.renderWidth) + Math.floor(e.touchPos[1] / this.renderHeight);
            
            if(clickedIndex >= 0 && clickedIndex  <=  this.animationGroups.length)
            {
                if(this.dragAnimationGroup)
                {
                    this.animationGroups.splice(clickedIndex, 0, this.dragAnimationGroup);
                    this.dragAnimationGroup = null;
                    this.dragAnimationGroupPos[0] = -1;
                    this.dragAnimationGroupPos[1] = -1;
                }
                if(clickedIndex < this.animationGroups.length)
                    this.selectedAnimationGroup = clickedIndex;
            }
        });
    }  
    maxAnimationsOnCanvas():number
    {
        return Math.floor(this.canvas.height / this.renderHeight) * this.spritesPerRow;
    }
    neededRowsInCanvas():number
    {
        return Math.floor(this.animationGroups.length / this.spritesPerRow) + 1;
    }  
    binaryFileSize():number {
        let size:number = 2;
        this.animationGroups.forEach(el =>
            size += el.first.binaryFileSize()
            );
        return size;
    }
    buildFromBinary(binary:Uint32Array):void
    {
        const groups:AnimationGroup[] = this.animationGroup().buildFromBinary(binary);
        this.animationGroups = [];
        this.selectedAnimationGroup = 0;
        groups.forEach(el => {
            this.animationGroups.push(new Pair(el, new Pair(0,0)));
        })
    }
    save():void {
        var a = document.createElement("a");
        a.href = window.URL.createObjectURL(new Blob([this.animationGroup().toBinary()], {type: "application/octet-stream"}));
        a.download = "demo.txt";
        a.click();
    }
    autoResizeCanvas()
    {
        if(this.animationGroup())
        {
            this.canvas.width = this.renderWidth * this.spritesPerRow;
            if(this.maxAnimationsOnCanvas() / this.spritesPerRow > this.neededRowsInCanvas() || this.maxAnimationsOnCanvas() / this.spritesPerRow < this.neededRowsInCanvas())
            {
                this.canvas.height = this.neededRowsInCanvas() * this.renderHeight;
            }
        }
    }
    createAnimationGroup()
    {
        this.animationGroups.push(new Pair(new AnimationGroup(this.field, this.keyboardHandler, this.animationsCanvasId, this.spritesCanvasId, 5, this.spriteWidth, this.spriteHeight), new Pair(0,0)));
        this.animationGroups[this.animationGroups.length-1].first.pushAnimation(new SpriteAnimation(0, 0, dim[0], dim[1]));
        this.autoResizeCanvas();
    }
    animationGroup():AnimationGroup
    {
        if(this.selectedAnimationGroup >= 0 && this.selectedAnimationGroup < this.animationGroups.length)
        {
            return this.animationGroups[this.selectedAnimationGroup].first;
        }
        return null;
    }
    pushAnimationToSelected(animation:SpriteAnimation):void
    {
        this.animationGroup().pushAnimation(animation);
    }
    inSelectedAnimationBounds(animationIndex:number):boolean
    {
        return (animationIndex >= 0 && animationIndex < this.animationGroup().animations.length)
    }
    cloneAnimationFromSelected(animationIndex:number):void
    {
        this.animationGroup().cloneAnimation(animationIndex);
    }
    cloneSelectedAnimationGroup():void
    {
        this.animationGroups.push(new Pair(new AnimationGroup(this.field, this.keyboardHandler, this.animationsCanvasId, this.spritesCanvasId, 5, this.spriteWidth, this.spriteHeight), new Pair(0,0)));
        const animationGroup:AnimationGroup = this.animationGroups[this.animationGroups.length - 1].first;
        this.animationGroup().animations.forEach(animation => {
            animationGroup.pushAnimation(animation.cloneAnimation());
        });
        this.autoResizeCanvas();
    }
    deleteAnimationFromSelected(animationIndex:number):void
    {
        this.animationGroup().deleteAnimation(animationIndex);
    }
    pushSpriteToSelected():void
    {
        this.animationGroup().pushSprite();
    }
    pushSelectedSpriteToCanvas():void
    {
        this.animationGroup().spriteSelector.pushSelectedToCanvas();
    }
    deleteSelectedSprite():void
    {
        this.animationGroup().spriteSelector.deleteSelectedSprite();
    }
    deleteSelectedAnimationGroup():void
    {
        this.animationGroups.splice(this.selectedAnimationGroup, 1);
        if(this.selectedAnimationGroup >= this.animationGroups.length)
        {
            this.selectedAnimationGroup--;
        }
        this.autoResizeCanvas();
    }
    selectedAnimation():SpriteAnimation
    {
        return this.animationGroup().animations[this.animationGroup().selectedAnimation];
    }
    drawIndex(ctx:CanvasRenderingContext2D,animationGroupIndex:number, encodedLocation:number):void
    {
        const group:AnimationGroup = this.animationGroups[animationGroupIndex].first;
        let animationIndex:number = this.animationGroups[animationGroupIndex].second.first;
        if(group)
        {
            let spriteIndex:number = this.animationGroups[animationGroupIndex].second.second;
            spriteIndex++;
            
            if(group.animations[animationIndex] && group.animations[animationIndex].sprites.length <= spriteIndex)
            {
                animationIndex++;
                spriteIndex = 0;
                if(animationIndex >= group.animations.length){
                    animationIndex = 0;
                }
            }
            else if(!group.animations[animationIndex])
            {
                spriteIndex = 0;
                animationIndex = 0;
            }
            this.animationGroups[animationGroupIndex].second.first = animationIndex;
            this.animationGroups[animationGroupIndex].second.second = spriteIndex;
            const x:number = encodedLocation % this.spritesPerRow;
            const y:number = Math.floor(encodedLocation / this.spritesPerRow);
            group.drawAnimation(ctx, animationIndex, spriteIndex, x*this.renderWidth, y*this.renderHeight, this.renderWidth, this.renderHeight);
        }
    }
    draw():void
    {
        if(this.animationGroup())
        {
            this.animationGroup().draw();
        }
        const position:DOMRect = this.canvas.getBoundingClientRect();
        if(position.top < window.innerHeight && position.bottom >= 0) 
        {
            const ctx:CanvasRenderingContext2D = this.ctx;
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            const clickedIndex:number = Math.floor(this.listener.touchPos[0] / this.renderWidth) + Math.floor(this.listener.touchPos[1] / this.renderHeight);
            let offSetI = 0;
            for(let i = 0; i < this.animationGroups.length; i++, offSetI++)
        {
            if(i === clickedIndex && this.dragAnimationGroup)
                offSetI++;
            if(this.animationGroup())
                this.drawIndex(ctx, i, offSetI);
            }
            if(this.dragAnimationGroup)
        {
            let spriteIndex:number = this.dragAnimationGroup.second.second++;
            let animationIndex:number = this.dragAnimationGroup.second.first;
            const group = this.dragAnimationGroup.first;
            if(group.animations[animationIndex].sprites.length === spriteIndex)
            {
                animationIndex++;
                spriteIndex = 0;
            }
            if(group.animations.length === animationIndex)
                animationIndex = 0;
            
            this.dragAnimationGroup.second.first = animationIndex;
            this.dragAnimationGroup.second.second = spriteIndex;
            this.dragAnimationGroup.first.drawAnimation(ctx, animationIndex, spriteIndex, this.listener.touchPos[0] - this.renderWidth/2, this.listener.touchPos[1] - this.renderHeight/2, this.renderWidth, this.renderHeight)
            }
            if(this.animationGroup())
        {
            const x:number = this.selectedAnimationGroup % this.spritesPerRow;
            const y:number = Math.floor(this.selectedAnimationGroup / this.spritesPerRow);
            
            ctx.strokeStyle = "#000000";
            ctx.strokeRect(x * this.renderWidth + 1, y * this.renderHeight + 1, this.renderWidth - 2, this.renderHeight - 2);
            }
        }
    }
    
};
async function fetchImage(url:string):Promise<HTMLImageElement>
{
    const img = new Image();
    img.src =  URL.createObjectURL(await (await fetch(url)).blob());
    return img;
}
function logToServer(data):void
{
    fetch("/data", {
        method: "POST", 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      }).then(res => {console.log("Request complete! response:", data);});

}
function saveBlob(blob:Blob, fileName:string){
    const a:HTMLAnchorElement = document.createElement("a");
    a.href = window.URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
}
async function main()
{
    const canvas:HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("screen");
    let field:LayeredDrawingScreen;
    /*const multiTouchHandler:MultiTouchListener =  new MultiTouchListener(canvas);
    multiTouchHandler.registerCallBack("pinchIn", e => true, e => {
        field.zoom.zoom += 0.1;
        const text:string = (Math.round(field.zoom.zoom*100) / 100).toString()
        toolSelector.transformTool.textBoxZoom.setText(text);
    });
    multiTouchHandler.registerCallBack("pinchOut", e => true, e => {
        if(field.zoom.zoom > 0.1)
            field.zoom.zoom -= 0.1;
        const text:string = (Math.round(field.zoom.zoom*100) / 100).toString()
        toolSelector.transformTool.textBoxZoom.setText(text);
    });*/
    const keyboardHandler:KeyboardHandler = new KeyboardHandler();
    const pallette:Pallette = new Pallette(document.getElementById("pallette_screen"), keyboardHandler);
    const ctx:CanvasRenderingContext2D = canvas.getContext("2d");
    const canvasListener:SingleTouchListener = new SingleTouchListener(canvas, true, true);
    const toolSelector:ToolSelector = new ToolSelector(pallette, keyboardHandler, canvasListener, 50, 50);
    field = toolSelector.field;
    field.toolSelector = toolSelector;
    //const field:DrawingScreen = new DrawingScreen(<HTMLCanvasElement> , keyboardHandler, pallette,[0,0], dim);
    const animationGroupSelector:AnimationGroupsSelector = new AnimationGroupsSelector(field, keyboardHandler, "animation_group_selector", "animations", "sprites_canvas", dim[0], dim[1], 128, 128);
    animationGroupSelector.createAnimationGroup();
    animationGroupSelector.selectedAnimationGroup = 0;
    const add_animationGroup_button = document.getElementById("add_animationGroup");
    const add_animationGroup_buttonListener:SingleTouchListener = new SingleTouchListener(add_animationGroup_button, false, true);
    add_animationGroup_buttonListener.registerCallBack("touchstart", e => true, e => {
        animationGroupSelector.createAnimationGroup();
    });
    const delete_animationGroup_button = document.getElementById("delete_animationGroup");
    const delete_animationGroup_buttonListener:SingleTouchListener = new SingleTouchListener(delete_animationGroup_button, false, true);
    delete_animationGroup_buttonListener.registerCallBack("touchstart", e => true, e => {
        animationGroupSelector.deleteSelectedAnimationGroup();
    });
    const clone_animationGroup_button = document.getElementById("clone_animationGroup");
    const clone_animationGroup_buttonListener:SingleTouchListener = new SingleTouchListener(clone_animationGroup_button, false, true);
    clone_animationGroup_buttonListener.registerCallBack("touchstart", e => true, e => {
        animationGroupSelector.cloneSelectedAnimationGroup();
    });

    pallette.canvas.addEventListener("mouseup", e => { field.layer().state.color = pallette.calcColor(); 
        field.layer().toolSelector.colorPickerTool.tbColor.setText(pallette.calcColor().htmlRBGA()); 
    });
    pallette.listeners.registerCallBack("touchend", e => true,  e => { field.layer().state.color = pallette.calcColor(); })
    
    const add_animationButton = document.getElementById("add_animation");
    const add_animationTouchListener:SingleTouchListener = new SingleTouchListener(add_animationButton, false, true);
    add_animationTouchListener.registerCallBack("touchstart", e => true, e => {
        animationGroupSelector.animationGroup().pushAnimation(new SpriteAnimation(0, 0, dim[0], dim[1]));
    });
    const clone_animationButton = document.getElementById("clone_animation");
    const clone_animationTouchListener:SingleTouchListener = new SingleTouchListener(clone_animationButton, false, true);
    clone_animationTouchListener.registerCallBack("touchstart", e => true, e => {
        animationGroupSelector.animationGroup().pushAnimation(animationGroupSelector.animationGroup().cloneAnimation(animationGroupSelector.animationGroup().selectedAnimation));
    });
    const delete_animationButton = document.getElementById("delete_animation");
    const delete_animationTouchListener:SingleTouchListener = new SingleTouchListener(delete_animationButton, false, true);
    delete_animationTouchListener.registerCallBack("touchstart", e => true, e => {
        animationGroupSelector.animationGroup().deleteAnimation(animationGroupSelector.animationGroup().selectedAnimation);
    });

    const add_spriteButton = document.getElementById("add_sprite");
    const add_spriteButtonTouchListener:SingleTouchListener = new SingleTouchListener(add_spriteButton, false, true);
    add_spriteButtonTouchListener.registerCallBack("touchstart", e => true, e => {
        animationGroupSelector.animationGroup().pushSprite();
    });

    const save_spriteButton = document.getElementById("save_sprite");
    const save_spriteButtonTouchListener:SingleTouchListener = new SingleTouchListener(save_spriteButton, false, true);
    save_spriteButtonTouchListener.registerCallBack("touchstart", e => true, e => {
        animationGroupSelector.animationGroup().spriteSelector.pushSelectedToCanvas();
    });
    const delete_spriteButton = document.getElementById("delete_sprite");
    const delete_spriteButtonTouchListener:SingleTouchListener = new SingleTouchListener(delete_spriteButton, false, true);
    delete_spriteButtonTouchListener.registerCallBack("touchstart", e => true, e => {
        animationGroupSelector.animationGroup().spriteSelector.deleteSelectedSprite();
    });
    const save_local_drawing_screenButton = document.getElementById("save_local_drawing_screen");
    if(save_local_drawing_screenButton)
    {
        save_local_drawing_screenButton.addEventListener("mousedown", e => {field.saveToFile((<HTMLInputElement>document.getElementById("screen_sprite_file_name")).value);
            });
    }
    const saveAnimation = document.getElementById("save_local_selected_animation");

    if(saveAnimation)
    {
        saveAnimation.addEventListener("mousedown", e => {
        animationGroupSelector.selectedAnimation().toGifBlob(blob => {
            saveBlob(blob, (<HTMLInputElement>document.getElementById("animation_file_name")).value);
        });
        });
    }
    keyboardHandler.registerCallBack("keydown", e=> true, e => {
        field.layer().state.color.copy(pallette.calcColor());
        if((document.getElementById('body') === document.activeElement || document.getElementById('screen') === document.activeElement)){
            if(e.code.substring(0,"Digit".length) === "Digit")
            {
                const numTyped:string = e.code.substring("Digit".length, e.code.length);
                pallette.highLightedCell = (parseInt(numTyped) + 9) % 10;
            }
        }
    });
    keyboardHandler.registerCallBack("keyup", e => true, e => {
        field.layer().state.color.copy(pallette.calcColor());
    });
    interface FilesHaver{
        files:FileList;
    };
    const fileSelector = document.getElementById('file-selector');
    fileSelector.addEventListener('change', (event) => {
      const fileList:FileList = (<FilesHaver> <Object> event.target).files;
      const reader = new FileReader();
      reader.readAsDataURL(fileList[0]);
      reader.onload = (() =>
        {
            const img = new Image();
            img.onload = () => {
                toolSelector.layersTool.pushList(`layer${toolSelector.layersTool.runningId++}`)
                field.loadImageToLayer(img);
                toolSelector.settingsTool.dim = [img.width, img.height];
                toolSelector.settingsTool.tbX.setText(img.width.toString());
                toolSelector.settingsTool.tbY.setText(img.height.toString());
            };
            img.src = <string> reader.result;
        });
    });
    canvas.addEventListener("wheel", (e) => {
        e.preventDefault();
        let delta:number = 0.1;
        if(SingleTouchListener.mouseDown.mouseDown || keyboardHandler.keysHeld["AltRight"] || keyboardHandler.keysHeld["AltLeft"])
        {
            field.zoom.offsetX += e.deltaX;
            field.zoom.offsetY += e.deltaY;
            toolSelector.drawingScreenListener.registeredTouch = false;
        }
        else
        {
            if(field.zoom.zoomX < 1.05)
            {
                delta = 0.01;
            }
            else if(field.zoom.zoomX < 3)
            {
                delta = 0.05;
            }
            else if(field.zoom.zoomX > 8 && field.zoom.zoomX < 25)
                delta = 0.2;
            else if(field.zoom.zoomX >= 25 && e.deltaY < 0)
                delta = 0;
    
            if(e.deltaY < 0){
                field.zoom.zoomY += delta * (field.zoom.zoomY / field.zoom.zoomX);
                field.zoom.zoomX += delta;
            }
            else if(field.zoom.zoomX > 0.10){
                field.zoom.zoomY -= delta * (field.zoom.zoomY / field.zoom.zoomX);
                field.zoom.zoomX -= delta;
            }
            const text:string = (Math.round(field.zoom.zoomX*100) / 100).toString()
            toolSelector.transformTool.textBoxZoom.setText(text);
            const touchPos:number[] = [field.zoom.invZoomX(toolSelector.drawingScreenListener.touchPos[0]), 
                field.zoom.invZoomY(toolSelector.drawingScreenListener.touchPos[1])];
            const centerX:number = (field.width() / 2);
            const centerY:number = (field.height() / 2);
            const deltaX:number = delta*(touchPos[0] - centerX) ;
            const deltaY:number = delta*(touchPos[1]  - centerY);            
            if(e.deltaY < 0)
            {
                field.zoom.offsetX += deltaX;
                field.zoom.offsetY += deltaY;
            }
            else
            {
                field.zoom.offsetX -= deltaX;
                field.zoom.offsetY -= deltaY;
            }
        }
    });
    const fps = 35;
    const goalSleep = 1000/fps;
    let counter = 0;

    while(true)
    {
        const start:number = Date.now();
        toolSelector.draw();
        //if(field.repaint())
        {
            field.draw(canvas, ctx, 0, 0, canvas.width, canvas.height);
        }
        if(animationGroupSelector.animationGroup())
            animationGroupSelector.draw();
        if(counter++ % 3 === 0)
        {
            pallette.draw();
        }
        const adjustment:number = Date.now() - start <= 30 ? Date.now() - start : 30;
        await sleep(goalSleep - adjustment);
        if(1000/(Date.now() - start) < fps - 5){
            console.log("avgfps:",Math.floor(1000/(Date.now() - start)))
            if(1000/(Date.now() - start) < 1)
                console.log("frame time:",1000/(Date.now() - start));
        }
    }
}
main();