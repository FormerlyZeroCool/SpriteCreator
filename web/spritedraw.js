"use strict";
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function changeFavicon(src) {
    let link = document.createElement('link'), oldLink = document.getElementById('dynamic-favicon');
    link.id = 'dynamic-favicon';
    link.rel = 'shortcut icon';
    link.href = src;
    if (oldLink) {
        document.head.removeChild(oldLink);
    }
    document.head.appendChild(link);
}
fetchImage('/web/images/favicon.ico').then((value) => changeFavicon('/web/images/favicon.ico'));
fetchImage('images/favicon.ico').then((value) => changeFavicon('images/favicon.ico'));
const dim = [128, 128];
;
function threeByThreeMat(a, b) {
    return [a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
        a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
        a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
        a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
        a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
        a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
        a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
        a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
        a[6] * b[2] + a[7] * b[5] + a[8] * b[8]];
}
function matByVec(mat, vec) {
    return [mat[0] * vec[0] + mat[1] * vec[1] + mat[2] * vec[2],
        mat[3] * vec[0] + mat[4] * vec[1] + mat[5] * vec[2],
        mat[6] * vec[0] + mat[7] * vec[1] + mat[8] * vec[2]];
}
class Queue {
    constructor() {
        this.data = [];
        this.data.length = 64;
        this.start = 0;
        this.end = 0;
        this.length = 0;
    }
    push(val) {
        if (this.length === this.data.length) {
            const newData = [];
            newData.length = this.data.length * 2;
            for (let i = 0; i < this.data.length; i++) {
                newData[i] = this.data[(i + this.start) % this.data.length];
            }
            this.start = 0;
            this.end = this.data.length;
            this.data = newData;
            this.data[this.end++] = val;
            this.length++;
        }
        else {
            this.data[this.end++] = val;
            this.end &= this.data.length - 1;
            this.length++;
        }
    }
    pop() {
        if (this.length) {
            const val = this.data[this.start];
            this.start++;
            this.start &= this.data.length - 1;
            this.length--;
            return val;
        }
        throw new Error("No more values in the queue");
    }
    get(index) {
        if (index < this.length) {
            return this.data[(index + this.start) & (this.data.length - 1)];
        }
        throw new Error(`Could not get value at index ${index}`);
    }
    set(index, obj) {
        if (index < this.length) {
            this.data[(index + this.start) & (this.data.length - 1)] = obj;
        }
        throw new Error(`Could not set value at index ${index}`);
    }
}
;
class FixedSizeQueue {
    constructor(size) {
        this.data = [];
        this.data.length = size;
        this.start = 0;
        this.end = 0;
        this.length = 0;
    }
    push(val) {
        if (this.length === this.data.length) {
            this.start++;
            this.data[this.end++] = val;
            this.start &= this.data.length - 1;
            this.end &= this.data.length - 1;
        }
        else {
            this.data[this.end++] = val;
            this.end &= this.data.length - 1;
            this.length++;
        }
    }
    pop() {
        if (this.length) {
            const val = this.data[this.start];
            this.start++;
            this.start &= this.data.length - 1;
            this.length--;
            return val;
        }
        throw new Error("No more values in the queue");
    }
    get(index) {
        if (index < this.length) {
            return this.data[(index + this.start) & (this.data.length - 1)];
        }
        throw new Error(`Could not get value at index ${index}`);
    }
    set(index, obj) {
        if (index < this.length) {
            this.data[(index + this.start) & (this.data.length - 1)] = obj;
        }
        throw new Error(`Could not set value at index ${index}`);
    }
}
;
class RollingStack {
    constructor(size = 75) {
        this.data = [];
        this.start = 0;
        this.end = 0;
        this.reserve = size;
        this.size = 0;
        for (let i = 0; i < size; i++)
            this.data.push();
    }
    empty() {
        this.start = 0;
        this.end = 0;
        this.size = 0;
    }
    length() {
        return this.size;
    }
    pop() {
        if (this.size) {
            this.size--;
            this.end--;
            if (this.end < 0)
                this.end = this.reserve - 1;
            return this.data[this.end];
        }
        return null;
    }
    push(val) {
        if (this.size >= this.reserve) {
            this.start++;
            this.start %= this.reserve;
            this.size--;
        }
        this.size++;
        this.data[this.end++] = val;
        this.end %= this.reserve;
    }
    set(index, obj) {
        this.data[(this.start + index) % this.reserve] = obj;
    }
    get(index) {
        return this.data[(this.start + index) % this.reserve];
    }
}
;
function blendAlphaCopy(color0, color) {
    const alphant = color0.alphaNormal();
    const alphanc = color.alphaNormal();
    const a = (1 - alphanc);
    const a0 = (alphanc + alphant * a);
    const a1 = 1 / a0;
    color0.color = (((alphanc * color.red() + alphant * color0.red() * a) * a1)) |
        (((alphanc * color.green() + alphant * color0.green() * a) * a1) << 8) |
        (((alphanc * color.blue() + alphant * color0.blue() * a) * a1) << 16) |
        ((a0 * 255) << 24);
    /*this.setRed  ((alphanc*color.red() +   alphant*this.red() * a ) *a1);
    this.setBlue ((alphanc*color.blue() +  alphant*this.blue() * a) *a1);
    this.setGreen((alphanc*color.green() + alphant*this.green() * a)*a1);
    this.setAlpha(a0*255);*/
}
class RGB {
    constructor(r = 0, g = 0, b, a = 0) {
        this.color = 0;
        this.color = a << 24 | b << 16 | g << 8 | r;
    }
    blendAlphaCopy(color) {
        blendAlphaCopy(this, color);
        /*this.setRed  ((alphanc*color.red() +   alphant*this.red() * a ) *a1);
        this.setBlue ((alphanc*color.blue() +  alphant*this.blue() * a) *a1);
        this.setGreen((alphanc*color.green() + alphant*this.green() * a)*a1);
        this.setAlpha(a0*255);*/
    }
    toHSL() {
        const normRed = this.red() / 255;
        const normGreen = this.green() / 255;
        const normBlue = this.blue() / 255;
        const cMax = Math.max(normBlue, normGreen, normRed);
        const cMin = Math.min(normBlue, normGreen, normRed);
        const delta = cMax - cMin;
        let hue = 0;
        if (delta !== 0) {
            if (cMax === normRed) {
                hue = 60 * ((normGreen - normBlue) / delta % 6);
            }
            else if (cMax === normGreen) {
                hue = 60 * ((normBlue - normRed) / delta + 2);
            }
            else {
                hue = 60 * ((normRed - normGreen) / delta + 4);
            }
        }
        const lightness = (cMax + cMin) / 2;
        const saturation = delta / (1 - Math.abs(2 * lightness - 1));
        return [hue, saturation, lightness];
    }
    setByHSL(hue, saturation, lightness) {
        const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
        const x = c * (1 - Math.abs(hue / 60 % 2 - 1));
        const m = lightness - c / 2;
        if (hue < 60) {
            this.setRed((c + m) * 255);
            this.setGreen((x + m) * 255);
            this.setBlue(0);
        }
        else if (hue < 120) {
            this.setRed((x + m) * 255);
            this.setGreen((c + m) * 255);
            this.setBlue(m * 255);
        }
        else if (hue < 180) {
            this.setRed(m * 255);
            this.setGreen((c + m) * 255);
            this.setBlue((x + m) * 255);
        }
        else if (hue < 240) {
            this.setRed(0);
            this.setGreen((x + m) * 255);
            this.setBlue((c + m) * 255);
        }
        else if (hue < 300) {
            this.setRed((x + m) * 255);
            this.setGreen(m * 255);
            this.setBlue((c + m) * 255);
        }
        else {
            this.setRed((c + m) * 255);
            this.setGreen(m * 255);
            this.setBlue((x + m) * 255);
        }
        this.setAlpha(255);
    }
    compare(color) {
        return color && this.color === color.color;
    }
    copy(color) {
        this.color = color.color;
    }
    toInt() {
        return this.color;
    }
    toRGBA() {
        return [this.red(), this.green(), this.blue(), this.alpha()];
    }
    alpha() {
        return (this.color >> 24) & ((1 << 8) - 1);
    }
    blue() {
        return (this.color >> 16) & ((1 << 8) - 1);
    }
    green() {
        return (this.color >> 8) & ((1 << 8) - 1);
    }
    red() {
        return (this.color) & ((1 << 8) - 1);
    }
    alphaNormal() {
        return Math.round((((this.color >> 24) & ((1 << 8) - 1)) / 255) * 100) / 100;
    }
    setAlpha(red) {
        this.color &= (1 << 24) - 1;
        this.color |= red << 24;
    }
    setBlue(green) {
        this.color &= ((1 << 16) - 1) | (((1 << 8) - 1) << 24);
        this.color |= green << 16;
    }
    setGreen(blue) {
        this.color &= ((1 << 8) - 1) | (((1 << 16) - 1) << 16);
        this.color |= blue << 8;
    }
    setRed(alpha) {
        this.color &= (((1 << 24) - 1) << 8);
        this.color |= alpha;
    }
    loadString(color) {
        try {
            let r;
            let g;
            let b;
            let a;
            if (color.substring(0, 4).toLowerCase() !== "rgba") {
                if (color[0] !== "#")
                    throw new Error("Exception malformed color: " + color);
                r = parseInt(color.substring(1, 3), 16);
                g = parseInt(color.substring(3, 5), 16);
                b = parseInt(color.substring(5, 7), 16);
                a = parseFloat(color.substring(7, 9)) * 255;
            }
            else {
                const vals = color.split(",");
                vals[0] = vals[0].split("(")[1];
                vals[3] = vals[3].split(")")[0];
                r = parseInt(vals[0], 10);
                g = parseInt(vals[1], 10);
                b = parseInt(vals[2], 10);
                a = parseFloat(vals[3]) * 255;
            }
            let invalid = 0;
            if (!isNaN(r) && r >= 0) {
                if (r > 255) {
                    this.setRed(255);
                    invalid = 2;
                }
                else
                    this.setRed(r);
            }
            else
                invalid = +(r > 0);
            if (!isNaN(g) && g >= 0) {
                if (g > 255) {
                    this.setGreen(255);
                    invalid = 2;
                }
                else
                    this.setGreen(g);
            }
            else
                invalid = +(g > 0);
            if (!isNaN(b) && b >= 0) {
                if (b > 255) {
                    this.setBlue(255);
                    invalid = 2;
                }
                else
                    this.setBlue(b);
            }
            else
                invalid = +(b > 0);
            if (!isNaN(a) && a >= 0) {
                if (a > 255) {
                    this.setAlpha(255);
                    invalid = 2;
                }
                else
                    this.setAlpha(a);
            }
            else
                invalid = +(a > 0);
            if (color[color.length - 1] !== ")")
                invalid = 1;
            let openingPresent = false;
            for (let i = 0; !openingPresent && i < color.length; i++) {
                openingPresent = color[i] === "(";
            }
            if (!openingPresent)
                invalid = 1;
            return invalid;
        }
        catch (error) {
            console.log(error);
            return 0;
        }
    }
    htmlRBGA() {
        return `rgba(${this.red()}, ${this.green()}, ${this.blue()}, ${this.alphaNormal()})`;
    }
    htmlRBG() {
        const red = this.red() < 16 ? `0${this.red().toString(16)}` : this.red().toString(16);
        const green = this.green() < 16 ? `0${this.green().toString(16)}` : this.green().toString(16);
        const blue = this.blue() < 16 ? `0${this.blue().toString(16)}` : this.blue().toString(16);
        return `#${red}${green}${blue}`;
    }
}
;
class Pair {
    constructor(first, second) {
        this.first = first;
        this.second = second;
    }
}
;
class ImageContainer {
    constructor(imageName, imagePath, callBack = (img) => console.log(imageName + " loaded.")) {
        this.image = null;
        if (imagePath && imageName)
            fetchImage(imagePath).then(img => {
                this.image = img;
                callBack(img);
            });
        this.name = imageName;
    }
}
;
;
class LexicoGraphicNumericPair extends Pair {
    constructor(rollOver) {
        super(0, 0);
        this.rollOver = rollOver;
    }
    incHigher(val = 1) {
        this.first += val;
        return this.first;
    }
    incLower(val = 1) {
        this.first += Math.floor((this.second + val) / this.rollOver);
        this.second = (this.second + val) % this.rollOver;
        return this.second;
    }
    hash() {
        return this.first * this.rollOver + this.second;
    }
}
;
class RowRecord {
    constructor(x, y, width, height, element) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.element = element;
    }
}
class SimpleGridLayoutManager {
    constructor(matrixDim, pixelDim, x = 0, y = 0) {
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
        this.elementTouched = null;
    }
    createHandlers(keyboardHandler, touchHandler) {
        if (keyboardHandler) {
            keyboardHandler.registerCallBack("keydown", (e) => this.active(), (e) => { e.keyboardHandler = keyboardHandler; this.elements.forEach(el => el.handleKeyBoardEvents("keydown", e)); });
            keyboardHandler.registerCallBack("keyup", (e) => this.active(), (e) => { e.keyboardHandler = keyboardHandler; this.elements.forEach(el => el.handleKeyBoardEvents("keyup", e)); });
        }
        if (touchHandler) {
            touchHandler.registerCallBack("touchstart", (e) => this.active(), (e) => this.handleTouchEvents("touchstart", e));
            touchHandler.registerCallBack("touchmove", (e) => this.active(), (e) => this.handleTouchEvents("touchmove", e));
            touchHandler.registerCallBack("touchend", (e) => this.active(), (e) => this.handleTouchEvents("touchend", e));
        }
    }
    isLayoutManager() {
        return true;
    }
    handleKeyBoardEvents(type, e) {
        this.elements.forEach(el => el.handleKeyBoardEvents(type, e));
        if (e.repaint) {
            this.refreshCanvas();
        }
    }
    handleTouchEvents(type, e) {
        if (!this.elementTouched && e.touchPos[0] >= 0 && e.touchPos[0] < this.width() &&
            e.touchPos[1] >= 0 && e.touchPos[1] < this.height()) {
            let record = null;
            let index = 0;
            let runningNumber = 0;
            this.elementsPositions.forEach(el => {
                el.element.deactivate();
                el.element.refresh();
                if (e.touchPos[0] >= el.x && e.touchPos[0] < el.x + el.element.width() &&
                    e.touchPos[1] >= el.y && e.touchPos[1] < el.y + el.element.height()) {
                    record = el;
                    index = runningNumber;
                }
                runningNumber++;
            });
            if (record) {
                e.preventDefault();
                if (type !== "touchmove")
                    record.element.activate();
                e.translateEvent(e, -record.x, -record.y);
                record.element.handleTouchEvents(type, e);
                e.translateEvent(e, record.x, record.y);
                record.element.refresh();
                this.elementTouched = record;
                if (e.repaint) {
                    this.refreshCanvas();
                }
                this.lastTouched = index;
            }
        }
        if (this.elementTouched) {
            e.preventDefault();
            if (type !== "touchmove")
                this.elementTouched.element.activate();
            e.translateEvent(e, -this.elementTouched.x, -this.elementTouched.y);
            this.elementTouched.element.handleTouchEvents(type, e);
            e.translateEvent(e, this.elementTouched.x, this.elementTouched.y);
            this.elementTouched.element.refresh();
            if (e.repaint) {
                this.refreshCanvas();
            }
        }
        if (type === "touchend")
            this.elementTouched = null;
    }
    refresh() {
        this.refreshMetaData();
        this.refreshCanvas();
    }
    deactivate() {
        this.focused = false;
        this.elements.forEach(el => {
            el.deactivate();
        });
    }
    activate() {
        this.focused = true;
    }
    isCellFree(x, y) {
        const pixelX = x * this.pixelDim[0] / this.matrixDim[0];
        const pixelY = y * this.pixelDim[1] / this.matrixDim[1];
        let free = true;
        if (pixelX < this.pixelDim[0] && pixelY < this.pixelDim[1])
            for (let i = 0; free && i < this.elementsPositions.length; i++) {
                const elPos = this.elementsPositions[i];
                if (elPos.x <= pixelX && elPos.x + elPos.width > pixelX &&
                    elPos.y <= pixelY && elPos.y + elPos.height > pixelY)
                    free = false;
            }
        else
            free = false;
        return free;
    }
    refreshMetaData(xPos = 0, yPos = 0, offsetX = 0, offsetY = 0) {
        this.elementsPositions.splice(0, this.elementsPositions.length);
        const width = this.columnWidth();
        const height = this.rowHeight();
        let counter = new LexicoGraphicNumericPair(this.matrixDim[0]);
        let matX = 0;
        let matY = 0;
        for (let i = 0; i < this.elements.length; i++) {
            const element = this.elements[i];
            const elementWidth = Math.ceil(element.width() / this.columnWidth());
            let clearSpace = true;
            do {
                let j = counter.second;
                clearSpace = true;
                for (; clearSpace && j < counter.second + elementWidth; j++) {
                    clearSpace = this.isCellFree(j, counter.first);
                }
                if (!clearSpace && j < elementWidth) {
                    counter.incLower(j - counter.second);
                }
                else if (!clearSpace && j >= elementWidth) {
                    counter.incHigher();
                    counter.second = 0;
                }
            } while (!clearSpace && counter.first < this.matrixDim[1]);
            const x = counter.second * this.columnWidth();
            const y = counter.first * this.rowHeight();
            counter.second += elementWidth;
            const record = new RowRecord(x + xPos + offsetX, y + yPos + offsetY, element.width(), element.height(), element);
            this.elementsPositions.push(record);
        }
    }
    refreshCanvas(ctx = this.ctx, x = 0, y = 0) {
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.elementsPositions.forEach(el => el.element.draw(ctx, el.x, el.y, x, y));
    }
    active() {
        return this.focused;
    }
    width() {
        return this.pixelDim[0];
    }
    setWidth(val) {
        this.pixelDim[0] = val;
        this.canvas.width = val;
    }
    height() {
        return this.pixelDim[1];
    }
    setHeight(val) {
        this.pixelDim[1] = val;
        this.canvas.height = val;
    }
    rowHeight() {
        return this.pixelDim[1] / this.matrixDim[1];
    }
    columnWidth() {
        return this.pixelDim[0] / this.matrixDim[0];
    }
    usedRows() {
        for (let i = 0; i < this.elements.length; i++) {
        }
        return this.elements.length - 1;
    }
    hasSpace(element) {
        const elWidth = Math.floor((element.width() / this.columnWidth()) * this.matrixDim[0]);
        const elHeight = Math.floor((element.height() / this.rowHeight()) * this.matrixDim[1]);
        if (this.elements.length) {
            //todo
        }
        //todo
        return false;
    }
    addElement(element, position = -1) {
        let inserted = false;
        if (position === -1) {
            this.elements.push(element);
        }
        else {
            this.elements.splice(position, 0, element);
        }
        this.refreshMetaData();
        this.refreshCanvas();
        return inserted;
    }
    removeElement(element) {
        this.elements.splice(this.elements.indexOf(element), 1);
        this.refreshMetaData();
        this.refreshCanvas();
    }
    elementPosition(element) {
        const elPos = this.elementsPositions.find((el) => el.element === element);
        if (elPos === undefined)
            return [-1, -1];
        return [elPos.x, elPos.y];
    }
    draw(ctx, xPos = this.x, yPos = this.y, offsetX = 0, offsetY = 0) {
        this.refreshCanvas();
        ctx.drawImage(this.canvas, xPos + offsetX, yPos + offsetY);
    }
}
;
class ScrollingGridLayoutManager extends SimpleGridLayoutManager {
    constructor(matrixDim, pixelDim, x = 0, y = 0) {
        super(matrixDim, pixelDim, x, y);
        this.scrolledCanvas = document.createElement("canvas");
        this.offset = [0, 0];
    }
    handleScrollEvent(event) {
    }
    refreshCanvas() {
        super.refreshCanvas();
    }
}
;
class GuiListItem extends SimpleGridLayoutManager {
    constructor(text, state, pixelDim, fontSize = 16, callBack = () => { }, genericCallBack = null, slideMoved = null, flags = GuiTextBox.bottom, genericTouchType = "touchend") {
        super([20, 1], pixelDim);
        this.callBackType = genericTouchType;
        this.callBack = genericCallBack;
        this.checkBox = new GuiCheckBox(callBack, pixelDim[1], pixelDim[1]);
        const width = (pixelDim[0] - fontSize * 2 - 10) >> 1;
        this.textBox = new GuiTextBox(false, width, null, fontSize, pixelDim[1], flags);
        this.sliderX = width + pixelDim[1];
        this.slider = new GuiSlider(1, [width, pixelDim[1]], slideMoved);
        this.textBox.setText(text);
        this.checkBox.checked = state;
        this.checkBox.refresh();
        this.addElement(this.checkBox);
        this.addElement(this.textBox);
        this.addElement(this.slider);
    }
    handleTouchEvents(type, e) {
        super.handleTouchEvents(type, e);
        if (this.active() && type === this.callBackType) {
            e.item = this;
            if (this.callBack)
                this.callBack(e);
        }
    }
    state() {
        return this.checkBox.checked;
    }
}
;
class SlideEvent {
    constructor(value, element) {
        this.value = value;
        this.element = element;
    }
}
class GuiCheckList {
    constructor(matrixDim, pixelDim, fontSize, swap = null, slideMoved) {
        this.focused = true;
        this.fontSize = fontSize;
        this.layoutManager = new SimpleGridLayoutManager([1, matrixDim[1]], pixelDim);
        this.list = [];
        this.limit = 0;
        this.dragItem = null;
        this.dragItemLocation = [-1, -1];
        this.dragItemInitialIndex = -1;
        this.slideMoved = slideMoved;
        this.swapElementsInParallelArray = swap;
    }
    push(text, state = true, checkBoxCallback, onClickGeneral) {
        const newElement = new GuiListItem(text, state, [this.width(),
            this.height() / this.layoutManager.matrixDim[1] - 5], this.fontSize, checkBoxCallback, onClickGeneral, this.slideMoved);
        this.list.push(newElement);
    }
    selected() {
        return this.layoutManager.lastTouched;
    }
    selectedItem() {
        if (this.selected() !== -1)
            return this.list[this.selected()];
        else
            return null;
    }
    findBasedOnCheckbox(checkBox) {
        let index = 0;
        for (; index < this.list.length; index++) {
            if (this.list[index].checkBox === checkBox)
                break;
        }
        return index;
    }
    get(index) {
        if (this.list[index])
            return this.list[index];
        else
            return null;
    }
    isChecked(index) {
        return this.list[index] ? this.list[index].checkBox.checked : false;
    }
    delete(index) {
        if (this.list[index]) {
            this.list.splice(index, 1);
            this.refresh();
        }
    }
    active() {
        return this.focused;
    }
    deactivate() {
        this.focused = false;
    }
    activate() {
        this.focused = true;
    }
    width() {
        return this.layoutManager.width();
    }
    height() {
        return this.layoutManager.height();
    }
    refresh() {
        this.layoutManager.elements = this.list;
        this.layoutManager.refresh();
    }
    draw(ctx, x, y, offsetX, offsetY) {
        //this.layoutManager.draw(ctx, x, y, offsetX, offsetY);
        const itemsPositions = this.layoutManager.elementsPositions;
        let offsetI = 0;
        for (let i = 0; i < itemsPositions.length; i++) {
            if (this.dragItem && this.dragItemLocation[1] !== -1 && i === Math.floor((this.dragItemLocation[1] / this.height()) * this.layoutManager.matrixDim[1])) {
                offsetI++;
            }
            this.list[i].draw(ctx, x, y + offsetI * (this.height() / this.layoutManager.matrixDim[1]), offsetX, offsetY);
            offsetI++;
        }
        if (this.dragItem)
            this.dragItem.draw(ctx, x + this.dragItemLocation[0] - this.dragItem.width() / 2, y + this.dragItemLocation[1] - this.dragItem.height() / 2, offsetX, offsetY);
    }
    handleKeyBoardEvents(type, e) {
        this.layoutManager.handleKeyBoardEvents(type, e);
    }
    handleTouchEvents(type, e) {
        this.layoutManager.handleTouchEvents(type, e);
        const clicked = Math.floor((e.touchPos[1] / this.height()) * this.layoutManager.matrixDim[1]);
        this.layoutManager.lastTouched = clicked > this.list.length ? this.list.length - 1 : clicked;
        switch (type) {
            case ("touchend"):
                if (this.dragItem) {
                    this.list.splice(clicked, 0, this.dragItem);
                    if (this.swapElementsInParallelArray && this.dragItemInitialIndex !== -1) {
                        if (clicked > this.list.length)
                            this.swapElementsInParallelArray(this.dragItemInitialIndex, this.list.length - 1);
                        else
                            this.swapElementsInParallelArray(this.dragItemInitialIndex, clicked);
                    }
                    this.dragItem = null;
                    this.dragItemInitialIndex = -1;
                    this.dragItemLocation[0] = -1;
                    this.dragItemLocation[1] = -1;
                }
                if (this.selectedItem() && this.selectedItem().callBack)
                    this.selectedItem().callBack(e);
                break;
            case ("touchmove"):
                const movesNeeded = isTouchSupported() ? 7 : 2;
                if (this.selectedItem() && e.touchPos[0] < this.selectedItem().sliderX) {
                    if (e.moveCount === movesNeeded && this.selectedItem() && this.list.length > 1) {
                        this.dragItem = this.list.splice(this.selected(), 1)[0];
                        this.dragItemInitialIndex = this.selected();
                        this.dragItemLocation[0] = e.touchPos[0];
                        this.dragItemLocation[1] = e.touchPos[1];
                    }
                    else if (e.moveCount > movesNeeded) {
                        this.dragItemLocation[0] += e.deltaX;
                        this.dragItemLocation[1] += e.deltaY;
                    }
                }
                else if (e.moveCount > movesNeeded) {
                    this.dragItemLocation[0] += e.deltaX;
                    this.dragItemLocation[1] += e.deltaY;
                }
                break;
        }
    }
    isLayoutManager() {
        return false;
    }
}
;
class GuiSlider {
    constructor(state, dim, movedCallBack) {
        this.state = state;
        this.callBack = movedCallBack;
        this.focused = false;
        this.dim = [dim[0], dim[1]];
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.width();
        this.canvas.height = this.height();
        this.refresh();
    }
    setState(value) {
        if (value < 1 && value >= 0)
            this.state = value;
        else if (value >= 1)
            this.state = value;
        this.refresh();
    }
    active() {
        return this.focused;
    }
    deactivate() {
        this.focused = false;
    }
    activate() {
        this.focused = true;
    }
    width() {
        return this.dim[0];
    }
    height() {
        return this.dim[1];
    }
    getBounds() {
        return [this.width() / 10, this.height() / 10, this.width() - this.width() / 5, this.height() - this.height() / 5];
    }
    refresh() {
        const ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.width(), this.height());
        ctx.fillStyle = "#FFFFFF";
        const bounds = this.getBounds();
        const center = [bounds[0] + bounds[2] / 2, bounds[1] + bounds[3] / 2];
        const displayLineX = this.state * bounds[2] + bounds[0];
        ctx.fillRect(bounds[0] - 1, center[1] - 1, bounds[2] + 2, 4);
        ctx.fillRect(displayLineX - 1, bounds[1] - 1, 5 + 1, bounds[3] + 2);
        ctx.fillStyle = "#000000";
        ctx.fillRect(bounds[0], center[1], bounds[2], 2);
        ctx.fillRect(displayLineX, bounds[1], 4, bounds[3]);
    }
    draw(ctx, x, y, offsetX, offsetY) {
        ctx.drawImage(this.canvas, x + offsetX, y + offsetY);
    }
    handleKeyBoardEvents(type, e) {
    }
    handleTouchEvents(type, e) {
        const bounds = [this.width() / 10, this.height() / 10, this.width() - this.width() / 5, this.height() - this.height() / 5];
        switch (type) {
            case ("touchstart"):
                this.state = (e.touchPos[0] - bounds[0]) / bounds[2];
                break;
            case ("touchmove"):
                this.state = (e.touchPos[0] - bounds[0]) / bounds[2];
                break;
        }
        if (this.state > 1)
            this.state = 1;
        else if (this.state < 0)
            this.state = 0;
        if (this.callBack)
            this.callBack({ value: this.state, element: this });
        this.refresh();
    }
    isLayoutManager() {
        return false;
    }
}
;
class GuiSpacer {
    constructor(dim) {
        this.dim = [dim[0], dim[1]];
        this.refresh();
    }
    active() {
        return false;
    }
    deactivate() { }
    activate() { }
    width() {
        return this.dim[0];
    }
    height() {
        return this.dim[1];
    }
    refresh() { }
    draw(ctx, x, y, offsetX, offsetY) { }
    handleKeyBoardEvents(type, e) { }
    handleTouchEvents(type, e) { }
    isLayoutManager() {
        return false;
    }
}
;
class GuiColoredSpacer {
    constructor(dim, color) {
        this.dim = [dim[0], dim[1]];
        this.color = new RGB(0, 0, 0);
        this.color.copy(color);
        this.refresh();
    }
    active() {
        return false;
    }
    deactivate() { }
    activate() { }
    width() {
        return this.dim[0];
    }
    height() {
        return this.dim[1];
    }
    refresh() { }
    draw(ctx, x, y, offsetX, offsetY) {
        const originalFillStyle = ctx.fillStyle;
        const originalStrokeStyle = ctx.strokeStyle;
        const colorString = this.color.htmlRBGA();
        if (colorString !== originalFillStyle) {
            ctx.fillStyle = colorString;
        }
        if ("#000000" !== originalStrokeStyle) {
            ctx.strokeStyle = "#000000";
        }
        ctx.fillRect(x + offsetX, y + offsetY, this.dim[0], this.dim[1]);
        ctx.strokeRect(x + offsetX, y + offsetY, this.dim[0], this.dim[1]);
        if (colorString !== originalFillStyle) {
            ctx.fillStyle = originalFillStyle;
        }
        if ("#000000" !== originalStrokeStyle) {
            ctx.strokeStyle = originalStrokeStyle;
        }
    }
    handleKeyBoardEvents(type, e) { }
    handleTouchEvents(type, e) { }
    isLayoutManager() {
        return false;
    }
}
;
class GuiButton {
    constructor(callBack, text, width = 200, height = 50, fontSize = 12, pressedColor = new RGB(150, 150, 200, 255), unPressedColor = new RGB(255, 255, 255, 195), fontName = "button_font") {
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
            this.font = new FontFace(`${this.fontName}`, 'url(/web/fonts/Minecraft.ttf)');
            this.font.load().then((loaded_face) => {
                document.fonts.add(loaded_face);
                this.drawInternal();
            }, (error) => {
                this.font = new FontFace(`${this.fontName}`, 'url(/fonts/Minecraft.ttf)');
                this.font.load().then((loaded_face) => {
                    document.fonts.add(loaded_face);
                    this.drawInternal();
                }, (error) => {
                    console.log(error.message);
                    this.drawInternal();
                });
            });
        }
    }
    handleKeyBoardEvents(type, e) {
        if (this.active()) {
            if (e.code === "Enter") {
                switch (type) {
                    case ("keydown"):
                        this.pressed = true;
                        this.drawInternal();
                        break;
                    case ("keyup"):
                        if (this.callback)
                            this.callback();
                        this.pressed = false;
                        this.drawInternal();
                        this.deactivate();
                        break;
                }
            }
        }
    }
    handleTouchEvents(type, e) {
        if (this.active())
            switch (type) {
                case ("touchstart"):
                    this.pressed = true;
                    this.drawInternal();
                    break;
                case ("touchend"):
                    if (this.callback)
                        this.callback();
                    this.pressed = false;
                    this.drawInternal();
                    break;
            }
    }
    isLayoutManager() {
        return false;
    }
    active() {
        return this.focused;
    }
    deactivate() {
        this.focused = false;
    }
    activate() {
        this.focused = true;
    }
    width() {
        return this.dimensions[0];
    }
    height() {
        return this.dimensions[1];
    }
    setCtxState(ctx) {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        if (this.pressed)
            ctx.fillStyle = this.pressedColor.htmlRBGA();
        else
            ctx.fillStyle = this.unPressedColor.htmlRBGA();
        ctx.font = this.fontSize + `px ${this.fontName}`;
    }
    refresh() {
        this.drawInternal();
    }
    drawInternal(ctx = this.ctx) {
        const fs = ctx.fillStyle;
        this.setCtxState(ctx);
        ctx.fillRect(0, 0, this.width(), this.height());
        ctx.strokeRect(0, 0, this.width(), this.height());
        ctx.fillStyle = "#000000";
        const textWidth = ctx.measureText(this.text).width;
        const textHeight = this.fontSize;
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 4;
        ctx.strokeText(this.text, this.width() / 2 - textWidth / 2, this.height() / 2 + textHeight / 2, this.width());
        ctx.fillText(this.text, this.width() / 2 - textWidth / 2, this.height() / 2 + textHeight / 2, this.width());
        ctx.fillStyle = fs;
    }
    draw(ctx, x, y, offsetX = 0, offsetY = 0) {
        ctx.drawImage(this.canvas, x + offsetX, y + offsetY);
    }
}
;
class GuiCheckBox {
    constructor(callBack, width = 50, height = 50, checked = false, unPressedColor = new RGB(255, 255, 255, 0), pressedColor = new RGB(150, 150, 200, 255), fontSize = height - 10) {
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
    handleKeyBoardEvents(type, e) {
        if (this.active()) {
            if (e.code === "Enter") {
                switch (type) {
                    case ("keydown"):
                        this.pressed = true;
                        this.drawInternal();
                        break;
                    case ("keyup"):
                        e.checkBox = this;
                        if (this.callback)
                            this.callback(e);
                        this.pressed = false;
                        this.drawInternal();
                        this.deactivate();
                        break;
                }
            }
        }
    }
    isLayoutManager() {
        return false;
    }
    handleTouchEvents(type, e) {
        if (this.active())
            switch (type) {
                case ("touchstart"):
                    this.pressed = true;
                    this.drawInternal();
                    break;
                case ("touchend"):
                    this.checked = !this.checked;
                    this.pressed = false;
                    e.checkBox = this;
                    if (this.callback)
                        this.callback(e);
                    this.drawInternal();
                    break;
            }
    }
    active() {
        return this.focused;
    }
    deactivate() {
        this.focused = false;
    }
    activate() {
        this.focused = true;
    }
    width() {
        return this.dimensions[0];
    }
    height() {
        return this.dimensions[1];
    }
    setCtxState(ctx) {
        if (this.pressed)
            ctx.fillStyle = this.pressedColor.htmlRBGA();
        else
            ctx.fillStyle = this.unPressedColor.htmlRBGA();
        ctx.font = this.fontSize + 'px Calibri';
    }
    refresh() {
        this.drawInternal();
    }
    drawInternal(ctx = this.ctx) {
        const fs = ctx.fillStyle;
        this.setCtxState(ctx);
        ctx.clearRect(0, 0, this.width(), this.height());
        ctx.fillRect(0, 0, this.width(), this.height());
        ctx.fillStyle = "#000000";
        ctx.strokeStyle = "#000000";
        ctx.strokeRect(1, 1, this.canvas.width - 2, this.canvas.height - 2);
        ctx.strokeStyle = "#FFFFFF";
        ctx.strokeRect(3, 3, this.canvas.width - 6, this.canvas.height - 6);
        ctx.fillText(this.checked ? "\u2713" : "", this.width() / 2 - this.ctx.measureText("\u2713").width / 2, 0 + this.fontSize, this.width());
        ctx.strokeText(this.checked ? "\u2713" : "", this.width() / 2 - this.ctx.measureText("\u2713").width / 2, 0 + this.fontSize, this.width());
        ctx.fillStyle = fs;
    }
    draw(ctx, x, y, offsetX = 0, offsetY = 0) {
        ctx.drawImage(this.canvas, x + offsetX, y + offsetY);
    }
}
;
class TextRow {
    constructor(text, x, y, width) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.width = width;
    }
}
;
class Optional {
    constructor() {
        this.data = null;
    }
    get() {
        return this.data;
    }
    set(data) {
        this.data = data;
    }
    clear() {
        this.data = null;
    }
}
;
;
class GuiTextBox {
    constructor(keyListener, width, submit = null, fontSize = 16, height = 2 * fontSize, flags = GuiTextBox.default, validationCallback = null, selectedColor = new RGB(80, 80, 220), unSelectedColor = new RGB(100, 100, 100), outline = true, fontName = "textBox_default", customFontFace = null) {
        this.handleKeyEvents = keyListener;
        this.outlineTextBox = outline;
        this.validationCallback = validationCallback;
        GuiTextBox.textBoxRunningNumber++;
        this.textBoxId = GuiTextBox.textBoxRunningNumber;
        this.cursor = 0;
        this.flags = flags;
        this.focused = false;
        this.promptText = "Enter text here:";
        this.submissionButton = submit;
        this.selectedColor = selectedColor;
        this.unSelectedColor = unSelectedColor;
        this.asNumber = new Optional();
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
        {
            if (customFontFace) {
                this.font = customFontFace;
                this.font.family;
            }
            else
                this.font = new FontFace(fontName, 'url(/web/fonts/Minecraft.ttf)');
            this.font.load().then((loaded_face) => {
                document.fonts.add(loaded_face);
                this.drawInternalAndClear();
            }, (error) => {
                this.font = new FontFace(fontName, 'url(/fonts/Minecraft.ttf)');
                this.font.load().then((loaded_face) => {
                    document.fonts.add(loaded_face);
                    this.refresh();
                }, (error) => {
                    console.log(error.message);
                    this.refresh();
                });
            });
        }
    }
    //take scaled pos calc delta from cursor pos
    //
    isLayoutManager() {
        return false;
    }
    hflag() {
        return this.flags & GuiTextBox.horizontalAlignmentFlagsMask;
    }
    hcenter() {
        return this.hflag() === GuiTextBox.hcenter;
    }
    left() {
        return this.hflag() === GuiTextBox.left;
    }
    farleft() {
        return this.hflag() === GuiTextBox.farleft;
    }
    right() {
        return this.hflag() === GuiTextBox.right;
    }
    center() {
        return (this.flags & GuiTextBox.verticalAlignmentFlagsMask) === GuiTextBox.center;
    }
    top() {
        return (this.flags & GuiTextBox.verticalAlignmentFlagsMask) === GuiTextBox.top;
    }
    bottom() {
        return (this.flags & GuiTextBox.verticalAlignmentFlagsMask) === GuiTextBox.bottom;
    }
    handleKeyBoardEvents(type, e) {
        let preventDefault = false;
        if (this.active() && this.handleKeyEvents) {
            preventDefault = true;
            const oldText = this.text;
            const oldCursor = this.cursor;
            switch (type) {
                case ("keydown"):
                    switch (e.code) {
                        case ("NumpadEnter"):
                        case ("Enter"):
                            this.deactivate();
                            if (this.submissionButton) {
                                this.submissionButton.activate();
                                this.submissionButton.handleKeyBoardEvents(type, e);
                            }
                            break;
                        case ("Space"):
                            this.text = this.text.substring(0, this.cursor) + ' ' + this.text.substring(this.cursor, this.text.length);
                            this.cursor++;
                            break;
                        case ("Backspace"):
                            this.text = this.text.substring(0, this.cursor - 1) + this.text.substring(this.cursor, this.text.length);
                            this.cursor -= +(this.cursor > 0);
                            break;
                        case ("Delete"):
                            this.text = this.text.substring(0, this.cursor) + this.text.substring(this.cursor + 1, this.text.length);
                            break;
                        case ("ArrowLeft"):
                            this.cursor -= +(this.cursor > 0);
                            break;
                        case ("ArrowRight"):
                            this.cursor += +(this.cursor < this.text.length);
                            break;
                        case ("ArrowUp"):
                            this.cursor = 0;
                            break;
                        case ("ArrowDown"):
                            this.cursor = (this.text.length);
                            break;
                        case ("Period"):
                            this.text = this.text.substring(0, this.cursor) + "." + this.text.substring(this.cursor, this.text.length);
                            this.cursor++;
                            break;
                        case ("Comma"):
                            this.text = this.text.substring(0, this.cursor) + "," + this.text.substring(this.cursor, this.text.length);
                            this.cursor++;
                            break;
                        default:
                            {
                                let letter = e.code.substring(e.code.length - 1);
                                if (!e.keysHeld["ShiftRight"] && !e.keysHeld["ShiftLeft"])
                                    letter = letter.toLowerCase();
                                if (GuiTextBox.textLookup[e.code] || GuiTextBox.numbers[e.code]) {
                                    this.text = this.text.substring(0, this.cursor) + letter + this.text.substring(this.cursor, this.text.length);
                                    this.cursor++;
                                }
                                else if (GuiTextBox.specialChars[e.code]) {
                                    //todo
                                }
                                else if (e.code.substring(0, "Numpad".length) === "Numpad") {
                                    this.text = this.text.substring(0, this.cursor) + letter + this.text.substring(this.cursor, this.text.length);
                                    this.cursor++;
                                }
                            }
                    }
                    this.calcNumber();
                    if (this.validationCallback) {
                        if (!this.validationCallback({ textbox: this, event: e, oldCursor: oldCursor, oldText: oldText })) {
                            this.text = oldText;
                            this.cursor = oldCursor;
                        }
                        else {
                            this.drawInternalAndClear();
                        }
                    }
                    else {
                        this.drawInternalAndClear();
                    }
            }
        }
        if (preventDefault)
            e.preventDefault();
    }
    setText(text) {
        this.text = text;
        this.cursor = text.length;
        this.calcNumber();
        this.drawInternalAndClear();
    }
    calcNumber() {
        if (!isNaN(Number(this.text))) {
            this.asNumber.set(Number(this.text));
        }
        else
            this.asNumber.clear();
    }
    handleTouchEvents(type, e) {
        if (this.active()) {
            switch (type) {
                case ("touchend"):
                    if (isTouchSupported() && this.handleKeyEvents) {
                        const value = prompt(this.promptText, this.text);
                        if (value) {
                            this.setText(value);
                            this.calcNumber();
                            this.deactivate();
                            if (this.submissionButton) {
                                this.submissionButton.activate();
                                this.submissionButton.callback();
                            }
                        }
                    }
                    this.drawInternalAndClear();
            }
        }
    }
    static initGlobalText() {
        for (let i = 65; i < 65 + 26; i++)
            GuiTextBox.textLookup["Key" + String.fromCharCode(i)] = true;
    }
    ;
    static initGlobalNumbers() {
        for (let i = 48; i < 48 + 10; i++) {
            GuiTextBox.numbers["Digit" + String.fromCharCode(i)] = true;
        }
    }
    ;
    static initGlobalSpecialChars() {
        //specialChars
    }
    active() {
        return this.focused;
    }
    deactivate() {
        this.focused = false;
        this.refresh();
    }
    activate() {
        this.focused = true;
        this.refresh();
    }
    textWidth() {
        return this.ctx.measureText(this.text).width;
    }
    setCtxState() {
        this.ctx.strokeStyle = "#000000";
        this.ctx.font = this.fontSize + `px ${this.fontName}`;
    }
    width() {
        return this.dimensions[0];
    }
    height() {
        return this.dimensions[1];
    }
    refreshMetaData(text = this.text, x = 0, y = this.fontSize, cursorOffset = 0) {
        if (text.search("\n") !== -1) {
            const rows = text.split("\n");
            let indeces = new Pair(cursorOffset, [x, y]);
            rows.forEach(row => {
                indeces = this.refreshMetaData(row, indeces.second[0], indeces.second[1] + this.fontSize, indeces.first);
            });
            return indeces;
        }
        const textWidth = this.ctx.measureText(text).width;
        const canvasWidth = this.canvas.width;
        const rows = Math.ceil(textWidth / (canvasWidth - (20 + x)));
        const charsPerRow = Math.floor(text.length / rows);
        const cursor = this.cursor - cursorOffset;
        let charIndex = 0;
        let i = 0;
        for (; i < rows - 1; i++) {
            const yPos = i * this.fontSize + y;
            if (cursor >= charIndex && cursor <= charIndex + charsPerRow) {
                this.cursorPos[1] = yPos;
                const substrWidth = this.ctx.measureText(text.substring(charIndex, cursor)).width;
                this.cursorPos[0] = substrWidth + x;
            }
            const substr = text.substring(charIndex, charIndex + charsPerRow);
            this.rows.push(new TextRow(substr, x, yPos, this.width() - x));
            charIndex += charsPerRow;
        }
        const yPos = i * this.fontSize + y;
        const substring = text.substring(charIndex, text.length);
        const substrWidth = this.ctx.measureText(substring).width;
        if (substrWidth > this.width() - x)
            this.refreshMetaData(substring, x, i * this.fontSize + y, cursorOffset + charIndex);
        else if (substring.length > 0) {
            if (cursor >= charIndex) {
                this.cursorPos[1] = yPos;
                const substrWidth = this.ctx.measureText(text.substring(charIndex, cursor)).width;
                this.cursorPos[0] = substrWidth + x;
            }
            this.rows.push(new TextRow(substring, x, yPos, this.width() - x));
        }
        return new Pair(cursorOffset + charIndex, [x, i * this.fontSize + y]);
    }
    cursorRowIndex() {
        let index = 0;
        for (let i = 0; i < this.rows.length; i++) {
            const row = this.rows[i];
            if (row.y === Math.floor(this.cursor / this.fontSize))
                index = i;
        }
        return index;
    }
    adjustScrollToCursor() {
        let deltaY = 0;
        let deltaX = 0;
        if (this.top()) {
            if (this.cursorPos[1] > this.height() - this.fontSize) {
                deltaY += this.cursorPos[1] - this.fontSize;
            }
            else if (this.cursorPos[1] < this.fontSize) {
                deltaY -= this.cursorPos[1] + this.fontSize;
            }
        }
        else if (this.center()) {
            if (this.cursorPos[1] > this.height() / 2 + this.fontSize / 2) {
                deltaY += this.cursorPos[1] - this.height() + this.height() / 2;
            }
            else if (this.cursorPos[1] < this.height() / 2 + this.fontSize / 2) {
                deltaY += this.cursorPos[1] - (this.height() / 2);
            }
        }
        else {
            if (this.cursorPos[1] > this.height() - 3) {
                deltaY += this.cursorPos[1] - this.height() + this.fontSize / 3;
            }
            else if (this.cursorPos[1] < this.height() - 3) {
                deltaY += this.cursorPos[1] - this.height() + this.fontSize / 3;
            }
        }
        if (this.rows.length) {
            let freeSpace = this.width(); // - this.rows[0].width;
            let maxWidth = 0;
            this.rows.forEach(el => {
                const width = this.ctx.measureText(el.text).width;
                if (freeSpace > this.width() - width) {
                    freeSpace = this.width() - width;
                    maxWidth = width;
                }
            });
            if (this.hcenter()) {
                deltaX -= freeSpace / 2 - maxWidth / 2;
            }
            else if (this.left()) {
                deltaX -= this.ctx.measureText("0").width / 3;
            }
            else if (this.right()) {
                deltaX -= freeSpace + this.ctx.measureText("0").width / 3;
            }
        }
        const newRows = [];
        this.rows.forEach(row => newRows.push(new TextRow(row.text, row.x - deltaX, row.y - deltaY, row.width)));
        this.scaledCursorPos[1] = this.cursorPos[1] - deltaY;
        this.scaledCursorPos[0] = this.cursorPos[0] - deltaX;
        return newRows;
    }
    drawRows(rows) {
        rows.forEach(row => {
            this.ctx.lineWidth = 4;
            this.ctx.strokeText(row.text, row.x, row.y, row.width);
            this.ctx.fillText(row.text, row.x, row.y, row.width);
        });
    }
    drawCursor() {
        if (this.active() && this.handleKeyEvents) {
            this.ctx.fillStyle = "#000000";
            this.ctx.fillRect(this.scaledCursorPos[0], this.scaledCursorPos[1] - this.fontSize + 3, 2, this.fontSize - 2);
        }
    }
    color() {
        if (this.active())
            return this.selectedColor;
        else
            return this.unSelectedColor;
    }
    refresh() {
        this.drawInternalAndClear();
    }
    drawInternalAndClear() {
        this.setCtxState();
        this.ctx.clearRect(0, 0, this.width(), this.height());
        this.ctx.fillStyle = "#000000";
        this.rows.splice(0, this.rows.length);
        this.refreshMetaData();
        this.ctx.strokeStyle = "#FFFFFF";
        this.drawRows(this.adjustScrollToCursor());
        this.drawCursor();
        if (this.outlineTextBox) {
            this.ctx.strokeStyle = this.color().htmlRBG();
            this.ctx.lineWidth = 4;
            this.ctx.strokeRect(0, 0, this.width(), this.height());
        }
    }
    draw(ctx, x, y, offsetX = 0, offsetY = 0) {
        ctx.drawImage(this.canvas, x + offsetX, y + offsetY);
    }
}
GuiTextBox.center = 0;
GuiTextBox.bottom = 1;
GuiTextBox.top = 2;
GuiTextBox.verticalAlignmentFlagsMask = 0b0011;
GuiTextBox.left = 0;
GuiTextBox.hcenter = (1 << 2);
GuiTextBox.right = (2 << 2);
GuiTextBox.farleft = (3 << 2);
GuiTextBox.horizontalAlignmentFlagsMask = 0b1100;
GuiTextBox.default = GuiTextBox.center | GuiTextBox.left;
GuiTextBox.textLookup = {};
GuiTextBox.numbers = {};
GuiTextBox.specialChars = {};
GuiTextBox.textBoxRunningNumber = 0;
;
class GuiLabel extends GuiTextBox {
    constructor(text, width, fontSize = 16, flags = GuiTextBox.bottom, height = 2 * fontSize, backgroundColor = new RGB(255, 255, 255, 0)) {
        super(false, width, null, fontSize, height, flags, null, backgroundColor, backgroundColor, false);
        this.setText(text);
    }
    //override the textbox's handlers
    handleKeyBoardEvents(type, e) { }
    handleTouchEvents(type, e) { }
    active() {
        return false;
    }
}
;
GuiTextBox.initGlobalText();
GuiTextBox.initGlobalNumbers();
GuiTextBox.initGlobalSpecialChars();
class GuiToolBar {
    constructor(renderDim, tools = []) {
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
        this.ctx.strokeStyle = "#000000";
    }
    setImagesIndex(value) {
        this.tools.forEach(tool => {
            if (tool.toolImages.length > value)
                tool.selected = value;
        });
    }
    resize(width = this.width(), height = this.height()) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext("2d");
        this.ctx.strokeStyle = "#000000";
    }
    active() {
        return this.focused;
    }
    deactivate() {
        this.focused = false;
    }
    activate() {
        this.focused = true;
    }
    width() {
        if (this.vertical)
            return this.toolRenderDim[0] * (1 + Math.floor(this.tools.length / this.toolsPerRow));
        else
            return this.toolRenderDim[0] * this.toolsPerRow;
    }
    height() {
        if (this.vertical)
            return this.toolRenderDim[1] * this.toolsPerRow;
        else
            return this.toolRenderDim[1] * (1 + Math.floor(this.tools.length / this.toolsPerRow));
    }
    refresh() {
        this.ctx.clearRect(0, 0, this.width(), this.height());
        for (let i = 0; i < this.tools.length; i++) {
            let gridX = 0;
            let gridY = 0;
            if (this.vertical) {
                const toolsPerColumn = this.toolsPerRow;
                gridX = Math.floor(i / toolsPerColumn);
                gridY = i % toolsPerColumn;
            }
            else {
                gridX = i % this.toolsPerRow;
                gridY = Math.floor(i / this.toolsPerRow);
            }
            const pixelX = gridX * this.toolRenderDim[0];
            const pixelY = gridY * this.toolRenderDim[1];
            const image = this.tools[i].image();
            if (image && image.width && image.height) {
                this.ctx.drawImage(image, pixelX, pixelY, this.toolRenderDim[0], this.toolRenderDim[1]);
            }
            if (this.selected === i) {
                this.ctx.strokeStyle = "#FFFFFF";
                this.ctx.strokeRect(pixelX + 3, pixelY + 3, this.toolRenderDim[0] - 6, this.toolRenderDim[1] - 6);
                this.ctx.strokeStyle = "#000000";
                this.ctx.strokeRect(pixelX + 1, pixelY + 1, this.toolRenderDim[0] - 2, this.toolRenderDim[1] - 2);
            }
        }
    }
    draw(ctx, x, y, offsetX = 0, offsetY = 0) {
        ctx.drawImage(this.canvas, x + offsetX, y + offsetY);
    }
    handleKeyBoardEvents(type, e) { }
    tool() {
        return this.tools[this.selected];
    }
    handleTouchEvents(type, e) {
        if (this.active()) {
            switch (type) {
                case ("touchstart"):
                    const x = Math.floor(e.touchPos[0] / this.toolRenderDim[0]);
                    const y = Math.floor(e.touchPos[1] / this.toolRenderDim[1]);
                    const clicked = this.vertical ? y + x * this.toolsPerRow : x + y * this.toolsPerRow;
                    if (clicked >= 0 && clicked < this.tools.length) {
                        this.selected = clicked;
                    }
            }
            this.refresh();
        }
    }
    isLayoutManager() {
        return false;
    }
}
;
;
class RGB24BitPalette {
    constructor() {
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.colorData = null;
        this.refresh();
    }
    refresh() {
        this.colorData = new Uint32Array(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data.buffer);
    }
    getColorAt(x, y) {
    }
    draw(ctx, x, y, width, height) {
    }
}
;
class GuiPaletteSelector {
}
;
class ToolBarItem {
    constructor(toolName, toolImagePath, selected = 0) {
        this.selected = selected;
        this.toolImages = [];
        if (Array.isArray(toolName) && !(toolImagePath instanceof String) && toolName.length === toolImagePath.length) {
            for (let i = 0; i < toolName.length; i++)
                this.toolImages.push(new ImageContainer(toolName[i], toolImagePath[i]));
        }
        else if (!Array.isArray(toolName) && Array.isArray(toolImagePath)) {
            for (let i = 0; i < toolName.length; i++)
                this.toolImages.push(new ImageContainer(toolName, toolImagePath[i]));
        }
        else if (Array.isArray(toolName) && Array.isArray(toolImagePath) && toolName.length !== toolImagePath.length)
            throw new Error("Invalid params for toolbar item both lists must be same length");
        else if (!Array.isArray(toolName) && !Array.isArray(toolImagePath)) {
            this.toolImages.push(new ImageContainer(toolName, toolImagePath));
        }
        else if (!(toolName instanceof String) && (toolImagePath instanceof String)) {
            throw new Error("Invalid params for toolbar item both params should be same type");
        }
    }
    imageContainer() {
        return this.toolImages[this.selected];
    }
    width() {
        return this.imageContainer().image.width;
    }
    height() {
        return this.imageContainer().image.height;
    }
    image() {
        if (this.imageContainer())
            return this.imageContainer().image;
        return null;
    }
    name() {
        return this.imageContainer().name;
    }
    drawImage(ctx, x, y, width, height) {
        if (this.image()) {
            ctx.drawImage(this.image(), x, y, width, height);
        }
    }
}
;
class Tool extends ToolBarItem {
    constructor(toolName, toolImagePath) {
        super(toolName, toolImagePath);
    }
}
;
class ViewLayoutTool extends Tool {
    constructor(layoutManager, name, path) {
        super(name, path);
        this.layoutManager = layoutManager;
    }
    activateOptionPanel() { this.layoutManager.activate(); }
    deactivateOptionPanel() { this.layoutManager.deactivate(); }
    getOptionPanel() {
        return this.layoutManager;
    }
    optionPanelSize() {
        return [this.layoutManager.canvas.width, this.layoutManager.canvas.height];
    }
    drawOptionPanel(ctx, x, y) {
        const optionPanel = this.getOptionPanel();
        optionPanel.x = x;
        optionPanel.y = y;
        optionPanel.draw(ctx, x, y);
    }
}
;
class GenericTool extends Tool {
    constructor(name, imagePath) {
        super(name, imagePath);
    }
    activateOptionPanel() { }
    deactivateOptionPanel() { }
    getOptionPanel() {
        return null;
    }
    optionPanelSize() {
        return [0, 0];
    }
    drawOptionPanel(ctx, x, y) { }
}
;
class ExtendedTool extends ViewLayoutTool {
    constructor(name, path, optionPanes, dim, matrixDim = [24, 24], parentMatrixDim = [24, 48]) {
        super(new SimpleGridLayoutManager([parentMatrixDim[0], parentMatrixDim[1]], [dim[0], dim[1]]), name, path);
        this.localLayout = new SimpleGridLayoutManager([matrixDim[0], matrixDim[1]], [dim[0], dim[1]]);
        const parentPanel = this.getOptionPanel();
        parentPanel.addElement(this.localLayout);
        this.optionPanels = [this.localLayout];
        let maxY = this.localLayout.height();
        let maxX = this.localLayout.width();
        optionPanes.forEach((pane) => {
            parentPanel.addElement(pane);
            this.optionPanels.push(pane);
            maxY += pane.height();
        });
        parentPanel.setHeight(maxY);
        parentPanel.setWidth(maxX);
        parentPanel.refreshMetaData();
        maxY = 0;
        parentPanel.elementsPositions.forEach(el => {
            if (el.y + el.height > maxY) {
                maxY = el.y + el.height;
            }
        });
        parentPanel.setWidth(maxX);
        parentPanel.setHeight(dim[1] + maxY);
        parentPanel.refreshMetaData();
    }
    activateOptionPanel() {
        this.getOptionPanel().activate();
        this.optionPanels.forEach(element => {
            element.activate();
        });
    }
    deactivateOptionPanel() {
        this.getOptionPanel().deactivate();
        this.optionPanels.forEach(element => {
            element.deactivate();
        });
    }
}
;
class SingleCheckBoxTool extends GenericTool {
    constructor(label, name, imagePath, callback = () => null) {
        super(name, imagePath);
        this.optionPanel = new SimpleGridLayoutManager([1, 4], [200, 90]);
        this.checkBox = new GuiCheckBox(callback, 40, 40);
        this.optionPanel.addElement(new GuiLabel(label, 200, 16, GuiTextBox.bottom, 40));
        this.optionPanel.addElement(this.checkBox);
    }
    activateOptionPanel() { this.optionPanel.activate(); }
    deactivateOptionPanel() { this.optionPanel.deactivate(); }
    getOptionPanel() {
        return this.optionPanel;
    }
    optionPanelSize() {
        return [this.optionPanel.width(), this.optionPanel.height()];
    }
    drawOptionPanel(ctx, x, y) {
        const optionPanel = this.getOptionPanel();
        optionPanel.x = x;
        optionPanel.y = y;
        optionPanel.draw(ctx, x, y);
    }
}
;
class DragTool extends ExtendedTool {
    constructor(name, imagePath, callBack, callBackBlendAlphaState, optionPanes = [], toolSelector) {
        super(name, imagePath, optionPanes, [200, 190], [10, 50]);
        this.toolSelector = toolSelector;
        this.checkBox = new GuiCheckBox(callBack, 40, 40);
        this.checkBoxBlendAlpha = new GuiCheckBox(callBackBlendAlphaState, 40, 40);
        this.checkboxAutoSelect = new GuiCheckBox(() => toolSelector.field.layer().repaint = true, 40, 40, true);
        this.checkboxAllowDropOutsideSelection = new GuiCheckBox((event) => {
            toolSelector.field.state.allowDropOutsideSelection = event.checkBox.checked;
        }, 40, 40);
        this.checkBoxBlendAlpha.checked = true;
        this.checkBoxBlendAlpha.refresh();
        this.localLayout.addElement(new GuiSpacer([200, 5]));
        this.localLayout.addElement(new GuiLabel("Only drag\none color:", 150, 16, GuiTextBox.bottom | GuiTextBox.left, 40));
        this.localLayout.addElement(this.checkBox);
        this.localLayout.addElement(new GuiLabel("Blend alpha\nwhen dropping:", 150, 16, GuiTextBox.bottom | GuiTextBox.left, 40));
        this.localLayout.addElement(this.checkBoxBlendAlpha);
        this.localLayout.addElement(new GuiLabel("Auto select\nwhen dragging:", 150, 16, GuiTextBox.bottom | GuiTextBox.left, 40));
        this.localLayout.addElement(this.checkboxAutoSelect);
        this.localLayout.addElement(new GuiLabel("Allow dropping\noutside select:", 150, 16, GuiTextBox.bottom | GuiTextBox.left, 40));
        this.localLayout.addElement(this.checkboxAllowDropOutsideSelection);
    }
    activateOptionPanel() {
        super.activateOptionPanel();
        this.checkboxAllowDropOutsideSelection.checked = this.toolSelector.field.state.allowDropOutsideSelection;
    }
}
;
class OutlineTool extends ExtendedTool {
    constructor(name, imagePath, toolSelector, optionPanes = []) {
        super(name, imagePath, optionPanes, [200, 110]);
        this.checkboxOnlyOneColor = new GuiCheckBox(() => { }, 40, 40, false);
        this.localLayout.addElement(new GuiLabel("Outline tool:", 200, 16, GuiTextBox.bottom | GuiTextBox.left));
        this.localLayout.addElement(new GuiLabel("Outline only one color:", 200, 16, GuiTextBox.bottom | GuiTextBox.left));
        this.localLayout.addElement(this.checkboxOnlyOneColor);
    }
}
;
class RotateTool extends ExtendedTool {
    constructor(name, imagePath, callBack, callBackAntiAlias, optionPanes = [], toolSelector) {
        super(name, imagePath, optionPanes, [200, 230], [70, 40], [1, 23]);
        this.toolSelector = toolSelector;
        this.checkBox = new GuiCheckBox(callBack, 40, 40);
        this.checkBoxAntiAlias = new GuiCheckBox(callBackAntiAlias, 40, 40);
        this.checkboxAutoSelect = new GuiCheckBox(() => toolSelector.field.layer().repaint = true, 40, 40, true);
        this.checkBoxAntiAlias.checked = true;
        this.checkBoxAntiAlias.refresh();
        this.checkboxAllowDropOutsideSelection = new GuiCheckBox((event) => {
            toolSelector.field.state.allowDropOutsideSelection = event.checkBox.checked;
        }, 40, 40, false);
        this.localLayout.addElement(new GuiLabel("Only rotate adjacent\npixels of same color:", 200, 16, GuiTextBox.bottom | GuiTextBox.left, 50));
        this.localLayout.addElement(this.checkBox);
        this.localLayout.addElement(new GuiSpacer([100, 50]));
        this.localLayout.addElement(new GuiLabel("anti-alias\nrotation:", 90, 16, GuiTextBox.bottom | GuiTextBox.left, 40));
        this.localLayout.addElement(this.checkBoxAntiAlias);
        this.localLayout.addElement(new GuiLabel("Auto select:\n ", 150, 16, GuiTextBox.bottom | GuiTextBox.left, 40));
        this.localLayout.addElement(this.checkboxAutoSelect);
        this.localLayout.addElement(new GuiLabel("Allow dropping\noutside select:", 150, 16, GuiTextBox.bottom | GuiTextBox.left, 40));
        this.localLayout.addElement(this.checkboxAllowDropOutsideSelection);
    }
    activateOptionPanel() {
        super.activateOptionPanel();
        this.checkboxAllowDropOutsideSelection.checked = this.toolSelector.field.state.allowDropOutsideSelection;
    }
}
;
class UndoRedoTool extends ExtendedTool {
    constructor(toolSelector, name, imagePath, callback) {
        super(name, imagePath, [], [200, 100], [4, 12]);
        this.localLayout.addElement(new GuiLabel("Slow mode(undo/redo):", 200));
        this.localLayout.addElement(new GuiCheckBox(callback, 40, 40));
        this.stackFrameCountLabel = new GuiLabel(`Redo: ${0}\nUndo: ${0}`, 100, 16, GuiTextBox.bottom, 40);
        this.localLayout.addElement(this.stackFrameCountLabel);
    }
    updateLabel(redo, undo) {
        this.stackFrameCountLabel.setText(`Redo: ${redo}\nUndo: ${undo}`);
    }
}
;
class FillTool extends ExtendedTool {
    constructor(name, path, optionPanes, updateIgnoreSameColorBoundaries) {
        super(name, path, optionPanes, [200, 100], [30, 10]);
        this.checkNonContiguous = new GuiCheckBox(updateIgnoreSameColorBoundaries);
        this.localLayout.addElement(new GuiLabel("Fill Options:", 200, 16, GuiTextBox.bottom, 35));
        this.localLayout.addElement(new GuiLabel("Non\nContiguous:", 130, 16, GuiTextBox.bottom, 35));
        this.localLayout.addElement(this.checkNonContiguous);
    }
}
;
class PenViewTool extends ViewLayoutTool {
    constructor(pen, name, path) {
        super(pen.getOptionPanel(), name, path);
        this.pen = pen;
    }
}
;
class PenTool extends ExtendedTool {
    constructor(strokeWith, toolName = "pen", pathToImage = ["images/penSprite.png"], optionPanes, field, dimLocal = [200, 160]) {
        super(toolName, pathToImage, optionPanes, [200, 200], [2, 30], [1, 160]);
        this.layoutManager.pixelDim = [200, 600];
        this.lineWidth = strokeWith;
        this.checkboxPixelPerfect = new GuiCheckBox(() => {
            field.state.lineWidth = 1;
            this.lineWidth = 1;
        }, 40, 40, false);
        this.tbSize = new GuiTextBox(true, 80, null, 16, 35, GuiTextBox.default, (event) => {
            if (!event.textbox.asNumber.get() && event.textbox.text.length > 1) {
                return false;
            }
            else if (event.textbox.asNumber.get() > 128) {
                event.textbox.setText("128");
            }
            return true;
        });
        this.tbSize.promptText = "Enter line width:";
        this.tbSize.setText(String(this.lineWidth));
        this.btUpdate = new GuiButton(() => {
            this.lineWidth = this.tbSize.asNumber.get() ? (this.tbSize.asNumber.get() <= 128 ? this.tbSize.asNumber.get() : 128) : this.lineWidth;
            this.tbSize.setText(String(this.lineWidth));
        }, "Update", 75, this.tbSize.height(), 16);
        this.tbSize.submissionButton = this.btUpdate;
        this.localLayout.addElement(new GuiLabel("Line width:", 200, 16, GuiTextBox.bottom));
        this.localLayout.addElement(this.tbSize);
        this.localLayout.addElement(this.btUpdate);
        this.localLayout.addElement(new GuiLabel("Round\npen tip:", 90, 16, GuiTextBox.bottom, 40));
        this.localLayout.addElement(PenTool.checkDrawCircular);
        this.localLayout.addElement(new GuiLabel("Pixel\nperfect:", 90, 16, GuiTextBox.bottom, 40));
        this.localLayout.addElement(this.checkboxPixelPerfect);
    }
    activateOptionPanel() {
        this.layoutManager.activate();
        //this.tbSize.activate(); this.tbSize.refresh(); 
    }
    deactivateOptionPanel() {
        this.layoutManager.deactivate();
        //this.tbSize.refresh();
    }
    getOptionPanel() {
        return this.layoutManager;
    }
    optionPanelSize() {
        return [this.layoutManager.width(), this.layoutManager.height()];
    }
    drawOptionPanel(ctx, x, y) {
        const optionPanel = this.getOptionPanel();
        optionPanel.x = x;
        optionPanel.y = y;
        optionPanel.draw(ctx, x, y);
    }
    penSize() {
        return this.lineWidth;
    }
}
PenTool.checkboxSprayPaint = new GuiCheckBox(null, 40, 40);
PenTool.checkDrawCircular = new GuiCheckBox(null, 40, 40);
;
class SprayCanTool extends PenTool {
    constructor(strokeWidth, toolName, pathToImage, callBack, optionPanes, field) {
        super(strokeWidth, toolName, pathToImage, optionPanes, field, [200, 155]);
        this.tbProbability = new GuiSlider(1, [100, 40], (event) => {
            callBack(this.tbProbability);
        });
        this.btUpdate.callback = () => {
            this.lineWidth = this.tbSize.asNumber.get() ? (this.tbSize.asNumber.get() <= 128 ? this.tbSize.asNumber.get() : 128) : this.lineWidth;
            this.tbSize.setText(String(this.lineWidth));
            callBack(this.tbProbability);
        };
        this.localLayout.addElement(new GuiLabel("Spray\nprob:", 99, 16, GuiTextBox.bottom | GuiTextBox.left, 40));
        this.localLayout.addElement(this.tbProbability);
    }
}
;
class CustomBackgroundSlider extends GuiSlider {
    constructor(state, dim, movedCallBack, refreshBackgroundCallBack) {
        super(state, dim, movedCallBack);
        this.refreshBackground = refreshBackgroundCallBack;
    }
    refresh() {
        super.refresh();
        if (!this.backgroundCanvas) {
            this.backgroundCanvas = document.createElement("canvas");
            this.backctx = this.canvas.getContext("2d");
        }
        if (this.backgroundCanvas.width !== this.canvas.width || this.backgroundCanvas.height !== this.canvas.height) {
            this.backgroundCanvas.width = this.canvas.width;
            this.backgroundCanvas.height = this.canvas.height;
            this.backctx = this.backgroundCanvas.getContext("2d");
        }
        const bounds = this.getBounds();
        this.backctx.clearRect(0, 0, this.width(), this.height());
        if (this.refreshBackground)
            this.refreshBackground(this.backctx, bounds[0], bounds[1], bounds[2], bounds[3]);
    }
    draw(ctx, x, y, offsetX, offsetY) {
        ctx.drawImage(this.backgroundCanvas, x + offsetX, y + offsetY);
        super.draw(ctx, x, y, offsetX, offsetY);
    }
}
;
class ColorPickerTool extends ExtendedTool {
    constructor(field, toolName = "color picker", pathToImage = ["images/colorPickerSprite.png"], optionPanes = []) {
        super(toolName, pathToImage, optionPanes, [200, 220], [4, 50]);
        this.field = field;
        this.chosenColor = new GuiColoredSpacer([100, 32], new RGB(0, 0, 0, 255));
        field.toolSelector.repaint = true;
        this.tbColor = new GuiTextBox(true, 200, null, 16, 32, GuiTextBox.default, (e) => {
            const color = new RGB(0, 0, 0, 0);
            const code = color.loadString(e.textbox.text);
            if (code === 2) //overflow
             {
                e.textbox.text = (color.htmlRBGA());
            }
            else if (code === 1) //parse error
             {
                return false;
            }
            this.chosenColor.color.copy(color);
            field.toolSelector.repaint = true;
            return true;
        });
        this.tbColor.promptText = "Enter RGBA color here (RGB 0-255 A 0-1):";
        this.btUpdate = new GuiButton(() => {
            const color = new RGB(0, 0, 0, 0);
            const code = color.loadString(this.tbColor.text);
            if (code === 0) {
                this.field.layer().palette.setSelectedColor(this.tbColor.text);
                this.field.layer().state.color = this.field.layer().palette.selectedPixelColor;
            }
            else if (code === 2) {
                this.field.layer().palette.setSelectedColor(color.htmlRBGA());
                this.field.layer().state.color = this.field.layer().palette.selectedPixelColor;
            }
            else {
                this.tbColor.setText(this.field.layer().palette.selectedPixelColor.htmlRBGA());
            }
            this.setColorText();
        }, "Update", 75, this.tbColor.height(), 16);
        this.tbColor.submissionButton = this.btUpdate;
        const colorSlideEvent = (event) => {
            const color = new RGB(0, 0, 0, 0);
            color.setByHSL(this.hueSlider.state * 360, this.saturationSlider.state, this.lightnessSlider.state);
            color.setAlpha(this.alphaSlider.state * 255);
            field.pallette.selectedPixelColor.copy(color);
            this.color().copy(color);
            this._setColorText();
            this.hueSlider.refresh();
            this.saturationSlider.refresh();
            this.lightnessSlider.refresh();
            this.alphaSlider.refresh();
        };
        this.hueSlider = new CustomBackgroundSlider(0, [150, 25], colorSlideEvent, (ctx, x, y, width, height) => {
            const color = new RGB(0, 0, 0, 0);
            if (this.color()) {
                const hsl = [this.hueSlider.state * 360, this.saturationSlider.state, this.lightnessSlider.state];
                const unitStep = 1 / width;
                let i = 0;
                for (let j = 0; j < 1; j += unitStep) {
                    hsl[0] = j * 360;
                    color.setByHSL(hsl[0], hsl[1], hsl[2]);
                    color.setAlpha(this.color().alpha());
                    ctx.fillStyle = color.htmlRBGA();
                    ctx.fillRect(j * width + x, y, unitStep * width, height);
                }
            }
        });
        this.saturationSlider = new CustomBackgroundSlider(1, [150, 25], colorSlideEvent, (ctx, x, y, width, height) => {
            const color = new RGB(0, 0, 0, 0);
            if (this.color()) {
                const hsl = [this.hueSlider.state * 360, this.saturationSlider.state, this.lightnessSlider.state];
                const unitStep = 1 / width;
                let i = 0;
                for (let j = 0; j < 1; j += unitStep) {
                    color.setByHSL(hsl[0], j, hsl[2]);
                    color.setAlpha(this.color().alpha());
                    ctx.fillStyle = color.htmlRBGA();
                    ctx.fillRect(j * width + x, y, unitStep * width, height);
                }
            }
        });
        this.lightnessSlider = new CustomBackgroundSlider(0, [150, 25], colorSlideEvent, (ctx, x, y, width, height) => {
            const color = new RGB(0, 0, 0, 0);
            if (this.color()) {
                const hsl = [this.hueSlider.state * 360, this.saturationSlider.state, this.lightnessSlider.state];
                const unitStep = 1 / width;
                let i = 0;
                for (let j = 0; j < 1; j += unitStep, i++) {
                    hsl[2] = j;
                    color.setByHSL(hsl[0], hsl[1], hsl[2]);
                    color.setAlpha(this.color().alpha());
                    ctx.fillStyle = color.htmlRBGA();
                    ctx.fillRect(i + x, y, unitStep * width, height);
                }
            }
        });
        this.alphaSlider = new CustomBackgroundSlider(1, [150, 25], colorSlideEvent, (ctx, x, y, width, height) => {
            const color = new RGB(0, 0, 0, 0);
            if (this.color()) {
                color.setByHSL(this.hueSlider.state * 360, this.saturationSlider.state, this.lightnessSlider.state);
                const unitStep = width / 255;
                for (let j = 0; j < width; j += unitStep) {
                    color.setAlpha(j);
                    ctx.fillStyle = color.htmlRBGA();
                    ctx.fillRect(j + x, y, unitStep, height);
                }
            }
        });
        this.localLayout.addElement(new GuiLabel("Color:", 100, 16));
        this.localLayout.addElement(this.chosenColor);
        this.localLayout.addElement(this.tbColor);
        this.localLayout.addElement(this.btUpdate);
        const slidersLayout = new SimpleGridLayoutManager([4, 30], [200, 110]);
        slidersLayout.addElement(new GuiLabel("Hue", 50, 16, GuiTextBox.bottom, 25));
        slidersLayout.addElement(this.hueSlider);
        slidersLayout.addElement(new GuiLabel("Sat", 50, 16, GuiTextBox.bottom, 25));
        slidersLayout.addElement(this.saturationSlider);
        slidersLayout.addElement(new GuiLabel("light", 50, 16, GuiTextBox.bottom, 25));
        slidersLayout.addElement(this.lightnessSlider);
        slidersLayout.addElement(new GuiLabel("ap", 50, 16, GuiTextBox.bottom, 25));
        slidersLayout.addElement(this.alphaSlider);
        this.localLayout.addElement(slidersLayout);
        this.setColorText();
    }
    color() {
        return this.field.layer().state.color;
    }
    setColorText() {
        const color = this._setColorText();
        const hsl = color.toHSL();
        this.hueSlider.setState(hsl[0] / 360);
        this.saturationSlider.setState(hsl[1]);
        this.lightnessSlider.setState(hsl[2]);
        this.alphaSlider.setState(color.alpha() / 255);
        this.field.toolSelector.repaint = true;
    }
    _setColorText() {
        const color = new RGB(0, 0, 0);
        if (this.color())
            color.copy(this.color());
        this.chosenColor.color.copy(color);
        this.tbColor.setText(color.htmlRBGA());
        this.field.toolSelector.repaint = true;
        return color;
    }
    activateOptionPanel() { this.layoutManager.activate(); }
    deactivateOptionPanel() { this.layoutManager.deactivate(); }
    getOptionPanel() {
        return this.layoutManager;
    }
    optionPanelSize() {
        return [this.layoutManager.width(), this.layoutManager.height()];
    }
    drawOptionPanel(ctx, x, y) {
        const optionPanel = this.getOptionPanel();
        optionPanel.x = x;
        optionPanel.y = y;
        optionPanel.draw(ctx, x, y);
    }
}
;
class DrawingScreenSettingsTool extends ExtendedTool {
    constructor(dim = [524, 524], field, toolName, pathToImage, optionPanes) {
        super(toolName, pathToImage, optionPanes, [200, 300], [4, 50]);
        this.dim = dim;
        this.field = field;
        this.checkBoxResizeImage = new GuiCheckBox(() => field.state.resizeSprite = this.checkBoxResizeImage.checked, 40, 40);
        this.checkBoxResizeImage.checked = false;
        this.checkBoxResizeImage.refresh();
        this.btUpdate = new GuiButton(() => {
            this.recalcDim();
            if (this.textboxPaletteSize.asNumber.get()) {
                if (this.textboxPaletteSize.asNumber.get() < 128)
                    field.pallette.changeSize(this.textboxPaletteSize.asNumber.get());
                else
                    field.toolSelector.toolBar.setImagesIndex(+!this.selected);
            }
        }, "Update", 75, 40, 16);
        this.textboxPaletteSize = new GuiTextBox(true, 80, this.btUpdate, 16, this.btUpdate.height(), GuiTextBox.default, (event) => {
            if (!event.textbox.asNumber.get() && event.textbox.text.length > 1) {
                return false;
            }
            return true;
        });
        this.textboxPaletteSize.promptText = "Enter a new size for the palette.";
        this.textboxPaletteSize.setText(field.pallette.colors.length.toString());
        this.tbX = new GuiTextBox(true, 70, null, 16, 35, GuiTextBox.default, (event) => {
            if (!event.textbox.asNumber.get() && event.textbox.text.length > 1) {
                return false;
            }
            return true;
        });
        this.tbX.promptText = "Enter width:";
        this.tbX.setText(String(this.dim[0]));
        this.tbY = new GuiTextBox(true, 70, null, 16, 35, GuiTextBox.default, (event) => {
            if (!event.textbox.asNumber.get() && event.textbox.text.length > 1) {
                return false;
            }
            return true;
        }); //, null, 16, 100);
        this.tbY.promptText = "Enter height:";
        this.tbY.setText(String(this.dim[1]));
        this.sliderMiniMapTransparency = new GuiSlider(field.miniMapAlpha, [100, 50], (event) => {
            field.miniMapAlpha = event.value;
        });
        this.tbX.submissionButton = this.btUpdate;
        this.tbY.submissionButton = this.btUpdate;
        this.checkboxPixelGrid = new GuiCheckBox((e) => { field.layer().repaint = true; }, 40, 40);
        this.localLayout.addElement(new GuiLabel("Sprite Resolution:", 200, 16, GuiTextBox.top, 20));
        this.localLayout.addElement(new GuiLabel("Width:", 90, 16));
        this.localLayout.addElement(new GuiLabel("Height:", 90, 16));
        this.localLayout.addElement(this.tbX);
        this.localLayout.addElement(this.tbY);
        //this.localLayout.addElement(new GuiSpacer([85, 10]));
        this.localLayout.addElement(new GuiLabel("Resize\nsprite:", 80, 16, GuiTextBox.bottom, this.btUpdate.height()));
        this.localLayout.addElement(this.checkBoxResizeImage);
        //this.localLayout.addElement(new GuiSpacer([100, 40]));
        this.localLayout.addElement(new GuiLabel("map\nalpha:", 100, 16));
        this.localLayout.addElement(this.sliderMiniMapTransparency);
        this.localLayout.addElement(new GuiLabel("palette\nsize:", 100, 16, GuiTextBox.bottom, 40));
        this.localLayout.addElement(this.textboxPaletteSize);
        this.localLayout.addElement(this.btUpdate);
        this.localLayout.addElement(new GuiLabel("Show grid?", 100, 16, GuiTextBox.bottom, 40));
        this.localLayout.addElement(this.checkboxPixelGrid);
    }
    setDim(dim) {
        this.tbX.setText(dim[0].toString());
        this.tbY.setText(dim[1].toString());
        this.dim = [dim[0], dim[1]];
    }
    activateOptionPanel() { this.layoutManager.activate(); }
    deactivateOptionPanel() { this.layoutManager.deactivate(); }
    getOptionPanel() {
        return this.layoutManager;
    }
    recalcDim() {
        let x = this.dim[0];
        let y = this.dim[1];
        if (this.tbX.asNumber.get())
            x = this.tbX.asNumber.get();
        if (this.tbY.asNumber.get())
            y = this.tbY.asNumber.get();
        this.dim = [x, y];
        this.field.setDimOnCurrent(this.dim);
    }
    optionPanelSize() {
        return [this.layoutManager.width(), this.layoutManager.height()];
    }
    drawOptionPanel(ctx, x, y) {
        const optionPanel = this.getOptionPanel();
        optionPanel.x = x;
        optionPanel.y = y;
        optionPanel.draw(ctx, x, y);
    }
}
;
class ClipBoard {
    constructor(canvas, keyboardHandler, pixelCountX, pixelCountY) {
        this.repaint = true;
        this.canvas = document.createElement("canvas");
        this.offscreenCanvas = document.createElement("canvas");
        this.offscreenCtx = this.offscreenCanvas.getContext("2d");
        this.focused = false;
        this.canvas.height = pixelCountX;
        this.canvas.width = pixelCountY;
        this.ctx = this.canvas.getContext("2d");
        this.sprite = new Sprite([new RGB(0, 0, 0, 0)], pixelCountX, pixelCountY);
        this.angle = 0;
    }
    active() {
        return this.focused;
    }
    deactivate() {
        this.focused = false;
    }
    activate() {
        this.focused = true;
    }
    width() {
        return this.canvas.width;
    }
    height() {
        return this.canvas.height;
    }
    refresh() {
        this.repaint = true;
    }
    handleKeyBoardEvents(type, e) {
    }
    handleTouchEvents(type, e) {
        if (this.active() && type === "touchstart") {
            //if(this.clipBoardBuffer.length)
            {
                this.rotate(Math.PI / 2);
                this.repaint = true;
            }
        }
    }
    isLayoutManager() {
        return false;
    }
    resize(dim) {
        if (dim.length === 2) {
            this.repaint = true;
            this.refreshImageFromBuffer();
        }
    }
    //only really works for rotation by pi/2
    rotate(theta) {
        const newSprite = new Sprite([], this.sprite.height, this.sprite.width);
        for (let i = 0; i < this.sprite.pixels.length >> 2; i++) {
            let x = i % this.sprite.width;
            let y = Math.floor(i / this.sprite.width);
            const x_old = x;
            x = Math.floor(-y);
            y = Math.floor(x_old);
            newSprite.fillRect(new RGB(this.sprite.pixels[i << 2], this.sprite.pixels[(i << 2) + 1], this.sprite.pixels[(i << 2) + 2], this.sprite.pixels[(i << 2) + 3]), x, y, 1, 1);
        }
        this.sprite = newSprite;
        const temp = this.offscreenCanvas.width;
        this.offscreenCanvas.width = this.offscreenCanvas.height;
        this.offscreenCanvas.height = temp;
        this.refreshImageFromBuffer();
    }
    loadSprite(sprite) {
        this.sprite.copySprite(sprite);
        this.offscreenCanvas.width = sprite.width;
        this.offscreenCanvas.height = sprite.height;
        this.offscreenCtx = this.offscreenCanvas.getContext("2d");
        this.refreshImageFromBuffer();
    }
    //copies array of rgb values to canvas offscreen, centered within the canvas
    refreshImageFromBuffer() {
        this.sprite.refreshImage();
        this.repaint = true;
    }
    draw(ctx = this.ctx, x = 0, y = 0) {
        if (this.repaint) {
            this.repaint = false;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.offscreenCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.offscreenCtx.drawImage(this.sprite.image, 0, 0);
            if (this.offscreenCanvas.width / this.offscreenCanvas.height <= 1) {
                const width = this.canvas.width * this.offscreenCanvas.width / this.offscreenCanvas.height;
                const height = this.canvas.height;
                const x = this.canvas.width / 2 - width / 2;
                const y = this.canvas.height / 2 - height / 2;
                this.ctx.drawImage(this.offscreenCanvas, x, y, width, height);
            }
            else {
                const width = this.canvas.width;
                const height = this.canvas.height * this.offscreenCanvas.height / this.offscreenCanvas.width;
                const x = this.canvas.width / 2 - width / 2;
                const y = this.canvas.height / 2 - height / 2;
                this.ctx.drawImage(this.offscreenCanvas, x, y, width, height);
            }
        }
        ctx.drawImage(this.canvas, x, y);
    }
}
;
class CopyPasteTool extends ExtendedTool {
    constructor(name, path, optionPanes, clipBoard, updateBlendAlpha, toolSelector) {
        super(name, path, optionPanes, [200, clipBoard.height() + 200], [8, 20], [1, 30]);
        this.blendAlpha = new GuiCheckBox(updateBlendAlpha, 40, 40);
        this.buttonCopySelection = new GuiButton(() => {
            const clipBoardSprite = toolSelector.field.layer().maskToSprite();
            toolSelector.field.layer().clipBoard.loadSprite(clipBoardSprite);
            toolSelector.field.layer().repaint = true;
        }, "Copy from selection", 190, 40, 16);
        this.blendAlpha.checked = true;
        this.blendAlpha.refresh();
        this.localLayout.addElement(new GuiLabel("Clipboard:", 200, 16));
        this.localLayout.addElement(clipBoard);
        this.localLayout.addElement(new GuiLabel("Preserve\ntransparency:", 200, 16, GuiTextBox.bottom | GuiTextBox.left, 40));
        this.localLayout.addElement(this.blendAlpha);
        this.localLayout.addElement(new GuiSpacer([75, 40]));
        this.localLayout.addElement(this.buttonCopySelection);
    }
}
;
class LayerManagerTool extends Tool {
    constructor(name, path, field, limit = 16) {
        super(name, path);
        this.field = field;
        this.layersLimit = isTouchSupported() ? limit - Math.floor(limit / 4) : limit;
        this.layoutManager = new SimpleGridLayoutManager([2, 24], [200, 640]);
        this.list = new GuiCheckList([1, this.layersLimit], [200, 520], 20, (x1, x2) => {
            if (this.field.layers[x1] && this.field.layers[x2]) {
                this.field.swapLayers(x1, x2);
            }
        }, (event) => {
            const index = this.list.list.findIndex(element => element.slider === event.element);
            if (field.layers[index]) {
                field.layers[index].drawWithAlpha = event.value;
                field.layers[index].repaint = true;
            }
        });
        this.buttonAddLayer = new GuiButton(() => { this.pushList(`l${this.runningId++}`); }, "Add Layer", 99, 40, 16);
        this.layoutManager.addElement(new GuiLabel("Layers list:", 200));
        this.layoutManager.addElement(this.list);
        this.layoutManager.addElement(this.buttonAddLayer);
        this.layoutManager.addElement(new GuiButton(() => this.deleteItem(), "Delete", 99, 40, 16));
        for (let i = 0; i < field.layers.length; i++) {
            this.pushList(`l${i}`);
        }
        this.runningId = field.layers.length;
        this.list.refresh();
    }
    deleteItem(index = this.field.selected) {
        if (this.field.layers.length > 1 && this.field.layers[index]) {
            this.list.delete(index);
            this.field.deleteLayer(index);
        }
    }
    pushList(text) {
        if (this.field.layers.length < this.layersLimit) {
            let layer;
            if (this.field.layers.length <= this.list.list.length)
                layer = this.field.addBlankLayer();
            else if (this.field.layers[this.list.list.length])
                layer = this.field.layers[this.list.list.length];
            else
                console.log("Error field layers out of sync with layers tool");
            this.list.push(text, true, (e) => {
                const index = this.list.findBasedOnCheckbox(e.checkBox);
                //this.list.get(index).textBox.activate();
                if (e.checkBox.checked)
                    this.field.selected = index;
                if (this.field.layers[index]) {
                    this.field.layersState[index] = e.checkBox.checked;
                    this.field.layer().repaint = true;
                }
                else
                    console.log("Error changing layer state");
            }, (e) => {
                this.field.selected = this.list.selected();
                this.list.list.forEach(el => el.textBox.deactivate());
                if (this.list.selectedItem() && this.list.selectedItem().checkBox.checked)
                    this.list.selectedItem().textBox.activate();
            });
            this.list.refresh();
        }
    }
    activateOptionPanel() { this.layoutManager.activate(); }
    deactivateOptionPanel() { this.layoutManager.deactivate(); }
    getOptionPanel() {
        return this.layoutManager;
    }
    optionPanelSize() {
        return [this.layoutManager.canvas.width, this.layoutManager.canvas.height];
    }
    drawOptionPanel(ctx, x, y) {
        const optionPanel = this.getOptionPanel();
        optionPanel.x = x;
        optionPanel.y = y;
        optionPanel.draw(ctx, x, y);
    }
}
;
class ScreenTransformationTool extends ExtendedTool {
    constructor(toolName, toolImagePath, optionPanes, field) {
        super(toolName, toolImagePath, optionPanes, [200, 115], [20, 60]);
        this.localLayout.addElement(new GuiLabel("Zoom:", 100));
        this.buttonUpdateZoom = new GuiButton(() => {
            let ratio = 1;
            if (this.textBoxZoom.asNumber.get()) {
                ratio = this.textBoxZoom.asNumber.get() / field.zoom.zoomX;
                field.zoom.zoomX = this.textBoxZoom.asNumber.get();
                field.zoom.zoomY = field.zoom.zoomY * ratio;
            }
        }, "Set Zoom", 100, 40, 16);
        this.buttonZoomToScreen = new GuiButton(() => {
            field.zoomToScreen();
            this.textBoxZoom.setText((Math.round(field.zoom.zoomX * 100) / 100).toString());
        }, "Auto Zoom", 95, 40, 16);
        this.textBoxZoom = new GuiTextBox(true, 70, this.buttonUpdateZoom, 16, 32);
        this.textBoxZoom.setText(field.zoom.zoomX.toString());
        this.localLayout.addElement(this.textBoxZoom);
        this.localLayout.addElement(this.buttonUpdateZoom);
        this.localLayout.addElement(this.buttonZoomToScreen);
        this.localLayout.addElement(new GuiButton(() => { field.zoom.offsetX = 0; field.zoom.offsetY = 0; }, "Center Screen", 140, 40, 16));
    }
}
;
class FilesManagerTool extends ExtendedTool {
    constructor(name, path, optionPanes, field) {
        super(name, path, optionPanes, [200, 600], [2, 60]);
        this.savePng = new GuiButton(() => { field.saveToFile(this.pngName.text); }, "Save PNG", 85, 35, 16);
        this.pngName = new GuiTextBox(true, 200, this.savePng, 16, 35, GuiTextBox.bottom, (event) => {
            if (event.textbox.text.substring(event.textbox.text.length - 4, event.textbox.text.length) !== ".png") {
                return false;
            }
            return true;
        });
        this.saveGif = new GuiButton(() => {
            field.toolSelector.animationsGroupsSelector.selectedAnimation().toGifBlob(blob => {
                saveBlob(blob, this.gifName.text);
            });
        }, "Save Gif", 85, 35, 16);
        this.gifName = new GuiTextBox(true, 200, this.saveGif, 16, 35, GuiTextBox.bottom, (event) => {
            if (event.textbox.text.substring(event.textbox.text.length - 4, event.textbox.text.length) !== ".gif") {
                return false;
            }
            return true;
        });
        this.saveProject = new GuiButton(() => {
            field.toolSelector.animationsGroupsSelector.saveAs(this.projectName.text);
        }, "Save Project", 125, 35, 16);
        this.projectName = new GuiTextBox(true, 200, this.saveProject, 16, 35, GuiTextBox.bottom, (event) => {
            if (event.textbox.text.substring(event.textbox.text.length - 5, event.textbox.text.length) !== ".proj") {
                return false;
            }
            return true;
        });
        this.saveSprites = new GuiButton(() => {
            const columns = this.tbXPartitions.asNumber.get();
            const rows = this.tbYPartitions.asNumber.get();
            if (columns && rows) {
                const width = Math.floor(field.layer().bounds.first / columns);
                const height = Math.floor(field.layer().bounds.second / rows);
                const animation = new SpriteAnimation(0, 0, width, height);
                if (field.toolSelector.animationsGroupsSelector.animationGroup())
                    field.toolSelector.animationsGroupsSelector.animationGroup().pushAnimation(animation);
                if (animation) {
                    for (let y = 0; y < rows; y++) {
                        for (let x = 0; x < columns; x++) {
                            animation.sprites.push(field.selectionToSprite(x * width, y * height, width, height));
                        }
                    }
                }
            }
        }, "Save Grid", 125, 35, 16);
        this.tbXPartitions = new GuiTextBox(true, 80, this.saveSprites, 16, 35, GuiTextBox.bottom, (event) => {
            if (!event.textbox.asNumber.get()) {
                return false;
            }
            return true;
        });
        ;
        this.tbYPartitions = new GuiTextBox(true, 80, this.saveSprites, 16, 35, GuiTextBox.bottom, (event) => {
            if (!event.textbox.asNumber.get()) {
                return false;
            }
            return true;
        });
        this.loadImage = new GuiButton(() => {
            const input = document.createElement('input');
            input.type = "file";
            input.addEventListener('change', (event) => {
                const fileList = event.target.files;
                const reader = new FileReader();
                reader.readAsDataURL(fileList[0]);
                reader.onload = (() => {
                    const img = new Image();
                    img.onload = () => {
                        field.toolSelector.layersTool.pushList(`l${field.toolSelector.layersTool.runningId++}`);
                        field.loadImageToLayer(img);
                        field.setDimOnCurrent([img.width, img.height]);
                    };
                    img.src = reader.result;
                });
            });
            input.click();
        }, "Load Image", 125, 35, 16);
        this.loadProject = new GuiButton(() => {
            const input = document.createElement('input');
            input.type = "file";
            input.addEventListener('change', (event) => {
                const fileList = event.target.files;
                const reader = new FileReader();
                fileList[0].arrayBuffer().then((buffer) => {
                    const binary = new Uint32Array(buffer);
                    field.toolSelector.animationsGroupsSelector.buildFromBinary(binary);
                });
            });
            input.click();
        }, "Load Project", 125, 35, 16);
        this.gifName.setText("myFirst.gif");
        this.pngName.setText("myFirst.png");
        this.projectName.setText("myFirst.proj");
        this.localLayout.addElement(new GuiLabel("Save Screen as:", 200, 16, GuiTextBox.bottom));
        this.localLayout.addElement(this.pngName);
        this.localLayout.addElement(this.savePng);
        this.localLayout.addElement(new GuiLabel("Save selected\nanimation as gif:", 200, 16, GuiTextBox.bottom, 50));
        this.localLayout.addElement(this.gifName);
        this.localLayout.addElement(this.saveGif);
        this.localLayout.addElement(new GuiLabel("Save project to a file:", 200, 16, GuiTextBox.bottom, 35));
        this.localLayout.addElement(this.projectName);
        this.localLayout.addElement(this.saveProject);
        this.localLayout.addElement(new GuiLabel("Save screen as grid\nto sprites:", 200, 16, GuiTextBox.bottom, 50));
        this.localLayout.addElement(this.tbXPartitions);
        this.localLayout.addElement(this.tbYPartitions);
        this.localLayout.addElement(this.saveSprites);
        this.localLayout.addElement(new GuiSpacer([200, 20]));
        this.localLayout.addElement(this.loadImage);
        this.localLayout.addElement(this.loadProject);
    }
}
;
class SelectionTool extends ExtendedTool {
    constructor(name, path, optionPanes, toolSelector) {
        super(name, path, optionPanes, [200, 210], [1, 20]);
        this.checkboxComplexPolygon = new GuiCheckBox(() => { toolSelector.polygon = []; toolSelector.field.state.selectionSelectionRect = [0, 0, 0, 0]; toolSelector.field.clearBitMask(); toolSelector.field.layer().repaint = true; }, 40, 40, true);
        this.toolSelector = toolSelector;
        this.localLayout.addElement(new GuiLabel("Polygonal selector:", 200, 16, GuiTextBox.bottom, 40));
        this.localLayout.addElement(this.checkboxComplexPolygon);
        this.localLayout.addElement(new GuiSpacer([200, 10]));
        this.localLayout.addElement(new GuiButton(() => { toolSelector.polygon = [], toolSelector.field.state.selectionSelectionRect = [0, 0, 0, 0]; toolSelector.field.clearBitMask(); toolSelector.field.layer().repaint = true; }, "Reset Selection", 150, 40, 16));
        this.localLayout.addElement(new GuiButton(() => { toolSelector.polygon.pop(), toolSelector.field.state.selectionSelectionRect = [0, 0, 0, 0]; toolSelector.field.scheduleUpdateMaskPolygon(toolSelector.polygon); toolSelector.field.layer().repaint = true; }, "Undo last point", 150, 40, 16));
    }
}
;
//megadrive mode adds 6 colors to palette, restricts color selection to 8 red 8 green 8 blue, and 1 transparent color
class ToolSelector {
    constructor(pallette, keyboardHandler, drawingScreenListener, imgWidth = 64, imgHeight = 64) {
        this.lastDrawTime = Date.now();
        this.polygon = [];
        this.animationsGroupsSelector = null;
        const field = new LayeredDrawingScreen(keyboardHandler, pallette);
        field.toolSelector = this;
        field.addBlankLayer();
        this.field = field;
        this.previewScreen = new DrawingScreen(document.createElement("canvas"), field.keyboardHandler, pallette, [0, 0], [128, 128], this, field.state, field.clipBoard);
        this.toolBar = new GuiToolBar([64, 64], []);
        this.toolBar.activate();
        this.toolBar.toolRenderDim[1] = imgHeight;
        this.toolBar.toolRenderDim[0] = imgWidth;
        this.sprayPaint = false;
        this.repaint = false;
        this.toolPixelDim = [imgWidth, imgHeight * 10];
        this.canvas = document.createElement("canvas");
        this.externalCanvas = document.getElementById("tool_selector_screen");
        this.keyboardHandler = keyboardHandler;
        this.keyboardHandler.registerCallBack("keydown", (e) => true, event => {
            switch (event.code) {
                case ('KeyC'):
                    if (this.keyboardHandler.keysHeld["KeyC"] === 1) {
                        field.state.selectionRect = [0, 0, 0, 0];
                        field.state.pasteRect = [0, 0, 0, 0];
                    }
                    break;
                case ('KeyV'):
                    field.layer().paste();
                    break;
                case ('KeyU'):
                    field.layer().undoLast().then(() => field.layer().updateLabelUndoRedoCount());
                    break;
                case ('KeyR'):
                    field.layer().redoLast().then(() => field.layer().updateLabelUndoRedoCount());
                    break;
                case ("Space"):
                    event.preventDefault();
            }
        });
        this.keyboardHandler.registerCallBack("keydown", (e) => this.tool().getOptionPanel(), (e) => { this.tool().getOptionPanel().handleKeyBoardEvents("keydown", e); this.repaint = true; });
        this.keyboardHandler.registerCallBack("keyup", (e) => this.tool().getOptionPanel(), (e) => { this.tool().getOptionPanel().handleKeyBoardEvents("keyup", e); this.repaint = true; });
        this.keyboardHandler.registerCallBack("keydown", (e) => (e.code === "ArrowUp" || e.code === "ArrowDown" || e.code === "ArrowLeft" || e.code === "ArrowRight"), (e) => {
            const imgPerColumn = (this.canvas.height / this.toolBar.toolRenderDim[1]);
            if ((this.keyboardHandler.keysHeld["AltLeft"] || this.keyboardHandler.keysHeld["AltRight"]) && (document.activeElement.id === "body" || field.layer().canvas === document.activeElement || this.canvas === document.activeElement)) {
                e.preventDefault();
                let newToolIndex = this.selected();
                if (e.code === "ArrowUp") {
                    if (this.selected() !== 0)
                        newToolIndex--;
                    else
                        newToolIndex = this.toolBar.tools.length - 1;
                }
                else if (e.code === "ArrowDown") {
                    newToolIndex++;
                    newToolIndex %= this.toolBar.tools.length;
                }
                else if (e.code === "ArrowLeft") {
                    if (newToolIndex >= imgPerColumn)
                        newToolIndex -= imgPerColumn;
                    else
                        newToolIndex = 0;
                }
                else if (e.code === "ArrowRight") {
                    if (this.toolBar.tools.length - newToolIndex > imgPerColumn)
                        newToolIndex += imgPerColumn;
                    else
                        newToolIndex = this.toolBar.tools.length - 1;
                }
                if (this.tool() && this.selected() !== newToolIndex) {
                    this.tool().deactivateOptionPanel();
                    this.toolBar.selected = newToolIndex;
                    this.tool().activateOptionPanel();
                }
            }
            this.repaint = true;
        });
        this.touchListener = new SingleTouchListener(this.externalCanvas, true, true);
        this.touchListener.registerCallBack("touchstart", (e) => this.tool().getOptionPanel(), (e) => {
            this.transformEvent(e);
            this.tool().getOptionPanel().handleTouchEvents("touchstart", e);
            e.translateEvent(e, this.tool().getOptionPanel().x, this.tool().getOptionPanel().y);
            document.activeElement.blur();
            const previousTool = this.selected();
            const imgPerColumn = (this.canvas.height / this.toolBar.toolRenderDim[1]);
            const y = Math.floor(e.touchPos[1] / this.toolBar.toolRenderDim[1]);
            const x = Math.floor(e.touchPos[0] / this.toolBar.toolRenderDim[0]);
            const clicked = y + x * imgPerColumn;
            if (clicked >= 0 && clicked < this.toolBar.tools.length) {
                if (this.tool())
                    this.tool().deactivateOptionPanel();
                this.toolBar.handleTouchEvents("touchstart", e);
            }
            if (this.selectedToolName() === "undo") {
                field.layer().undoLast().then(() => this.undoTool.updateLabel(field.layer().undoneUpdatesStack.length(), field.layer().updatesStack.length()));
                this.toolBar.selected = previousTool;
            }
            else if (this.selectedToolName() === "redo") {
                field.layer().redoLast().then(() => this.undoTool.updateLabel(field.layer().undoneUpdatesStack.length(), field.layer().updatesStack.length()));
                this.toolBar.selected = previousTool;
            }
            if (this.tool()) {
                this.tool().activateOptionPanel();
            }
            this.invScaleEvent(e);
            this.repaint = true;
        });
        this.touchListener.registerCallBack("touchmove", (e) => this.tool().getOptionPanel(), (e) => {
            this.transformEvent(e);
            this.tool().getOptionPanel().handleTouchEvents("touchmove", e);
            e.translateEvent(e, this.tool().getOptionPanel().x, this.tool().getOptionPanel().y);
            this.repaint = true;
        });
        this.touchListener.registerCallBack("touchend", (e) => this.tool().getOptionPanel(), (e) => {
            this.transformEvent(e);
            this.tool().getOptionPanel().handleTouchEvents("touchend", e);
            e.translateEvent(e, this.tool().getOptionPanel().x, this.tool().getOptionPanel().y);
            this.repaint = true;
        });
        {
            //field.layer() listeners
            const colorBackup = new RGB(0, 0, 0, 0);
            this.drawingScreenListener = drawingScreenListener;
            this.drawingScreenListener.registerCallBack("touchstart", (e) => this.layersTool.list.selectedItem() && this.layersTool.list.selectedItem().checkBox.checked, (e) => {
                if (!e.button) {
                    field.layer().state.color = pallette.selectedPixelColor;
                    field.layer().toolSelector.colorPickerTool._setColorText();
                }
                else {
                    field.layer().state.color = (pallette.selectedBackColor);
                    field.layer().toolSelector.colorPickerTool._setColorText();
                }
                const touchPos = [this.field.zoom.invZoomX(e.touchPos[0]), this.field.zoom.invZoomY(e.touchPos[1])];
                const gx = Math.floor((touchPos[0] - field.layer().offset.first) / field.layer().bounds.first * field.layer().dimensions.first);
                const gy = Math.floor((touchPos[1] - field.layer().offset.second) / field.layer().bounds.second * field.layer().dimensions.second);
                //save for undo
                if (field.layer().updatesStack.length() === 0 || field.layer().updatesStack.get(field.layer().updatesStack.length() - 1).length) {
                    if (field.layer().toolSelector.selectedToolName() !== "redo" && field.layer().toolSelector.selectedToolName() !== "undo") {
                        field.layer().updatesStack.push(new Array());
                        field.layer().undoneUpdatesStack.empty();
                    }
                }
                document.activeElement.blur();
                if (field.layer().toolSelector.selectedToolName() != "paste") {
                    field.state.pasteRect = [0, 0, 0, 0];
                }
                else {
                    field.state.pasteRect = [touchPos[0], touchPos[1], field.layer().clipBoard.sprite.width * (field.layer().bounds.first / field.layer().dimensions.first), field.layer().clipBoard.sprite.width * (field.layer().bounds.second / field.layer().dimensions.second)];
                }
                if (keyboardHandler.keysHeld["AltLeft"] || keyboardHandler.keysHeld["AltRight"]) {
                    field.state.color.copy(field.layer().screenBuffer[gx + gy * field.layer().dimensions.first]);
                    field.layer().toolSelector.updateColorPickerTextBox();
                }
                else if (!keyboardHandler.keysHeld["Space"])
                    switch (field.layer().toolSelector.selectedToolName()) {
                        case ("outline"):
                            field.layer().autoOutline(new Pair(gx, gy), this.outLineTool.checkboxOnlyOneColor.checked);
                            break;
                        case ("spraycan"):
                            this.field.layer().state.lineWidth = this.penTool.tbSize.asNumber.get() ? this.penTool.tbSize.asNumber.get() : this.field.layer().state.lineWidth;
                            field.layer().handleTapSprayPaint(touchPos[0], touchPos[1]);
                            break;
                        case ("eraser"):
                            colorBackup.copy(field.layer().state.color);
                            {
                                const eraser = field.layer().toolSelector.eraserTool;
                                field.layer().state.lineWidth = eraser.lineWidth;
                                eraser.tbSize.setText(String(field.layer().state.lineWidth));
                                field.layer().state.color.copy(field.layer().noColor);
                            }
                            break;
                        case ("fill"):
                            break;
                        case ("rotate"):
                            if (field.layer().state.antiAliasRotation)
                                field.layer().saveDragDataToScreenAntiAliased();
                            else
                                field.layer().saveDragDataToScreen();
                            if (this.rotateTool.checkboxAutoSelect.checked) {
                                if (field.layer().state.rotateOnlyOneColor || this.keyboardHandler.keysHeld["AltLeft"])
                                    field.layer().dragData = field.layer().getSelectedPixelGroupAuto(new Pair(gx, gy), true);
                                else
                                    field.layer().dragData = field.layer().getSelectedPixelGroupAuto(new Pair(gx, gy), false);
                            }
                            else {
                                field.layer().dragData = field.layer().getSelectedPixelGroupBitMask();
                            }
                            break;
                        case ("drag"):
                            field.layer().saveDragDataToScreen();
                            if (this.dragTool.checkboxAutoSelect.checked) {
                                if (field.layer().state.dragOnlyOneColor || this.keyboardHandler.keysHeld["AltLeft"])
                                    field.layer().dragData = field.layer().getSelectedPixelGroupAuto(new Pair(gx, gy), true);
                                else
                                    field.layer().dragData = field.layer().getSelectedPixelGroupAuto(new Pair(gx, gy), false);
                            }
                            else {
                                field.layer().dragData = field.layer().getSelectedPixelGroupBitMask();
                            }
                            break;
                        case ("selection"):
                            if (this.selectionTool.checkboxComplexPolygon.checked) {
                                this.polygon.push([gx, gy]);
                                break;
                            }
                            field.state.selectionSelectionRect = [touchPos[0], touchPos[1], 0, 0];
                            break;
                        case ("oval"):
                        case ("rect"):
                        case ("copy"):
                        case ("line"):
                            field.state.selectionRect = [touchPos[0], touchPos[1], 0, 0];
                        case ("pen"):
                            {
                                field.layer().setLineWidthPen();
                            }
                            break;
                        case ("paste"):
                            field.state.pasteRect = [touchPos[0] - field.state.pasteRect[2] / 2, touchPos[1] - field.state.pasteRect[3] / 2, field.state.pasteRect[2], field.state.pasteRect[3]];
                            break;
                        case ("color picker"):
                            field.state.color.copy(field.layer().screenBuffer[gx + gy * field.layer().dimensions.first]);
                            // for Gui lib
                            field.layer().toolSelector.updateColorPickerTextBox();
                            break;
                    }
            });
            this.drawingScreenListener.registerCallBack("touchmove", (e) => this.layersTool.list.selectedItem() && this.layersTool.list.selectedItem().checkBox.checked, (e) => {
                const deltaX = this.field.zoom.invJustZoomX(e.deltaX);
                const deltaY = this.field.zoom.invJustZoomY(e.deltaY);
                const touchPos = [this.field.zoom.invZoomX(e.touchPos[0]), this.field.zoom.invZoomY(e.touchPos[1])];
                const x1 = touchPos[0] - deltaX;
                const y1 = touchPos[1] - deltaY;
                const gx = Math.floor((touchPos[0]) / field.layer().bounds.first * field.layer().dimensions.first);
                const gy = Math.floor((touchPos[1]) / field.layer().bounds.second * field.layer().dimensions.second);
                let repaint = true;
                if (keyboardHandler.keysHeld["Space"]) {
                    field.zoom.offsetX -= e.deltaX;
                    field.zoom.offsetY -= e.deltaY;
                    repaint = false;
                }
                else if (keyboardHandler.keysHeld["AltLeft"] || keyboardHandler.keysHeld["AltRight"]) {
                    field.state.color.copy(field.layer().screenBuffer[gx + gy * field.layer().dimensions.first]);
                    field.layer().toolSelector.updateColorPickerTextBox();
                    repaint = false;
                }
                else
                    switch (field.toolSelector.selectedToolName()) {
                        case ("outline"):
                            field.layer().autoOutline(new Pair(gx, gy), false);
                            break;
                        case ("settings"):
                        case ("save"):
                        case ("layers"):
                        case ("move"):
                            field.zoom.offsetX -= e.deltaX;
                            field.zoom.offsetY -= e.deltaY;
                            repaint = false;
                            break;
                        case ("eraser"):
                            if (this.eraserTool.checkboxPixelPerfect.checked) {
                                field.layer().handleDraw(x1, touchPos[0], y1, touchPos[1], (x, y, screen) => screen.handleTapPixelPerfect(x, y));
                                break;
                            }
                            field.layer().handleDraw(x1, touchPos[0], y1, touchPos[1], (x, y, screen) => screen.handleTapSprayPaint(x, y));
                            break;
                        case ("pen"):
                            if (this.penTool.checkboxPixelPerfect.checked) {
                                field.layer().handleDraw(x1, touchPos[0], y1, touchPos[1], (x, y, screen) => screen.handleTapPixelPerfect(x, y));
                                break;
                            }
                        case ("spraycan"):
                            field.layer().handleDraw(x1, touchPos[0], y1, touchPos[1], (x, y, screen) => screen.handleTapSprayPaint(x, y));
                            break;
                        case ("drag"):
                            field.layer().dragData.x += (deltaX / field.layer().bounds.first) * field.layer().dimensions.first;
                            field.layer().dragData.y += (deltaY / field.layer().bounds.second) * field.layer().dimensions.second;
                            break;
                        case ("rotate"):
                            let angle = Math.PI / 2;
                            let moveCountBeforeRotation = 10;
                            if (field.state.antiAliasRotation) {
                                angle = Math.PI / 32;
                                moveCountBeforeRotation = 2;
                            }
                            const startTouchPos = [(this.field.zoom.invZoomX(this.drawingScreenListener.startTouchPos[0]) / field.width()) * field.width(),
                                (this.field.zoom.invZoomY(this.drawingScreenListener.startTouchPos[1]) / field.height()) * field.height()];
                            const transformed = [touchPos[0] - startTouchPos[0], (touchPos[1] - startTouchPos[1]) * -1];
                            const multiplierY = -1 * +(transformed[0] < 0) + +(transformed[0] >= 0);
                            const multiplierX = -1 * +(transformed[1] < 0) + +(transformed[1] >= 0);
                            if (e.moveCount % moveCountBeforeRotation === 0)
                                if (e.deltaY * multiplierY > 0 || e.deltaX * multiplierX > 0)
                                    field.layer().rotateSelectedPixelGroup(angle, startTouchPos);
                                else if (e.deltaY * multiplierY < 0 || e.deltaX * multiplierX < 0)
                                    field.layer().rotateSelectedPixelGroup(-angle, startTouchPos);
                            if (field.state.antiAliasRotation) {
                                //field.layer().dragData!.second;
                            }
                            break;
                        case ("fill"):
                            if (this.fillTool.checkNonContiguous.checked)
                                field.layer().fillNonContiguous(new Pair(gx, gy));
                            else
                                field.layer().fillArea(new Pair(gx, gy));
                            break;
                        case ("selection"):
                            if (this.selectionTool.checkboxComplexPolygon.checked) {
                                if (e.moveCount % 10 === 0)
                                    this.polygon.push([gx, gy]);
                                break;
                            }
                            field.state.selectionSelectionRect[2] += (deltaX);
                            field.state.selectionSelectionRect[3] += (deltaY);
                            break;
                        case ("line"):
                        case ("oval"):
                        case ("rect"):
                            field.state.selectionRect[2] += (deltaX);
                            field.state.selectionRect[3] += (deltaY);
                            break;
                        case ("copy"):
                            field.state.selectionRect[2] += (deltaX);
                            field.state.selectionRect[3] += (deltaY);
                            field.state.pasteRect[2] = field.state.selectionRect[2];
                            field.state.pasteRect[3] = field.state.selectionRect[3];
                            break;
                        case ("paste"):
                            field.state.pasteRect[0] += (deltaX);
                            field.state.pasteRect[1] += (deltaY);
                            break;
                        case ("color picker"):
                            field.state.color.copy(field.layer().screenBuffer[gx + gy * field.layer().dimensions.first]);
                            field.layer().toolSelector.updateColorPickerTextBox();
                            repaint = false;
                            break;
                    }
                field.layer().repaint = repaint;
            });
            this.drawingScreenListener.registerCallBack("touchend", (e) => this.layersTool.list.selectedItem() && this.layersTool.list.selectedItem().checkBox.checked, (e) => {
                if (!this.field.layer().updatesStack.length())
                    this.field.layer().updatesStack.push([]);
                const deltaX = this.field.zoom.invJustZoomX(e.deltaX);
                const deltaY = this.field.zoom.invJustZoomY(e.deltaY);
                const touchPos = [this.field.zoom.invZoomX(e.touchPos[0]), this.field.zoom.invZoomY(e.touchPos[1])];
                const x1 = touchPos[0] - deltaX;
                const y1 = touchPos[1] - deltaY;
                const gx = Math.floor((touchPos[0]) / field.layer().bounds.first * field.layer().dimensions.first);
                const gy = Math.floor((touchPos[1]) / field.layer().bounds.second * field.layer().dimensions.second);
                let repaint = true;
                if (keyboardHandler.keysHeld["AltLeft"] || keyboardHandler.keysHeld["AltRight"]) {
                    field.state.color.copy(field.layer().screenBuffer[gx + gy * field.layer().dimensions.first]);
                    field.layer().toolSelector.updateColorPickerTextBox();
                    repaint = false;
                }
                else if (!keyboardHandler.keysHeld["Space"])
                    switch (this.selectedToolName()) {
                        case ("oval"):
                            const start_x = Math.min(touchPos[0] - deltaX, touchPos[0]);
                            const end_x = Math.max(touchPos[0] - deltaX, touchPos[0]);
                            const min_y = Math.min(touchPos[1] - deltaY, touchPos[1]);
                            const max_y = Math.max(touchPos[1] - deltaY, touchPos[1]);
                            field.state.selectionRect = [0, 0, 0, 0];
                            if (this.penTool.checkboxPixelPerfect.checked)
                                field.layer().handleEllipse(start_x, end_x, min_y, max_y, (x, y, screen) => screen.handleTapPixelPerfect(x, y));
                            else
                                field.layer().handleEllipse(start_x, end_x, min_y, max_y, (x, y, screen) => screen.handleTapSprayPaint(x, y));
                            break;
                        case ("pen"):
                            if (deltaX === 0 && deltaY === 0) {
                                field.layer().handleTapSprayPaint(touchPos[0], touchPos[1]);
                            }
                            break;
                        case ("eraser"):
                            if (deltaX === 0 && deltaY === 0 && this.eraserTool.checkboxPixelPerfect)
                                field.layer().handleTap(touchPos[0], touchPos[1]);
                            field.state.color.copy(colorBackup);
                            break;
                        case ("rotate"):
                            if (field.state.antiAliasRotation)
                                field.layer().saveDragDataToScreenAntiAliased();
                            else
                                field.layer().saveDragDataToScreen();
                            field.layer().dragData = null;
                            break;
                        case ("drag"):
                            field.layer().saveDragDataToScreen();
                            field.layer().dragData = null;
                            break;
                        case ("fill"):
                            const gx = Math.floor((touchPos[0] - field.layer().offset.first) / field.layer().bounds.first * field.layer().dimensions.first);
                            const gy = Math.floor((touchPos[1] - field.layer().offset.second) / field.layer().bounds.second * field.layer().dimensions.second);
                            if (this.fillTool.checkNonContiguous.checked)
                                field.layer().fillNonContiguous(new Pair(gx, gy));
                            else
                                field.layer().fillArea(new Pair(gx, gy));
                            break;
                        case ("line"):
                            if (deltaX === 0 && deltaY === 0) {
                                field.layer().handleTapSprayPaint(touchPos[0], touchPos[1]);
                            }
                            if (this.penTool.checkboxPixelPerfect.checked)
                                field.layer().handleDraw(x1, touchPos[0], y1, touchPos[1], (x, y, screen) => screen.handleTapPixelPerfect(x, y));
                            else
                                field.layer().handleDraw(x1, touchPos[0], y1, touchPos[1], (x, y, screen) => screen.handleTapSprayPaint(x, y));
                            field.state.selectionRect = [0, 0, 0, 0];
                            break;
                        case ("selection"):
                            if (this.selectionTool.checkboxComplexPolygon.checked && this.polygon.length > 2) {
                                field.scheduleUpdateMaskPolygon(this.polygon);
                            }
                            else {
                                if (field.state.selectionSelectionRect[2] > 0 && field.state.selectionSelectionRect[3] > 0)
                                    field.updateBitMaskRectangle(field.state.selectionSelectionRect);
                                else
                                    field.clearBitMask();
                            }
                            break;
                        case ("copy"):
                            const clipBoardSprite = field.layer().selectionToSprite(field.state.selectionRect);
                            field.layer().clipBoard.loadSprite(clipBoardSprite);
                            field.layer().repaint = true;
                            field.state.selectionRect = [0, 0, 0, 0];
                            break;
                        case ("paste"):
                            field.layer().paste();
                            break;
                        case ("rect"):
                            if (this.penTool.checkboxPixelPerfect.checked)
                                field.layer().drawRect([field.state.selectionRect[0], field.state.selectionRect[1]], [field.state.selectionRect[0] + field.state.selectionRect[2], field.state.selectionRect[1] + field.state.selectionRect[3]], (x, y, screen) => screen.handleTapPixelPerfect(x, y));
                            else
                                field.layer().drawRect([field.state.selectionRect[0], field.state.selectionRect[1]], [field.state.selectionRect[0] + field.state.selectionRect[2], field.state.selectionRect[1] + field.state.selectionRect[3]], (x, y, screen) => screen.handleTapSprayPaint(x, y));
                            field.state.selectionRect = [0, 0, 0, 0];
                            break;
                        case ("color picker"):
                            repaint = false;
                            break;
                    }
                if (this.penTool.checkboxPixelPerfect.checked || this.eraserTool.checkboxPixelPerfect.checked) {
                    this.field.layer().cleanPixelPerfectBuffer();
                    this.field.state.pixelPerfectBuffer = [];
                }
                field.state.drawCacheMap.clear();
                field.layer().updateLabelUndoRedoCount();
                field.layer().repaint = repaint;
            });
        }
        this.filesManagerTool = new FilesManagerTool("save", ["images/ThePixelSlime1Icons/filesSprite.png", "images/filesSprite.png"], [], field);
        this.layersTool = new LayerManagerTool("layers", ["images/ThePixelSlime1Icons/layersSprite.png", "images/layersSprite.png"], field);
        this.undoTool = new UndoRedoTool(this, "undo", ["images/ThePixelSlime1Icons/undoSprite.png", "images/undoSprite.png"], () => field.state.slow = !field.state.slow);
        this.transformTool = new ScreenTransformationTool("move", ["images/ThePixelSlime1Icons/moveSprite.png", "images/favicon.ico"], [this.undoTool.localLayout], field);
        this.colorPickerTool = new ColorPickerTool(field, "color picker", ["images/ThePixelSlime1Icons/colorPickerSprite.png", "images/colorPickerSprite.png"], [this.transformTool.localLayout, this.undoTool.localLayout]);
        this.selectionTool = new SelectionTool("selection", ["images/ThePixelSlime1Icons/selectionSprite.png", "images/selectionSprite.png"], [this.transformTool.localLayout, this.undoTool.localLayout], this);
        this.outLineTool = new OutlineTool("outline", ["images/ThePixelSlime1Icons/outlineSprite.png", "images/outlineSprite.png"], this, [this.colorPickerTool.localLayout, this.transformTool.localLayout, this.undoTool.localLayout]);
        this.rotateTool = new RotateTool("rotate", ["images/ThePixelSlime1Icons/rotateSprite.png", "images/rotateSprite.png"], () => field.state.rotateOnlyOneColor = this.rotateTool.checkBox.checked, () => field.state.antiAliasRotation = this.rotateTool.checkBoxAntiAlias.checked, [this.undoTool.localLayout, this.transformTool.localLayout, this.undoTool.localLayout], this);
        this.dragTool = new DragTool("drag", ["images/ThePixelSlime1Icons/dragSprite.png", "images/dragSprite.png"], () => field.state.dragOnlyOneColor = this.dragTool.checkBox.checked, () => field.state.blendAlphaOnPutSelectedPixels = this.dragTool.checkBoxBlendAlpha.checked, [this.transformTool.localLayout, this.undoTool.localLayout], this);
        this.settingsTool = new DrawingScreenSettingsTool([524, 524], field, "settings", ["images/ThePixelSlime1Icons/settingsSprite.png", "images/settingsSprite.png"], [this.transformTool.getOptionPanel()]);
        this.copyTool = new CopyPasteTool("copy", ["images/ThePixelSlime1Icons/copySprite.png", "images/copySprite.png"], [this.transformTool.localLayout], field.layer().clipBoard, () => field.state.blendAlphaOnPaste = this.copyTool.blendAlpha.checked, this);
        PenTool.checkDrawCircular.checked = true;
        PenTool.checkDrawCircular.refresh();
        const sprayCallBack = (tbprob) => {
            const state = tbprob.state === 1 ? 1 : tbprob.state / this.field.state.lineWidth;
            this.field.layer().state.sprayProbability = state;
            this.field.layer().state.lineWidth = this.penTool.tbSize.asNumber.get() ? this.penTool.tbSize.asNumber.get() : this.field.layer().state.lineWidth;
        };
        //this.sprayCanTool = new SprayCanTool(field.layer().suggestedLineWidth(), "spraycan", "images/spraycanSprite.png", sprayCallBack, [this.colorPickerTool.localLayout, this.transformTool.localLayout, this.undoTool.localLayout]);
        this.penTool = new SprayCanTool(field.layer().suggestedLineWidth(), "pen", ["images/ThePixelSlime1Icons/penSprite.png", "images/penSprite.png"], sprayCallBack, [this.colorPickerTool.localLayout, this.transformTool.localLayout, this.undoTool.localLayout], this.field);
        this.penTool.activateOptionPanel();
        this.eraserTool = new PenTool(field.layer().suggestedLineWidth() * 3, "eraser", ["images/ThePixelSlime1Icons/eraserSprite.png", "images/eraserSprite.png"], [this.transformTool.localLayout, this.undoTool.localLayout], this.field);
        PenTool.checkDrawCircular.callback = () => field.state.drawCircular = PenTool.checkDrawCircular.checked;
        this.fillTool = new FillTool("fill", ["images/ThePixelSlime1Icons/fillSprite.png", "images/fillSprite.png"], [this.transformTool.localLayout, this.colorPickerTool.localLayout, this.undoTool.localLayout], () => { });
        this.toolBar.tools = [];
        this.toolBar.tools.push(this.penTool);
        //this.toolBar.tools.push(this.sprayCanTool);
        this.toolBar.tools.push(this.fillTool);
        this.toolBar.tools.push(new PenViewTool(this.penTool, "line", ["images/ThePixelSlime1Icons/LineDrawSprite.png", "images/LineDrawSprite.png"]));
        this.toolBar.tools.push(new PenViewTool(this.penTool, "rect", ["images/ThePixelSlime1Icons/rectSprite.png", "images/rectSprite.png"]));
        this.toolBar.tools.push(new PenViewTool(this.penTool, "oval", ["images/ThePixelSlime1Icons/ovalSprite.png", "images/ovalSprite.png"]));
        this.toolBar.tools.push(this.copyTool);
        this.toolBar.tools.push(new ViewLayoutTool(this.copyTool.getOptionPanel(), "paste", ["images/ThePixelSlime1Icons/pasteSprite.png", "images/pasteSprite.png"]));
        this.toolBar.tools.push(this.dragTool);
        this.toolBar.tools.push(new ViewLayoutTool(this.undoTool.localLayout, "redo", ["images/ThePixelSlime1Icons/redoSprite.png", "images/redoSprite.png"]));
        this.toolBar.tools.push(this.undoTool);
        this.toolBar.tools.push(this.colorPickerTool);
        this.toolBar.tools.push(this.eraserTool);
        this.toolBar.tools.push(this.rotateTool);
        this.toolBar.tools.push(this.outLineTool);
        this.toolBar.tools.push(this.layersTool);
        this.toolBar.tools.push(this.selectionTool);
        this.toolBar.tools.push(this.transformTool);
        this.toolBar.tools.push(this.filesManagerTool);
        this.toolBar.tools.push(this.settingsTool);
        this.toolBar.resize();
        this.ctx = this.canvas.getContext("2d");
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = "#000000";
        this.ctx.fillStyle = "#FFFFFF";
        this.repaint = true;
        this.lastDrawTime = Date.now();
    }
    transformEvent(e) {
        const xScale = this.canvas.width / this.externalCanvas.width;
        const yScale = this.canvas.height / this.externalCanvas.height;
        e.touchPos[0] *= xScale;
        e.touchPos[1] *= yScale;
        e.translateEvent(e, -this.tool().getOptionPanel().x, -this.tool().getOptionPanel().y);
    }
    invScaleEvent(e) {
        const xScale = 1 / this.canvas.width / this.externalCanvas.width;
        const yScale = 1 / this.canvas.height / this.externalCanvas.height;
        e.touchPos[0] *= xScale;
        e.touchPos[1] *= yScale;
    }
    setNormalInputValidation() {
        this.settingsTool.tbX.validationCallback = (event) => {
            if (!event.textbox.asNumber.get() && event.textbox.text.length > 1) {
                return false;
            }
            return true;
        };
        this.settingsTool.tbY.validationCallback = (event) => {
            if (!event.textbox.asNumber.get() && event.textbox.text.length > 1) {
                return false;
            }
            return true;
        };
        this.settingsTool.recalcDim = () => {
            let x = this.settingsTool.dim[0];
            let y = this.settingsTool.dim[1];
            if (this.settingsTool.tbX.asNumber.get())
                x = this.settingsTool.tbX.asNumber.get();
            if (this.settingsTool.tbY.asNumber.get())
                y = this.settingsTool.tbY.asNumber.get();
            this.settingsTool.dim = [x, y];
            this.field.setDimOnCurrent(this.settingsTool.dim);
        };
        this.colorPickerTool.tbColor.validationCallback = (e) => {
            const color = new RGB(0, 0, 0, 0);
            const code = color.loadString(e.textbox.text);
            if (code === 2) //overflow
             {
                e.textbox.text = (color.htmlRBGA());
            }
            else if (code === 1) //parse error
             {
                return false;
            }
            return true;
        };
    }
    setMegaDriveInputValidation() {
        this.settingsTool.tbX.validationCallback = (event) => {
            if (!event.textbox.asNumber.get() && event.textbox.text.length > 1) {
                return false;
            }
            return true;
        };
        this.settingsTool.tbY.validationCallback = (event) => {
            if (!event.textbox.asNumber.get() && event.textbox.text.length > 1) {
                return false;
            }
            return true;
        };
        this.settingsTool.recalcDim = () => {
            let x = this.settingsTool.dim[0];
            let y = this.settingsTool.dim[1];
            if (this.settingsTool.tbX.asNumber.get())
                x = this.settingsTool.tbX.asNumber.get();
            if (this.settingsTool.tbY.asNumber.get())
                y = this.settingsTool.tbY.asNumber.get();
            this.settingsTool.dim = [x, y];
            this.field.setDimOnCurrent(this.settingsTool.dim);
        };
        this.colorPickerTool.tbColor.validationCallback = (e) => {
            const color = new RGB(0, 0, 0, 0);
            const code = color.loadString(e.textbox.text);
            if (code === 2) //overflow
             {
                e.textbox.text = (color.htmlRBGA());
            }
            else if (code === 1) //parse error
             {
                return false;
            }
            return true;
        };
    }
    selected() {
        return this.toolBar.selected;
    }
    updateColorPickerTextBox() {
        this.colorPickerTool.setColorText();
        this.repaint = true;
    }
    resizeCanvas() {
        const imgPerColumn = (this.toolPixelDim[1] / this.toolBar.toolRenderDim[1]);
        const imgPerRow = (this.toolPixelDim[0] / this.toolBar.toolRenderDim[0]);
        if (this.tool() && this.tool().image() && this.toolBar.tools.length > imgPerColumn * imgPerRow) {
            this.toolPixelDim[0] = this.toolBar.toolRenderDim[0] * Math.ceil(this.toolBar.tools.length / imgPerColumn);
            this.canvas.width = this.toolPixelDim[0] + this.tool().optionPanelSize()[0];
            this.toolPixelDim[1] = this.toolBar.toolRenderDim[1] * 10;
            this.canvas.height = this.toolPixelDim[1] > this.tool().height() ? this.toolPixelDim[1] : this.tool().height();
            this.ctx = this.canvas.getContext("2d");
        }
        this.resizePreviewScreen();
    }
    resizePreviewScreen() {
        if (this.previewScreen.dimensions.first !== this.field.width() || this.previewScreen.dimensions.second !== this.field.height()) {
            this.previewScreen.clearScreenBuffer();
            this.previewScreen.setDim(this.field.dim);
        }
    }
    width() {
        return this.canvas.width;
    }
    height() {
        return this.canvas.height;
    }
    drawableTool() {
        const toolName = this.selectedToolName();
        return toolName == "line" || toolName == "pen" || toolName == "rect" || toolName == "oval";
    }
    renderDrawingScreenPreview() {
        this.resizePreviewScreen();
        const screen = this.previewScreen;
        const ctx = this.drawingScreenListener.component.getContext("2d");
        const oLineWidth = ctx.lineWidth;
        if (this.previewScreen.state.lineWidth === 1 ||
            (this.previewScreen.state.lineWidth <= 20 && screen.dimensions.first * screen.dimensions.second <= 128 * 128) ||
            (this.previewScreen.state.lineWidth <= 10 && screen.dimensions.first * screen.dimensions.second <= 256 * 256) ||
            (this.previewScreen.state.lineWidth <= 5 && screen.dimensions.first * screen.dimensions.second <= 1024 * 1024) ||
            (screen.dimensions.first * screen.dimensions.second <= 256 * 256)) {
            const oSlow = screen.state.slow;
            const oColor = screen.state.color.color;
            const pixelPerfect = (x, y) => screen.handleTapPixelPerfect(x, y);
            const defa = (x, y) => screen.handleTapSprayPaint(x, y);
            screen.state.slow = false;
            while (screen.updatesStack.length()) {
                screen.undoLast();
            }
            screen.updatesStack.push([]);
            const touchPos = [this.field.zoom.invZoomX(this.drawingScreenListener.touchPos[0]), this.field.zoom.invZoomY(this.drawingScreenListener.touchPos[1])];
            let touchStart = [this.field.state.selectionRect[0], this.field.state.selectionRect[1]];
            if (this.drawingScreenListener && this.drawingScreenListener.registeredTouch && this.selectedToolName() === "line") {
                if (this.penTool.checkboxPixelPerfect.checked) {
                    screen.handleDraw(touchStart[0], touchPos[0], touchStart[1], touchPos[1], (x, y, screen) => screen.handleTapPixelPerfect(x, y));
                }
                else
                    screen.handleDraw(touchStart[0], touchPos[0], touchStart[1], touchPos[1], (x, y, screen) => screen.handleTapSprayPaint(x, y));
                screen.drawToContextAsSprite(ctx, this.field.zoom.zoomedX, this.field.zoom.zoomedY, this.field.width() * this.field.zoom.zoomX, this.field.height() * this.field.zoom.zoomY);
                screen.cleanPixelPerfectBuffer();
                screen.state.drawCacheMap.clear();
            }
            else if (this.drawingScreenListener && this.drawingScreenListener.registeredTouch && screen.state.selectionRect[3] !== 0) {
                const xr = Math.abs(screen.state.selectionRect[2] / 2);
                const yr = Math.abs(screen.state.selectionRect[3] / 2);
                if (this.selectedToolName() === "copy") {
                    screen.state.color = new RGB(255, 255, 255, 255);
                    screen.drawRect([screen.state.selectionRect[0] + 1, screen.state.selectionRect[1] + 1], [screen.state.selectionRect[0] + screen.state.selectionRect[2] - 1, screen.state.selectionRect[1] + screen.state.selectionRect[3] - 1], defa);
                    screen.updatesStack.push([]);
                    screen.state.color = new RGB(255, 0, 0, 255);
                    screen.drawRect([screen.state.selectionRect[0], screen.state.selectionRect[1]], [screen.state.selectionRect[0] + screen.state.selectionRect[2], screen.state.selectionRect[1] + screen.state.selectionRect[3]], defa);
                    screen.drawToContextAsSprite(ctx, this.field.zoom.zoomedX, this.field.zoom.zoomedY, this.field.width() * this.field.zoom.zoomX, this.field.height() * this.field.zoom.zoomY);
                }
                else if (this.selectedToolName() !== "oval") {
                    screen.state.color.color = oColor;
                    if (this.penTool.checkboxPixelPerfect.checked)
                        screen.drawRect([screen.state.selectionRect[0], screen.state.selectionRect[1]], [screen.state.selectionRect[0] + screen.state.selectionRect[2], screen.state.selectionRect[1] + screen.state.selectionRect[3]], (x, y, screen) => screen.handleTapPixelPerfect(x, y));
                    else
                        screen.drawRect([screen.state.selectionRect[0], screen.state.selectionRect[1]], [screen.state.selectionRect[0] + screen.state.selectionRect[2], screen.state.selectionRect[1] + screen.state.selectionRect[3]], (x, y, screen) => screen.handleTapSprayPaint(x, y));
                    screen.drawToContextAsSprite(ctx, this.field.zoom.zoomedX, this.field.zoom.zoomedY, this.field.width() * this.field.zoom.zoomX, this.field.height() * this.field.zoom.zoomY);
                    screen.cleanPixelPerfectBuffer();
                    screen.state.drawCacheMap.clear();
                }
                else if (Math.abs(screen.state.selectionRect[3]) > 0) {
                    const start_x = Math.min(touchStart[0], touchPos[0]);
                    const end_x = Math.max(touchStart[0], touchPos[0]);
                    const min_y = Math.min(touchStart[1], touchPos[1]);
                    const max_y = Math.max(touchStart[1], touchPos[1]);
                    //screen.state.selectionRect = [0,0,0,0];
                    if (this.penTool.checkboxPixelPerfect.checked)
                        screen.handleEllipse(start_x, end_x, min_y, max_y, (x, y, screen) => screen.handleTapPixelPerfect(x, y));
                    else
                        screen.handleEllipse(start_x, end_x, min_y, max_y, (x, y, screen) => screen.handleTapSprayPaint(x, y));
                    screen.drawToContextAsSprite(ctx, this.field.zoom.zoomedX, this.field.zoom.zoomedY, this.field.width() * this.field.zoom.zoomX, this.field.height() * this.field.zoom.zoomY);
                    screen.cleanPixelPerfectBuffer();
                    screen.state.drawCacheMap.clear();
                }
            }
            screen.state.slow = oSlow;
            screen.state.color.color = oColor;
        }
        else {
            screen.ctx.lineWidth = screen.state.lineWidth;
            const xMult = this.field.zoom.zoomX;
            const yMult = this.field.zoom.zoomY;
            if (screen.toolSelector.drawingScreenListener && screen.toolSelector.drawingScreenListener.registeredTouch && screen.toolSelector.selectedToolName() === "line") {
                let touchStart = [screen.state.selectionRect[0], screen.state.selectionRect[1]];
                screen.ctx.beginPath();
                screen.ctx.strokeStyle = screen.state.color.htmlRBGA();
                screen.ctx.moveTo(touchStart[0], touchStart[1]);
                screen.ctx.lineTo((screen.state.selectionRect[2] + touchStart[0]), (screen.state.selectionRect[3] + touchStart[1]));
                screen.ctx.stroke();
            }
            else if (screen.toolSelector.drawingScreenListener && screen.toolSelector.drawingScreenListener.registeredTouch && screen.state.selectionRect[3] !== 0) {
                const xr = Math.abs(screen.state.selectionRect[2] / 2);
                const yr = Math.abs(screen.state.selectionRect[3] / 2);
                if (screen.toolSelector.selectedToolName() === "copy") {
                    screen.ctx.lineWidth = 1;
                    screen.ctx.strokeStyle = "#FFFFFF";
                    screen.ctx.strokeRect(screen.state.selectionRect[0] + 2, screen.state.selectionRect[1] + 2, screen.state.selectionRect[2] - 4, screen.state.selectionRect[3] - 4);
                    screen.ctx.strokeStyle = "#FF0000";
                    screen.ctx.strokeRect(screen.state.selectionRect[0], screen.state.selectionRect[1], screen.state.selectionRect[2], screen.state.selectionRect[3]);
                }
                else if (screen.toolSelector.selectedToolName() !== "oval") {
                    screen.ctx.strokeStyle = "#FFFFFF";
                    screen.ctx.strokeRect(screen.state.selectionRect[0] + 2, screen.state.selectionRect[1] + 2, screen.state.selectionRect[2] - 4, screen.state.selectionRect[3] - 4);
                    screen.ctx.strokeStyle = screen.state.color.htmlRBG();
                    screen.ctx.strokeRect(screen.state.selectionRect[0], screen.state.selectionRect[1], screen.state.selectionRect[2], screen.state.selectionRect[3]);
                }
                else if (screen.state.selectionRect[2] / 2 > 0 && screen.state.selectionRect[3] / 2 > 0) {
                    screen.ctx.beginPath();
                    screen.ctx.strokeStyle = screen.state.color.htmlRBG();
                    screen.ctx.ellipse(screen.state.selectionRect[0] + xr, screen.state.selectionRect[1] + yr, xr, yr, 0, 0, 2 * Math.PI);
                    screen.ctx.stroke();
                }
                else if (screen.state.selectionRect[2] < 0 && screen.state.selectionRect[3] >= 0) {
                    screen.ctx.beginPath();
                    screen.ctx.strokeStyle = screen.state.color.htmlRBG();
                    screen.ctx.ellipse(screen.state.selectionRect[0] - xr, screen.state.selectionRect[1] + yr, xr, yr, 0, 0, 2 * Math.PI);
                    screen.ctx.stroke();
                }
                else if (screen.state.selectionRect[2] < 0 && screen.state.selectionRect[3] < 0) {
                    screen.ctx.beginPath();
                    screen.ctx.strokeStyle = screen.state.color.htmlRBG();
                    screen.ctx.ellipse(screen.state.selectionRect[0] - xr, screen.state.selectionRect[1] - yr, xr, yr, 0, 0, 2 * Math.PI);
                    screen.ctx.stroke();
                }
                else if (screen.state.selectionRect[2] != 0 && screen.state.selectionRect[3] != 0) {
                    screen.ctx.beginPath();
                    screen.ctx.strokeStyle = screen.state.color.htmlRBG();
                    screen.ctx.ellipse(screen.state.selectionRect[0] + xr, screen.state.selectionRect[1] - yr, xr, yr, 0, 0, 2 * Math.PI);
                    screen.ctx.stroke();
                }
            }
            ctx.drawImage(screen.canvas, this.field.zoom.zoomedX, this.field.zoom.zoomedY, this.field.zoom.zoomX * screen.dimensions.first, this.field.zoom.zoomY * screen.dimensions.second);
            screen.ctx.clearRect(0, 0, screen.canvas.width, screen.canvas.height);
        }
        if (this.drawingScreenListener.registeredTouch === false && this.drawingScreenListener.mouseOverElement) {
            if (this.drawableTool()) {
                const touchPos = [this.field.zoom.invZoomX(this.drawingScreenListener.touchPos[0]), this.field.zoom.invZoomY(this.drawingScreenListener.touchPos[1])];
                screen.handleTapSprayPaint(touchPos[0], touchPos[1]);
                screen.updatesStack.push([]);
                if (this.penTool.tbProbability.state !== 1) {
                    for (let i = 0; i < screen.state.lineWidth / 2; i++) {
                        screen.handleTapSprayPaint(touchPos[0], touchPos[1]);
                        screen.updatesStack.push([]);
                    }
                }
                screen.updatesStack.push([]);
                screen.drawToContextAsSprite(ctx, this.field.zoom.zoomedX, this.field.zoom.zoomedY, screen.dimensions.first * this.field.zoom.zoomX, screen.dimensions.second * this.field.zoom.zoomY);
            }
        }
        ctx.lineWidth = oLineWidth;
    }
    draw() {
        const imgPerColumn = (this.toolPixelDim[1] / this.toolBar.toolRenderDim[1]);
        const imgPerRow = (this.toolPixelDim[0] / this.toolBar.toolRenderDim[0]);
        if (this.repaint || Date.now() - this.lastDrawTime > 600) {
            this.repaint = false;
            this.lastDrawTime = Date.now();
            this.resizeCanvas();
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.toolBar.refresh();
            this.toolBar.draw(this.ctx, 0, 0);
            if (this.tool()) {
                this.toolBar.tools[this.selected()].drawOptionPanel(this.ctx, this.toolBar.toolRenderDim[0] * imgPerRow, 0);
            }
            //render name of tool mouse is hovering over/last selected in touchscreen
            if (this.touchListener.mouseOverElement || isTouchSupported()) {
                const touchPos = this.touchListener.touchPos;
                const xScale = this.canvas.width / this.externalCanvas.width;
                const yScale = this.canvas.height / this.externalCanvas.height;
                const x = Math.floor(touchPos[0] / this.toolPixelDim[0] * imgPerRow * xScale);
                const y = Math.floor(touchPos[1] / this.toolPixelDim[1] * imgPerColumn * yScale);
                if (this.toolBar.tools[x * imgPerColumn + y]) {
                    const name = this.toolBar.tools[x * imgPerColumn + y].name();
                    const wordsInName = name.split(" ");
                    for (let i = 0; i < wordsInName.length; i++) {
                        wordsInName[i] = wordsInName[i][0].toUpperCase() + wordsInName[i].substring(1);
                    }
                    const capitalized = wordsInName.join(' ');
                    this.ctx.font = '16px Calibri';
                    this.ctx.strokeStyle = "#FFFF00";
                    this.ctx.strokeText(capitalized, x * this.toolBar.toolRenderDim[0], 16 + y * this.toolBar.toolRenderDim[1]);
                    this.ctx.fillStyle = "#000000";
                    this.ctx.fillText(capitalized, x * this.toolBar.toolRenderDim[0], 16 + y * this.toolBar.toolRenderDim[1]);
                }
            }
            const extCtx = this.externalCanvas.getContext("2d");
            extCtx.clearRect(0, 0, this.externalCanvas.width, this.externalCanvas.height);
            extCtx.drawImage(this.canvas, 0, 0, this.externalCanvas.width, this.externalCanvas.height);
        }
    }
    selectedToolName() {
        if (this.tool())
            return this.tool().name();
        return null;
    }
    tool() {
        if (this.selected() >= 0 && this.selected() < this.toolBar.tools.length) {
            return this.toolBar.tools[this.selected()];
        }
        return null;
    }
}
;
class DrawingScreenState {
    constructor(lineWidth) {
        this.drawCacheMap = new Set();
        this.color = new RGB(0, 0, 0);
        this.allowDropOutsideSelection = false;
        this.bufferBitMask = [];
        this.sprayProbability = 1;
        this.antiAliasRotation = true;
        this.screenBufUnlocked = true;
        this.blendAlphaOnPutSelectedPixels = true;
        this.dragOnlyOneColor = false;
        this.rotateOnlyOneColor = false;
        this.drawCircular = true;
        this.slow = false;
        this.blendAlphaOnPaste = true;
        this.resizeSprite = false;
        this.selectionRect = [0, 0, 0, 0];
        this.pasteRect = [0, 0, 0, 0];
        this.selectionSelectionRect = [0, 0, 0, 0];
        this.lineWidth = lineWidth; //dimensions[0] / bounds[0] * 4;
        this.pixelPerfectBuffer = [];
    }
}
;
class DetailedPixelsGroup {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.colors = [];
        this.topLeftPoints = [];
        this.bottomLeftPoints = [];
        this.topRightPoints = [];
        this.bottomRightPoints = [];
    }
    push(color, topLeftX, topLeftY, bottomLeftX, bottomLeftY, topRightX, topRightY, bottomRightX, bottomRightY) {
        this.colors.push(color);
        this.topLeftPoints.push(topLeftX);
        this.topLeftPoints.push(topLeftY);
        this.topRightPoints.push(topRightX);
        this.topRightPoints.push(topRightY);
        this.bottomLeftPoints.push(bottomLeftX);
        this.bottomLeftPoints.push(bottomLeftY);
        this.bottomRightPoints.push(bottomRightX);
        this.bottomRightPoints.push(bottomRightY);
    }
    pushSimple(color, topLeftX, topLeftY, bottomLeftX) {
        this.colors.push(color);
        this.topLeftPoints.push(topLeftX);
        this.topLeftPoints.push(topLeftY);
    }
    clearLists() {
        this.colors = [];
        this.topLeftPoints = [];
        this.bottomLeftPoints = [];
        this.topRightPoints = [];
        this.bottomRightPoints = [];
    }
    resetState() {
        this.x = -1;
        this.y = -1;
        this.clearLists();
    }
}
class DrawingScreen {
    constructor(canvas, keyboardHandler, palette, offset, dimensions, toolSelector, state, clipBoard) {
        const bounds = [dim[0], dim[1]];
        this.dragDataMaxPoint = -1;
        this.dragDataMinPoint = -1;
        this.clipBoard = clipBoard;
        this.palette = palette;
        this.noColor = new RGB(255, 255, 255, 0);
        this.state = state;
        this.drawWithAlpha = 1;
        this.repaint = true;
        this.dimensions = new Pair(dimensions[0], dimensions[1]);
        this.offset = new Pair(offset[0], offset[1]);
        this.bounds = new Pair(bounds[0], bounds[1]);
        this.ctx = canvas.getContext("2d");
        canvas.width = bounds[0];
        canvas.height = bounds[1];
        this.dragDataMaxPoint = 0;
        this.canvas = canvas;
        this.dragData = null;
        this.spriteScreenBuf = new Sprite([], this.canvas.width, this.canvas.height, false);
        this.toolSelector = toolSelector;
        this.updatesStack = new RollingStack();
        this.undoneUpdatesStack = new RollingStack();
        this.screenBuffer = new Array();
        for (let i = 0; i < dimensions[0] * dimensions[1]; i++) {
            this.screenBuffer.push(new RGB(this.noColor.red(), this.noColor.green(), this.noColor.blue(), this.noColor.alpha()));
        }
        const colorBackup = new RGB(this.noColor.red(), this.noColor.green(), this.noColor.blue(), this.noColor.alpha());
        this.state.color = new RGB(0, 0, 0, 255);
    }
    clearScreenBuffer() {
        for (let i = 0; i < this.screenBuffer.length; i++) {
            this.screenBuffer[i].color = this.noColor.color;
        }
    }
    updateLabelUndoRedoCount() {
        this.toolSelector.undoTool.updateLabel(this.undoneUpdatesStack.length(), this.updatesStack.length());
    }
    suggestedLineWidth() {
        return Math.floor(this.dimensions.first / 128);
    }
    setLineWidthPen() {
        const pen = this.toolSelector.penTool;
        this.state.lineWidth = pen.penSize();
        pen.tbSize.setText(String(this.state.lineWidth));
    }
    maskToSprite() {
        let minY = this.dimensions.second;
        let minX = this.dimensions.first;
        let maxY = 0;
        let maxX = 0;
        for (let i = 0; i < this.screenBuffer.length; i++) {
            if (this.state.bufferBitMask[i]) {
                const x = i % this.dimensions.first;
                const y = Math.floor(i / this.dimensions.first);
                if (minX > x)
                    minX = x;
                if (maxX < x)
                    maxX = x;
                if (minY > y)
                    minY = y;
                if (maxY < y)
                    maxY = y;
            }
        }
        const width = maxX - minX;
        const height = maxY - minY;
        const sprite = new Sprite([], width, height, false);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const key = minX + x + (y + minY) * this.dimensions.first;
                if (this.state.bufferBitMask[key]) {
                    const spriteBufKey = x + y * width;
                    sprite.pixels[spriteBufKey << 2] = this.screenBuffer[key].red();
                    sprite.pixels[(spriteBufKey << 2) + 1] = this.screenBuffer[key].green();
                    sprite.pixels[(spriteBufKey << 2) + 2] = this.screenBuffer[key].blue();
                    sprite.pixels[(spriteBufKey << 2) + 3] = this.screenBuffer[key].alpha();
                }
            }
        }
        sprite.refreshImage();
        return sprite;
    }
    selectionToSprite(selectionRect) {
        if (selectionRect[2] < 0) {
            selectionRect[0] += selectionRect[2];
            selectionRect[2] *= -1;
        }
        if (selectionRect[3] < 0) {
            selectionRect[1] += selectionRect[3];
            selectionRect[3] *= -1;
        }
        const source_x = Math.floor((selectionRect[0] - this.offset.first) / this.bounds.first * this.dimensions.first);
        const source_y = Math.floor((selectionRect[1] - this.offset.second) / this.bounds.second * this.dimensions.second);
        const width = Math.floor((selectionRect[2] - this.offset.first) / this.bounds.first * this.dimensions.first);
        const height = Math.floor((selectionRect[3] - this.offset.second) / this.bounds.second * this.dimensions.second);
        const area = width * height;
        const asSprite = new Sprite([], width, height);
        for (let i = 0; i < area; i++) {
            const copyAreaX = i % width;
            const copyAreaY = Math.floor(i / width);
            const sourceIndex = source_x + source_y * this.dimensions.first + copyAreaX + copyAreaY * this.dimensions.first;
            if (this.inBufferBounds(source_x + copyAreaX, source_y + copyAreaY) && this.state.bufferBitMask[sourceIndex]) {
                const pixel = this.screenBuffer[sourceIndex];
                asSprite.fillRect(pixel, copyAreaX, copyAreaY, 1, 1);
            }
        }
        asSprite.refreshImage();
        return asSprite;
    }
    paste() {
        if (this.state.screenBufUnlocked) {
            this.state.screenBufUnlocked = false;
            const dest_x = Math.floor(((this.getTouchPosX() - this.clipBoard.sprite.width / 2) - this.offset.first) / this.bounds.first * this.dimensions.first);
            const dest_y = Math.floor(((this.getTouchPosY() - this.clipBoard.sprite.height / 2) - this.offset.second) / this.bounds.second * this.dimensions.second);
            const width = this.clipBoard.sprite.width;
            const height = this.clipBoard.sprite.height;
            const initialIndex = dest_x + dest_y * this.dimensions.first;
            const blendAlpha = this.state.blendAlphaOnPaste;
            const color = new RGB(0, 0, 0);
            for (let i = 0; i < this.clipBoard.sprite.pixels.length >> 2; i++) {
                const copyAreaX = i % width;
                const copyAreaY = Math.floor(i / width);
                const destIndex = initialIndex + copyAreaX + copyAreaY * this.dimensions.first;
                const dest = this.screenBuffer[destIndex];
                color.setRed(this.clipBoard.sprite.pixels[i << 2]);
                color.setGreen(this.clipBoard.sprite.pixels[(i << 2) + 1]);
                color.setBlue(this.clipBoard.sprite.pixels[(i << 2) + 2]);
                color.setAlpha(this.clipBoard.sprite.pixels[(i << 2) + 3]);
                const source = color;
                if (this.inBufferBounds(dest_x + copyAreaX, dest_y + copyAreaY) && this.state.bufferBitMask[destIndex] && (!dest.compare(source) || source.alpha() != 255)) {
                    const oldColor = dest.color;
                    if (blendAlpha)
                        dest.blendAlphaCopy(source);
                    else
                        dest.copy(source);
                    if (oldColor !== dest.color) {
                        const color = new RGB(0, 0, 0, 0);
                        color.color = oldColor;
                        this.updatesStack.get(this.updatesStack.length() - 1).push(new Pair(destIndex, color));
                    }
                }
            }
            this.state.screenBufUnlocked = true;
        }
    }
    horizontalsAdjacent(x, y) {
        const key = x + y * this.dimensions.first;
        return (this.screenBuffer[key].compare(this.screenBuffer[key + this.dimensions.first])
            && this.screenBuffer[key].compare(this.screenBuffer[key - this.dimensions.first]))
            || (this.screenBuffer[key].compare(this.screenBuffer[key + 1])
                && this.screenBuffer[key].compare(this.screenBuffer[key - 1]));
    }
    cleanPixelPerfectBuffer(rollover = 8) {
        const buffer = this.state.pixelPerfectBuffer;
        for (let i = 0; i < buffer.length - 1; i += 2) {
            let adjacent = 0;
            const idata = new Pair(buffer[i], new RGB(0, 0, 0, 0));
            idata.second.color = buffer[i + 1];
            const ix = idata.first >> 16;
            const iy = idata.first & ((1 << 16) - 1);
            for (let j = 0; j < buffer.length - 1; j += 2) {
                const jdata = new Pair(buffer[j], new RGB(0, 0, 0, 0));
                jdata.second.color = buffer[j + 1];
                const jx = jdata.first >> 16;
                const jy = jdata.first & ((1 << 16) - 1);
                const dx = ix - jx;
                const dy = iy - jy;
                if (Math.abs(dx) === 1 && Math.abs(dy) === 0) {
                    adjacent++;
                }
                else if (Math.abs(dx) === 0 && Math.abs(dy) === 1) {
                    adjacent++;
                }
            }
            if (adjacent > 1 && (adjacent !== 2 || !this.horizontalsAdjacent(ix, iy))) {
                {
                    this.screenBuffer[ix + iy * this.dimensions.first].color = idata.second.color;
                    buffer.splice(i, 2);
                    i -= 2;
                }
            }
            else {
                idata.first = ix + iy * this.dimensions.first;
                const existsInBuf = (val) => {
                    for (let i = 0; i < this.updatesStack.get(this.updatesStack.length() - 1).length; i++) {
                        const el = this.updatesStack.get(this.updatesStack.length() - 1)[i];
                        if (el.first === val.first && el.second.compare(val.second))
                            return true;
                    }
                    return false;
                };
                if (!this.state.drawCacheMap.has(idata.first)) {
                    this.updatesStack.get(this.updatesStack.length() - 1).push(idata);
                    this.state.drawCacheMap.add(idata.first);
                }
            }
        }
        this.state.pixelPerfectBuffer.splice(0, this.state.pixelPerfectBuffer.length - rollover);
    }
    handleTapPixelPerfect(px, py, bufLen = 20) {
        bufLen += bufLen % 2;
        const gx = Math.floor((px - this.offset.first) / this.bounds.first * this.dimensions.first);
        const gy = Math.floor((py - this.offset.second) / this.bounds.second * this.dimensions.second);
        const pixelColor = this.screenBuffer[gx + gy * this.dimensions.first];
        if (gx < this.dimensions.first && gy < this.dimensions.second && this.state.screenBufUnlocked && pixelColor && !this.state.color.compare(pixelColor)) {
            this.state.screenBufUnlocked = false;
            if (this.state.bufferBitMask[gx + gy * this.dimensions.first] && gx >= 0 && gy >= 0 && gx <= this.dimensions.first && gy < this.dimensions.second) {
                this.state.pixelPerfectBuffer.push((gx << 16) | gy);
                this.state.pixelPerfectBuffer.push(pixelColor.color);
                pixelColor.copy(this.state.color);
            }
            if (this.state.pixelPerfectBuffer.length > bufLen) {
                this.cleanPixelPerfectBuffer(bufLen - 6);
            }
            this.state.screenBufUnlocked = true;
        }
    }
    handleTap(px, py) {
        const gx = Math.floor((px - this.offset.first) / this.bounds.first * this.dimensions.first);
        const gy = Math.floor((py - this.offset.second) / this.bounds.second * this.dimensions.second);
        if (gx < this.dimensions.first && gy < this.dimensions.second && this.state.screenBufUnlocked) {
            this.state.screenBufUnlocked = false;
            const radius = this.state.lineWidth * 0.5;
            const offset = this.state.lineWidth > 1 ? 0.5 : 0;
            if (this.state.drawCircular) {
                const radius = this.state.lineWidth * 0.5;
                for (let i = -0.5 * this.state.lineWidth; i < radius; i++) {
                    for (let j = -0.5 * this.state.lineWidth; j < radius; j++) {
                        const ngx = gx + Math.round(j);
                        const ngy = (gy + Math.round(i));
                        const dx = ngx + offset - gx;
                        const dy = ngy + offset - gy;
                        const key = ngx + ngy * this.dimensions.first;
                        const pixel = this.screenBuffer[key];
                        if (this.inBufferBounds(ngx, ngy) && !pixel.compare(this.state.color) && this.state.bufferBitMask[key] && Math.sqrt(dx * dx + dy * dy) <= radius) {
                            this.updatesStack.get(this.updatesStack.length() - 1).push(new Pair(key, new RGB(pixel.red(), pixel.green(), pixel.blue(), pixel.alpha())));
                            pixel.copy(this.state.color);
                        }
                    }
                }
            }
            else {
                const radius = this.state.lineWidth * 0.5;
                for (let i = -0.5 * this.state.lineWidth; i < radius; i++) {
                    for (let j = -0.5 * this.state.lineWidth; j < radius; j++) {
                        const ngx = gx + Math.round(j);
                        const ngy = (gy + Math.round(i));
                        const key = ngx + ngy * this.dimensions.first;
                        const pixel = this.screenBuffer[key];
                        if (this.inBufferBounds(ngx, ngy) && this.state.bufferBitMask[key] && !pixel.compare(this.state.color)) {
                            this.updatesStack.get(this.updatesStack.length() - 1).push(new Pair(key, new RGB(pixel.red(), pixel.green(), pixel.blue(), pixel.alpha())));
                            pixel.copy(this.state.color);
                        }
                    }
                }
            }
            this.repaint = true;
            this.state.screenBufUnlocked = true;
        }
    }
    handleTapSprayPaint(px, py) {
        const gx = Math.floor((px - this.offset.first) / this.bounds.first * this.dimensions.first);
        const gy = Math.floor((py - this.offset.second) / this.bounds.second * this.dimensions.second);
        if (gx < this.dimensions.first && gy < this.dimensions.second && this.state.screenBufUnlocked) {
            this.state.screenBufUnlocked = false;
            const radius = this.state.lineWidth * 0.5;
            if (this.state.drawCircular) {
                const offset = this.state.lineWidth > 1 ? 0.5 : 0;
                const radius = this.state.lineWidth * 0.5;
                for (let i = -0.5 * this.state.lineWidth; i < radius; i++) {
                    for (let j = -0.5 * this.state.lineWidth; j < radius; j++) {
                        const ngx = gx + Math.round(j);
                        const ngy = (gy + Math.round(i));
                        const dx = ngx + offset - gx;
                        const dy = ngy + offset - gy;
                        const key = ngx + ngy * this.dimensions.first;
                        const pixel = this.screenBuffer[key];
                        if (this.inBufferBounds(ngx, ngy) && this.state.bufferBitMask[key] && !pixel.compare(this.state.color) && Math.sqrt(dx * dx + dy * dy) <= radius && Math.random() < this.state.sprayProbability) {
                            this.updatesStack.get(this.updatesStack.length() - 1).push(new Pair(key, new RGB(pixel.red(), pixel.green(), pixel.blue(), pixel.alpha())));
                            pixel.copy(this.state.color);
                        }
                    }
                }
            }
            else {
                const radius = this.state.lineWidth * 0.5;
                for (let i = -0.5 * this.state.lineWidth; i < radius; i++) {
                    for (let j = -0.5 * this.state.lineWidth; j < radius; j++) {
                        const ngx = gx + Math.round(j);
                        const ngy = (gy + Math.round(i));
                        const key = ngx + ngy * this.dimensions.first;
                        const pixel = this.screenBuffer[key];
                        if (this.inBufferBounds(ngx, ngy) && this.state.bufferBitMask[key] && !pixel.compare(this.state.color) && Math.random() < this.state.sprayProbability) {
                            this.updatesStack.get(this.updatesStack.length() - 1).push(new Pair(key, new RGB(pixel.red(), pixel.green(), pixel.blue(), pixel.alpha())));
                            pixel.copy(this.state.color);
                        }
                    }
                }
            }
            this.repaint = true;
            this.state.screenBufUnlocked = true;
        }
    }
    fillNonContiguous(startCoordinate) {
        if (this.state.screenBufUnlocked &&
            startCoordinate.first > 0 && startCoordinate.first < this.dimensions.first &&
            startCoordinate.second > 0 && startCoordinate.second < this.dimensions.second) {
            this.state.screenBufUnlocked = false;
            const startIndex = startCoordinate.first + startCoordinate.second * this.dimensions.first;
            const startPixel = this.screenBuffer[startIndex];
            const spc = new RGB(startPixel.red(), startPixel.green(), startPixel.blue(), startPixel.alpha());
            let i = 0;
            while (i < this.screenBuffer.length) {
                if (spc.compare(this.screenBuffer[i])) {
                    this.updatesStack.get(this.updatesStack.length() - 1).push(new Pair(i, new RGB(this.screenBuffer[i].red(), this.screenBuffer[i].green(), this.screenBuffer[i].blue(), this.screenBuffer[i].alpha())));
                    this.screenBuffer[i].copy(this.state.color);
                }
                i++;
            }
            this.state.screenBufUnlocked = true;
        }
    }
    fillArea(startCoordinate) {
        if (this.state.screenBufUnlocked &&
            startCoordinate.first > 0 && startCoordinate.first < this.dimensions.first &&
            startCoordinate.second > 0 && startCoordinate.second < this.dimensions.second) {
            this.state.screenBufUnlocked = false;
            let stack;
            if (this.state.slow) //possibly more visiually appealling algo (bfs), 
                //but slower because it makes much worse use of the cache with very high random access
                stack = new Queue();
            else
                stack = [];
            const checkedMap = new Array(this.dimensions.first * this.dimensions.second).fill(false);
            const startIndex = startCoordinate.first + startCoordinate.second * this.dimensions.first;
            const startPixel = this.screenBuffer[startIndex];
            const spc = new RGB(startPixel.red(), startPixel.green(), startPixel.blue(), startPixel.alpha());
            stack.push(startIndex);
            const length = this.screenBuffer.length;
            while (stack.length > 0) {
                const cur = stack.pop();
                const pixelColor = this.screenBuffer[cur];
                if (cur >= 0 && cur < length &&
                    pixelColor.compare(spc) && !checkedMap[cur] && this.state.bufferBitMask[cur]) {
                    checkedMap[cur] = true;
                    if (!pixelColor.compare(this.state.color)) {
                        this.updatesStack.get(this.updatesStack.length() - 1).push(new Pair(cur, new RGB(pixelColor.red(), pixelColor.green(), pixelColor.blue(), pixelColor.alpha())));
                        pixelColor.copy(this.state.color);
                    }
                    stack.push(cur + this.dimensions.first);
                    stack.push(cur - this.dimensions.first);
                    stack.push(cur - 1);
                    stack.push(cur + 1);
                }
            }
            this.state.screenBufUnlocked = true;
            this.repaint = true;
        }
    }
    getSelectedPixelGroupBitMask() {
        const selection = new DetailedPixelsGroup();
        for (let i = 0; i < this.state.bufferBitMask.length; ++i) {
            if (this.state.bufferBitMask[i] && this.screenBuffer[i].alpha()) {
                this.updatesStack.get(this.updatesStack.length() - 1).push(new Pair(i, new RGB(this.screenBuffer[i].red(), this.screenBuffer[i].green(), this.screenBuffer[i].blue(), this.screenBuffer[i].alpha())));
                const x = i % this.dimensions.first;
                const y = Math.floor(i / this.dimensions.first);
                selection.push(this.screenBuffer[i].color, x, y, x, y + 1, x + 1, y, x + 1, y + 1);
                this.screenBuffer[i].copy(this.noColor);
            }
        }
        this.updatesStack.push([]);
        return selection;
    }
    //Pair<offset point>, Map of colors encoded as numbers by location>
    getSelectedPixelGroupAuto(startCoordinate, countColor) {
        const selection = new DetailedPixelsGroup();
        if (this.state.screenBufUnlocked &&
            startCoordinate.first > 0 && startCoordinate.first < this.dimensions.first &&
            startCoordinate.second > 0 && startCoordinate.second < this.dimensions.second) {
            this.state.screenBufUnlocked = false;
            const stack = [];
            const defaultColor = this.noColor;
            const checkedMap = new Array(this.dimensions.first * this.dimensions.second).fill(false);
            const startIndex = startCoordinate.first + startCoordinate.second * this.dimensions.first;
            const startPixel = this.screenBuffer[startIndex];
            const spc = new RGB(startPixel.red(), startPixel.green(), startPixel.blue(), startPixel.alpha());
            stack.push(startIndex);
            this.dragDataMaxPoint = 0;
            this.dragDataMinPoint = this.dimensions.first * this.dimensions.second;
            while (stack.length > 0) {
                const cur = stack.pop();
                const pixelColor = this.screenBuffer[cur];
                if (cur >= 0 && cur < this.dimensions.first * this.dimensions.second &&
                    (pixelColor.alpha() !== 0 && (!countColor || pixelColor.color === spc.color)) && !checkedMap[cur] && this.state.bufferBitMask[cur]) {
                    checkedMap[cur] = true;
                    this.updatesStack.get(this.updatesStack.length() - 1).push(new Pair(cur, new RGB(pixelColor.red(), pixelColor.green(), pixelColor.blue(), pixelColor.alpha())));
                    //top left
                    /*data.push(cur % this.dimensions.first);
                    data.push(Math.floor(cur / this.dimensions.first));
                    //top right
                    data.push(cur % this.dimensions.first + 1);
                    data.push(Math.floor(cur / this.dimensions.first));
                    //bottom left
                    data.push(cur % this.dimensions.first);
                    data.push(Math.floor(cur / this.dimensions.first) + 1);
                    //bottom right
                    data.push(cur % this.dimensions.first + 1);
                    data.push(Math.floor(cur / this.dimensions.first) + 1);*/
                    const x = cur % this.dimensions.first;
                    const y = Math.floor(cur / this.dimensions.first);
                    selection.push(this.screenBuffer[cur].color, x, y, x, y + 1, x + 1, y, x + 1, y + 1);
                    //data.push(pixelColor.color);
                    pixelColor.copy(defaultColor);
                    if (cur > this.dragDataMaxPoint)
                        this.dragDataMaxPoint = cur;
                    if (cur < this.dragDataMinPoint)
                        this.dragDataMinPoint = cur;
                    if (!checkedMap[cur + 1])
                        stack.push(cur + 1);
                    if (!checkedMap[cur - 1])
                        stack.push(cur - 1);
                    if (!checkedMap[cur + this.dimensions.first])
                        stack.push(cur + this.dimensions.first);
                    if (!checkedMap[cur - this.dimensions.first])
                        stack.push(cur - this.dimensions.first);
                    if (!checkedMap[cur + this.dimensions.first - 1])
                        stack.push(cur + this.dimensions.first - 1);
                    if (!checkedMap[cur + this.dimensions.first + 1])
                        stack.push(cur + this.dimensions.first + 1);
                    if (!checkedMap[cur - this.dimensions.first - 1])
                        stack.push(cur - this.dimensions.first - 1);
                    if (!checkedMap[cur - this.dimensions.first + 1])
                        stack.push(cur - this.dimensions.first + 1);
                }
            }
            this.updatesStack.push([]);
            this.state.screenBufUnlocked = true;
        }
        return selection;
    }
    //Pair<offset point>, Map of colors encoded as numbers by location>
    autoOutline(startCoordinate, countColor) {
        if (this.state.screenBufUnlocked &&
            startCoordinate.first > 0 && startCoordinate.first < this.dimensions.first &&
            startCoordinate.second > 0 && startCoordinate.second < this.dimensions.second) {
            this.state.screenBufUnlocked = false;
            const stack = [];
            const defaultColor = this.noColor;
            const checkedMap = new Array(this.dimensions.first * this.dimensions.second).fill(false);
            const startIndex = startCoordinate.first + startCoordinate.second * this.dimensions.first;
            const startPixel = this.screenBuffer[startIndex];
            const spc = new RGB(startPixel.red(), startPixel.green(), startPixel.blue(), startPixel.alpha());
            stack.push(startIndex);
            while (stack.length > 0) {
                const cur = stack.pop();
                const pixelColor = this.screenBuffer[cur];
                if (pixelColor &&
                    pixelColor.alpha() !== 0 && (!countColor || pixelColor.color === spc.color) && !checkedMap[cur] && this.state.bufferBitMask[cur]) {
                    checkedMap[cur] = true;
                    if (!checkedMap[cur + 1])
                        stack.push(cur + 1);
                    if (!checkedMap[cur - 1])
                        stack.push(cur - 1);
                    if (!checkedMap[cur + this.dimensions.first])
                        stack.push(cur + this.dimensions.first);
                    if (!checkedMap[cur - this.dimensions.first])
                        stack.push(cur - this.dimensions.first);
                    if (!checkedMap[cur + this.dimensions.first - 1])
                        stack.push(cur + this.dimensions.first - 1);
                    if (!checkedMap[cur + this.dimensions.first + 1])
                        stack.push(cur + this.dimensions.first + 1);
                    if (!checkedMap[cur - this.dimensions.first - 1])
                        stack.push(cur - this.dimensions.first - 1);
                    if (!checkedMap[cur - this.dimensions.first + 1])
                        stack.push(cur - this.dimensions.first + 1);
                }
                else if (pixelColor && !checkedMap[cur] && this.state.bufferBitMask[cur]) {
                    checkedMap[cur] = true;
                    this.updatesStack.get(this.updatesStack.length() - 1).push(new Pair(cur, new RGB(pixelColor.red(), pixelColor.green(), pixelColor.blue(), pixelColor.alpha())));
                    pixelColor.copy(this.state.color);
                }
            }
            this.state.screenBufUnlocked = true;
        }
    }
    rotateSelectedPixelGroup(theta, centerPoint) {
        if (this.dragData === null)
            return;
        const min = [this.dragDataMinPoint % this.dimensions.first, Math.floor(this.dragDataMinPoint / this.dimensions.first)];
        const max = [this.dragDataMaxPoint % this.dimensions.first, Math.floor(this.dragDataMaxPoint / this.dimensions.first)];
        const dx = Math.floor(centerPoint[0]);
        const dy = Math.floor(centerPoint[1]);
        this.dragDataMinPoint = this.dimensions.first * this.dimensions.second;
        this.dragDataMaxPoint = 0;
        const initTransMatrix = [1, 0, dx,
            0, 1, dy,
            0, 0, 1];
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);
        const rotationMatrix = [cos, -sin, 0,
            sin, cos, 0,
            0, 0, 1];
        const revertTransMatrix = [1, 0, dx * -1,
            0, 1, dy * -1,
            0, 0, 1];
        const finalTransformationMatrix = threeByThreeMat(threeByThreeMat(initTransMatrix, rotationMatrix), revertTransMatrix);
        const vec = [0, 0, 0];
        const data = [];
        const rotate = (data, index) => {
            vec[0] = data[index];
            vec[1] = data[index + 1];
            vec[2] = 1;
            let transformed = matByVec(finalTransformationMatrix, vec);
            const point = Math.floor(transformed[0]) + Math.floor(transformed[1]) * this.dimensions.first;
            if (point < this.dragDataMinPoint && point >= 0)
                this.dragDataMinPoint = point;
            if (point > this.dragDataMaxPoint)
                this.dragDataMaxPoint = point;
            if (this.state.antiAliasRotation) {
                data[index] = (transformed[0]);
                data[index + 1] = (transformed[1]);
            }
            else {
                data[index] = (Math.round(transformed[0]));
                data[index + 1] = (Math.round(transformed[1]));
            }
        };
        for (let i = 0, j = 0; i < this.dragData.topLeftPoints.length; i += 2, j++) {
            rotate(this.dragData.topLeftPoints, i);
            rotate(this.dragData.topRightPoints, i);
            rotate(this.dragData.bottomLeftPoints, i);
            rotate(this.dragData.bottomRightPoints, i);
            //data.push(this.dragData.second[i+8]);
        }
        //this.dragData.second = data;
    }
    drawRect(start, end, drawPoint = (x, y, screen) => screen.handleTap(x, y)) {
        this.drawLine(start, [start[0], end[1]], drawPoint);
        this.drawLine(start, [end[0], start[1]], drawPoint);
        this.drawLine([start[0], end[1]], end, drawPoint);
        this.drawLine([end[0], start[1]], end, drawPoint);
    }
    drawLine(start, end, drawPoint = (x, y, screen) => screen.handleTap(x, y)) {
        this.handleDraw(start[0], end[0], start[1], end[1], drawPoint);
    }
    handleDraw(x1, x2, y1, y2, drawPoint = (x, y, screen) => screen.handleTap(x, y)) {
        //draw line from current touch pos to the touchpos minus the deltas
        //calc equation for line
        const deltaY = y2 - y1;
        const deltaX = x2 - x1;
        const m = deltaY / deltaX;
        const b = y2 - m * x2;
        const delta = this.state.lineWidth <= 4 ? 0.1 : (this.state.drawCircular ? (this.state.lineWidth < 16 ? 1 : this.state.lineWidth / 16) : 1);
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            const min = Math.min(x1, x2);
            const max = Math.max(x1, x2);
            for (let x = min; x < max; x += delta) {
                const y = m * x + b;
                drawPoint(x, y, this);
            }
        }
        else {
            const min = Math.min(y1, y2);
            const max = Math.max(y1, y2);
            for (let y = min; y < max; y += delta) {
                const x = Math.abs(deltaX) > 0 ? (y - b) / m : x2;
                drawPoint(x, y, this);
            }
        }
        this.repaint = true;
    }
    handleEllipse(sx, ex, mx, my, drawPoint = this.handleTap) {
        const start_x = sx;
        const end_x = ex;
        const min_y = mx;
        const max_y = my;
        const height = (max_y - min_y) / 2;
        const width = (end_x - start_x) / 2;
        const h = start_x + (end_x - start_x) / 2;
        const k = min_y + (max_y - min_y) / 2;
        let last = [h + width * Math.cos(0), k + height * Math.sin(0)];
        for (let x = -0.1; x < 2 * Math.PI; x += 0.05) {
            const cur = [h + width * Math.cos(x), k + height * Math.sin(x)];
            this.drawLine([last[0], last[1]], [cur[0], cur[1]], drawPoint);
            last = cur;
        }
    }
    async undoLast() {
        if (this.updatesStack.length() && this.state.screenBufUnlocked) {
            this.state.screenBufUnlocked = false;
            const data = this.updatesStack.pop();
            try {
                const backedUpFrame = [];
                const divisor = 60 * 10;
                const interval = Math.floor(data.length / divisor) === 0 ? 1 : Math.floor(data.length / divisor);
                let intervalCounter = 0;
                for (let i = 0; i < data.length; i++) {
                    intervalCounter++;
                    const el = data[i];
                    if (this.screenBuffer[el.first]) {
                        backedUpFrame.push(el);
                        const color = (this.screenBuffer[el.first]).color;
                        this.screenBuffer[el.first].copy(el.second);
                        el.second.color = color;
                    }
                    if (intervalCounter % interval === 0 && this.state.slow) {
                        await sleep(1);
                        this.repaint = true;
                    }
                }
                this.undoneUpdatesStack.push(backedUpFrame);
                this.repaint = true;
                this.state.screenBufUnlocked = true;
            }
            catch (error) {
                this.repaint = true;
                this.state.screenBufUnlocked = true;
                console.log(error);
            }
        }
        else {
            console.log("Error, nothing to undo");
        }
    }
    async redoLast() {
        if (this.undoneUpdatesStack.length() && this.state.screenBufUnlocked) {
            try {
                this.state.screenBufUnlocked = false;
                const data = this.undoneUpdatesStack.pop();
                const backedUpFrame = [];
                const divisor = 60 * 10;
                const interval = Math.floor(data.length / divisor) === 0 ? 1 : Math.floor(data.length / divisor);
                let intervalCounter = 0;
                for (let i = 0; i < data.length; i++) {
                    intervalCounter++;
                    const el = data[i];
                    if (this.screenBuffer[el.first]) {
                        backedUpFrame.push(el);
                        const color = this.screenBuffer[el.first].color;
                        this.screenBuffer[el.first].copy(el.second);
                        el.second.color = color;
                    }
                    if (intervalCounter % interval === 0 && this.state.slow) {
                        await sleep(1);
                        this.repaint = true;
                    }
                }
                this.repaint = true;
                this.updatesStack.push(backedUpFrame);
                this.state.screenBufUnlocked = true;
            }
            catch (error) {
                this.repaint = true;
                this.state.screenBufUnlocked = true;
                console.log(error);
            }
        }
        else {
            console.log("Error, nothing to redo");
        }
    }
    inBufferBounds(x, y) {
        return x >= 0 && x < this.dimensions.first && y >= 0 && y < this.dimensions.second;
    }
    setDim(newDim) {
        let zoom = new Pair(1, 1);
        if (newDim.length === 2) {
            {
                this.bounds.first = newDim[0];
                this.bounds.second = newDim[1];
            }
            const bounds = [this.bounds.first, this.bounds.second];
            if (this.screenBuffer.length != newDim[0] * newDim[1]) {
                const canvas = document.createElement("canvas");
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.spriteScreenBuf.putPixels(this.ctx);
                this.screenBuffer = [];
                for (let i = 0; i < newDim[0] * newDim[1]; i++)
                    this.screenBuffer.push(new RGB(this.noColor.red(), this.noColor.green(), this.noColor.blue(), this.noColor.alpha()));
                const sprite = new Sprite([], newDim[0], newDim[1], false);
                //buggy when resizing to a different aspect ratio
                if (this.state.resizeSprite) {
                    this.undoneUpdatesStack.empty();
                    this.updatesStack.empty();
                    canvas.width = newDim[0];
                    canvas.height = newDim[1];
                    const ctx = canvas.getContext("2d");
                    ctx.imageSmoothingEnabled = false;
                    ctx.drawImage(this.canvas, 0, 0, newDim[0], newDim[1]);
                    sprite.imageData = ctx.getImageData(0, 0, newDim[0], newDim[1]);
                    sprite.pixels = sprite.imageData.data;
                    sprite.copyToBuffer(this.screenBuffer, newDim[0], newDim[1]);
                }
                else {
                    canvas.width = this.dimensions.first;
                    canvas.height = this.dimensions.second;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(this.canvas, 0, 0, this.dimensions.first, this.dimensions.second);
                    sprite.width = this.dimensions.first;
                    sprite.height = this.dimensions.second;
                    sprite.imageData = ctx.getImageData(0, 0, this.dimensions.first, this.dimensions.second);
                    sprite.pixels = sprite.imageData.data;
                    sprite.copyToBuffer(this.screenBuffer, newDim[0], newDim[1]);
                }
                this.spriteScreenBuf = new Sprite([], this.bounds.first, this.bounds.second);
            }
            this.canvas.width = bounds[0];
            this.canvas.height = bounds[1];
            this.ctx = this.canvas.getContext("2d");
            this.dimensions = new Pair(newDim[0], newDim[1]);
            this.clipBoard.resize(newDim);
            this.repaint = true;
        }
        return zoom;
    }
    lowerPixelPercentage(a) {
        const frac = a - Math.floor(a);
        return 1 - frac;
    }
    loadSprite(sprite) {
        const preUpdate = [];
        for (let i = 0; i < this.screenBuffer.length; i++) {
            const color = this.screenBuffer[i];
            preUpdate.push(new Pair(i, new RGB(color.red(), color.green(), color.blue(), color.alpha())));
        }
        this.updatesStack.push(preUpdate);
        this.updateLabelUndoRedoCount();
        sprite.copyToBuffer(this.screenBuffer, this.dimensions.first, this.dimensions.second);
        console.log("Loaded to screen:");
        this.repaint = true;
    }
    setPixel(index, color) {
        index <<= 2;
        this.spriteScreenBuf.pixels[index++] = color.red();
        this.spriteScreenBuf.pixels[index++] = color.green();
        this.spriteScreenBuf.pixels[index++] = color.blue();
        this.spriteScreenBuf.pixels[index++] = color.alpha();
    }
    saveDragDataToScreen() {
        if (this.dragData) {
            let counter = 0;
            const color = new RGB(0, 0, 0, 0);
            const dragDataColors = this.dragData.colors;
            const topLeftPoints = this.dragData.topLeftPoints;
            for (let i = 0, j = 0; i < topLeftPoints.length; i += 2, j++) {
                counter++;
                const x = Math.floor(topLeftPoints[i] + this.dragData.x);
                const y = Math.floor(topLeftPoints[i + 1] + this.dragData.y);
                const key = (x + y * this.dimensions.first);
                if (this.inBufferBounds(x, y) && (this.state.allowDropOutsideSelection || this.state.bufferBitMask[key])) {
                    color.color = dragDataColors[j];
                    this.updatesStack.get(this.updatesStack.length() - 1).push(new Pair(key, new RGB(this.screenBuffer[key].red(), this.screenBuffer[key].green(), this.screenBuffer[key].blue(), this.screenBuffer[key].alpha())));
                    if (color.alpha() !== 255 && this.state.blendAlphaOnPutSelectedPixels)
                        this.screenBuffer[key].blendAlphaCopy(color);
                    else
                        this.screenBuffer[key].color = color.color;
                }
            }
            this.dragData.resetState();
            this.repaint = true;
        }
    }
    async saveDragDataToScreenAntiAliased() {
        if (this.dragData) {
            let counter = 0;
            const color0 = new RGB(0, 0, 0, 0);
            const color1 = new RGB(0, 0, 0, 0);
            const dragDataColors = this.dragData.colors;
            const map = new Map();
            for (let i = 0, k = 0; i < this.dragData.topLeftPoints.length; i += 2, k++) {
                counter++;
                if ((counter & ((2 << 16) - 1)) === 0)
                    await sleep(1);
                const x1 = this.dragData.topLeftPoints[i] + Math.floor(this.dragData.x);
                const y1 = this.dragData.topLeftPoints[i + 1] + Math.floor(this.dragData.y);
                const x2 = this.dragData.topRightPoints[i] + Math.floor(this.dragData.x);
                const y2 = this.dragData.topRightPoints[i + 1] + Math.floor(this.dragData.y);
                const x3 = this.dragData.bottomRightPoints[i] + Math.floor(this.dragData.x);
                const y3 = this.dragData.bottomRightPoints[i + 1] + Math.floor(this.dragData.y);
                const deltaX = Math.max(x1, x2) - Math.min(x1, x2);
                const deltaY = Math.max(y1, y2) - Math.min(y1, y2);
                const deltaX2 = Math.max(x1, x3) - Math.min(x1, x3);
                const deltaY2 = Math.max(y1, y3) - Math.min(y1, y3);
                color0.color = this.dragData.colors[k];
                const limit = 10;
                const ratio = 1 / limit;
                const percent = 1 / (limit * limit);
                for (let j = 0; j <= limit; j++) {
                    for (let k = 0; k <= limit; k++) {
                        counter++;
                        const sub_x = Math.floor(k * ratio * deltaX + j * ratio * deltaX2 + x1);
                        const sub_y = Math.floor(k * ratio * deltaY + j * ratio * deltaY2 + y1);
                        const pixelIndex = sub_x + sub_y * this.dimensions.first;
                        let color = map.get((sub_x << 16) | sub_y);
                        if (!color) {
                            color = [0, 0, 0, 0, 0];
                        }
                        if (color[4] < 1) {
                            color[0] += color0.red() * percent;
                            color[1] += color0.green() * percent;
                            color[2] += color0.blue() * percent;
                            color[3] += color0.alpha() * percent;
                            color[4] += percent;
                        }
                        map.set((sub_x << 16) | sub_y, color);
                    }
                }
            }
            for (const [key, value] of map.entries()) {
                color0.setRed(value[0]);
                color0.setGreen(value[1]);
                color0.setBlue(value[2]);
                color0.setAlpha(value[3]);
                const x = key >> 16;
                const y = key & (0x0000FFFF);
                const newKey = x + y * this.dimensions.first;
                if (this.inBufferBounds(x, y) && (this.state.allowDropOutsideSelection || this.state.bufferBitMask[newKey])) {
                    this.updatesStack.get(this.updatesStack.length() - 1).push(new Pair(newKey, new RGB(this.screenBuffer[newKey].red(), this.screenBuffer[newKey].green(), this.screenBuffer[newKey].blue(), this.screenBuffer[newKey].alpha())));
                    this.screenBuffer[newKey].blendAlphaCopy(color0);
                }
            }
            ;
            this.dragData.resetState();
            this.repaint = true;
        }
    }
    getTouchPosX() {
        return this.toolSelector.field.zoom.invZoomX(this.toolSelector.drawingScreenListener.touchPos[0]);
    }
    getTouchPosY() {
        return this.toolSelector.field.zoom.invZoomY(this.toolSelector.drawingScreenListener.touchPos[1]);
    }
    renderToBuffer(spriteBuffer) {
        const view = new Uint32Array(spriteBuffer.pixels.buffer);
        if (this.dimensions.first === this.canvas.width && this.dimensions.second === this.canvas.height) { //if drawing screen dimensions, and canvas dimensions are the same just update per pixel
            let index = 0;
            const limit = view.length === this.screenBuffer.length ? view.length - 8 : this.screenBuffer.length - 8;
            for (; index < limit;) {
                view[index] = this.screenBuffer[index].color;
                ++index;
                view[index] = this.screenBuffer[index].color;
                ++index;
                view[index] = this.screenBuffer[index].color;
                ++index;
                view[index] = this.screenBuffer[index].color;
                ++index;
                view[index] = this.screenBuffer[index].color;
                ++index;
                view[index] = this.screenBuffer[index].color;
                ++index;
                view[index] = this.screenBuffer[index].color;
                ++index;
                view[index] = this.screenBuffer[index].color;
                ++index;
            }
            for (; index < this.screenBuffer.length;) {
                view[index] = this.screenBuffer[index].color;
                index++;
            }
        }
        else if (this.dimensions.first * 2 === this.canvas.width && this.dimensions.second * 2 === this.canvas.height) {
            let index = 0;
            let bufferIndex = 0;
            for (let y = 0; y < spriteBuffer.height; y += 2) {
                for (let x = 0; x < spriteBuffer.width; x += 2) {
                    const color = this.screenBuffer[index].color;
                    bufferIndex = (x + y * spriteBuffer.width);
                    view[bufferIndex++] = color;
                    view[bufferIndex] = color;
                    bufferIndex += (spriteBuffer.width - 1);
                    view[bufferIndex++] = color;
                    view[bufferIndex] = color;
                    index++;
                }
            }
        }
        else if (this.dimensions.first * 4 === this.canvas.width && this.dimensions.second * 4 === this.canvas.height) {
            let index = 0;
            let bufferIndex = 0;
            for (let y = 0; y < spriteBuffer.height; y += 4) {
                for (let x = 0; x < spriteBuffer.width; x += 4) {
                    const color = this.screenBuffer[index].color;
                    bufferIndex = (x + y * spriteBuffer.width);
                    view[bufferIndex++] = color;
                    view[bufferIndex++] = color;
                    view[bufferIndex++] = color;
                    view[bufferIndex] = color;
                    bufferIndex += (spriteBuffer.width - 3);
                    view[bufferIndex++] = color;
                    view[bufferIndex++] = color;
                    view[bufferIndex++] = color;
                    view[bufferIndex] = color;
                    bufferIndex += (spriteBuffer.width - 3);
                    view[bufferIndex++] = color;
                    view[bufferIndex++] = color;
                    view[bufferIndex++] = color;
                    view[bufferIndex] = color;
                    bufferIndex += (spriteBuffer.width - 3);
                    view[bufferIndex++] = color;
                    view[bufferIndex++] = color;
                    view[bufferIndex++] = color;
                    view[bufferIndex] = color;
                    bufferIndex += (spriteBuffer.width - 3);
                    index++;
                }
            }
        }
        else //use fill rect method to fill rectangle the size of pixels(more branch mispredicts, but more general)
         {
            const cellHeight = Math.floor(this.bounds.second / this.dimensions.second);
            const cellWidth = Math.floor(this.bounds.first / this.dimensions.first);
            let k = 0;
            for (let y = 0; y < this.dimensions.second * cellHeight; y += cellHeight, k++) {
                let j = k * this.dimensions.first;
                for (let x = 0; x < this.dimensions.first * cellWidth; x += cellWidth, j++) {
                    spriteBuffer.fillRect(this.screenBuffer[j], x, y, cellWidth, cellHeight, view);
                }
            }
        }
    }
    draw() {
        if (this.repaint) {
            this.repaint = false;
            const ctx = this.ctx;
            const cellHeight = (this.bounds.second / this.dimensions.second);
            const cellWidth = (this.bounds.first / this.dimensions.first);
            const spriteScreenBuf = this.spriteScreenBuf;
            const source = new RGB(0, 0, 0, 0);
            const toCopy = new RGB(0, 0, 0, 0);
            this.renderToBuffer(spriteScreenBuf);
            if (this.dragData) {
                const dragDataColors = this.dragData.colors;
                const dragDataPoints = this.dragData.topLeftPoints;
                const dragDataOffsetX = Math.floor(this.dragData.x);
                const dragDataOffsetY = Math.floor(this.dragData.y);
                const view = new Uint32Array(spriteScreenBuf.pixels.buffer);
                for (let i = 0, j = 0; i < dragDataPoints.length; i += 2, j++) {
                    const bx = Math.floor(dragDataPoints[i] + dragDataOffsetX);
                    const by = Math.floor(dragDataPoints[i + 1] + dragDataOffsetY);
                    if (this.inBufferBounds(bx, by)) {
                        const key = bx + by * this.dimensions.first;
                        toCopy.color = dragDataColors[j];
                        source.color = this.screenBuffer[key].color;
                        source.blendAlphaCopy(toCopy);
                        view[key] = source.color;
                    }
                }
                ;
            }
            if (this.toolSelector.drawingScreenListener && this.toolSelector.drawingScreenListener.registeredTouch && this.toolSelector.selectedToolName() === "paste") {
                const dest_x = Math.floor(((this.getTouchPosX() - this.clipBoard.sprite.width / 2) - this.offset.first) / this.bounds.first * this.dimensions.first);
                const dest_y = Math.floor(((this.getTouchPosY() - this.clipBoard.sprite.height / 2) - this.offset.second) / this.bounds.second * this.dimensions.second);
                const width = this.clipBoard.sprite.width;
                const initialIndex = dest_x + dest_y * this.dimensions.first;
                const clipboardView = new Uint32Array(this.clipBoard.sprite.pixels.buffer);
                const spriteView = new Uint32Array(spriteScreenBuf.pixels.buffer);
                for (let i = 0; i < clipboardView.length; i++) {
                    const copyAreaX = i % width;
                    const copyAreaY = Math.floor(i / width);
                    const destIndex = initialIndex + copyAreaX + copyAreaY * this.dimensions.first;
                    const x = destIndex % this.dimensions.first;
                    const y = Math.floor(destIndex / this.dimensions.first);
                    source.color = clipboardView[i];
                    if (this.inBufferBounds(dest_x + copyAreaX, dest_y + copyAreaY)) {
                        toCopy.color = this.screenBuffer[destIndex].color;
                        if (this.state.blendAlphaOnPaste) {
                            blendAlphaCopy(toCopy, source);
                            spriteView[destIndex] = toCopy.color;
                        }
                        else
                            spriteView[destIndex] = source.color;
                    }
                }
            }
            spriteScreenBuf.putPixels(ctx);
        }
    }
    drawToContextAsSprite(ctx, x, y, width = this.dimensions.first, height = this.dimensions.second) {
        if (this.repaint) {
            this.renderToBuffer(this.spriteScreenBuf);
        }
        this.spriteScreenBuf.putPixels(this.ctx);
        const oldAlpha = ctx.globalAlpha;
        if (oldAlpha !== this.drawWithAlpha) {
            ctx.globalAlpha = this.drawWithAlpha;
            ctx.drawImage(this.canvas, x, y, width, height);
            ctx.globalAlpha = oldAlpha;
        }
        else
            ctx.drawImage(this.canvas, x, y, width, height);
    }
    drawToContext(ctx, x, y, width = this.dimensions.first, height = this.dimensions.second) {
        this.draw();
        const oldAlpha = ctx.globalAlpha;
        if (oldAlpha !== this.drawWithAlpha) {
            ctx.globalAlpha = this.drawWithAlpha;
            ctx.drawImage(this.canvas, x, y, width, height);
            ctx.globalAlpha = oldAlpha;
        }
        else
            ctx.drawImage(this.canvas, x, y, width, height);
    }
}
;
class ZoomState {
    constructor() {
        this.zoomX = 1;
        this.zoomY = 1;
        this.miniMapRect = [0, 0, 150, 150];
        this.zoomedX = 0;
        this.zoomedY = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }
    invZoomX(x) {
        return (1 / (this.zoomX)) * (x - this.zoomedX);
    }
    invZoomY(y) {
        return (1 / (this.zoomY)) * (y - this.zoomedY);
    }
    invJustZoomX(x) {
        return (1 / (this.zoomX)) * (x);
    }
    invJustZoomY(y) {
        return (1 / (this.zoomY)) * (y);
    }
}
;
;
class LayeredDrawingScreen {
    constructor(keyboardHandler, pallette) {
        this.state = new DrawingScreenState(3);
        this.miniMapAlpha = 1;
        this.toolSelector = null;
        this.redraw = false;
        this.maskWorkerExecutionCount = 0;
        this.scheduledMaskOperation = [];
        this.canvas = document.createElement("canvas");
        this.offscreenCanvas = document.createElement("canvas");
        this.canvasTransparency = document.createElement("canvas");
        this.canvasPixelGrid = document.createElement("canvas");
        this.selectionCanvas = document.createElement("canvas");
        this.maskWorkers = [];
        const poolSize = window.navigator.hardwareConcurrency < 4 ? 4 : window.navigator.hardwareConcurrency;
        for (let i = 0; i < poolSize; i++) {
            const worker = new Worker("polygonalSelectionWorker.js");
            this.maskWorkers.push(worker);
            worker.addEventListener("message", (event) => {
                let j = 0;
                this.maskWorkerExecutionCount--;
                let i = event.data.start;
                for (; i < event.data.end - 16;) {
                    this.state.bufferBitMask[i++] = event.data.result[j++];
                    this.state.bufferBitMask[i++] = event.data.result[j++];
                    this.state.bufferBitMask[i++] = event.data.result[j++];
                    this.state.bufferBitMask[i++] = event.data.result[j++];
                    this.state.bufferBitMask[i++] = event.data.result[j++];
                    this.state.bufferBitMask[i++] = event.data.result[j++];
                    this.state.bufferBitMask[i++] = event.data.result[j++];
                    this.state.bufferBitMask[i++] = event.data.result[j++];
                    this.state.bufferBitMask[i++] = event.data.result[j++];
                    this.state.bufferBitMask[i++] = event.data.result[j++];
                    this.state.bufferBitMask[i++] = event.data.result[j++];
                    this.state.bufferBitMask[i++] = event.data.result[j++];
                    this.state.bufferBitMask[i++] = event.data.result[j++];
                    this.state.bufferBitMask[i++] = event.data.result[j++];
                    this.state.bufferBitMask[i++] = event.data.result[j++];
                    this.state.bufferBitMask[i++] = event.data.result[j++];
                }
                for (; i < event.data.end;) {
                    this.state.bufferBitMask[i++] = event.data.result[j++];
                }
            });
        }
        this.dim = [128, 128];
        this.renderDim = [this.dim[0], this.dim[1]];
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
        this.setDimOnCurrent(this.dim);
        this.zoom = new ZoomState();
        this.clipBoard = new ClipBoard(document.getElementById("clipboard_canvas"), keyboardHandler, 128, 128);
    }
    update() {
        if (this.maskWorkerExecutionCount === 0 && this.scheduledMaskOperation.length) {
            for (let i = 0; i < this.scheduledMaskOperation.length; i++) {
                this.maskWorkers[i].postMessage(this.scheduledMaskOperation[i]);
                this.maskWorkerExecutionCount++;
            }
            this.scheduledMaskOperation = [];
        }
    }
    scheduleUpdateMaskPolygon(shape) {
        if (shape.length > 2) {
            const lenPerWorker = Math.floor(this.state.bufferBitMask.length / this.maskWorkers.length);
            const remainder = this.state.bufferBitMask.length - Math.floor(this.state.bufferBitMask.length / lenPerWorker) * lenPerWorker;
            let i = 0;
            this.scheduledMaskOperation = [];
            for (; i < this.maskWorkers.length - 1; i++) {
                const message = {
                    start: i * lenPerWorker,
                    end: (i + 1) * lenPerWorker,
                    height: this.height(),
                    width: this.layer().dimensions.first,
                    polygon: shape,
                    poolIndex: i
                };
                this.scheduledMaskOperation.push(message);
            }
            const message = {
                start: i * lenPerWorker,
                end: (i + 1) * lenPerWorker + remainder,
                height: this.height(),
                width: this.layer().dimensions.first,
                polygon: shape,
                poolIndex: i
            };
            this.scheduledMaskOperation.push(message);
        }
        else {
            for (let i = 0; i < this.state.bufferBitMask.length; i++)
                this.state.bufferBitMask[i] = true;
        }
    }
    updateBitMaskRectangle(rect) {
        if (rect.length === 4) {
            //converts values in screenspace to canvas space
            const convertX = (x) => Math.floor(x / this.width() * this.layer().dimensions.first);
            const convertY = (y) => Math.floor(y / this.height() * this.height());
            this.clearBitMask();
            for (let y = 0; y < this.height(); ++y) {
                for (let x = 0; x < this.layer().dimensions.first; ++x) {
                    const key = x + y * this.layer().dimensions.first;
                    this.state.bufferBitMask[key] = x >= convertX(rect[0]) && x <= convertX(rect[0] + rect[2]) && y >= convertY(rect[1]) && y <= convertY(rect[1] + rect[3]);
                }
            }
        }
        else {
            console.log("Error, invalid rectangle for bitmask");
        }
    }
    clearBitMask() {
        let i = 0;
        for (; i < this.state.bufferBitMask.length - 16; ++i) {
            this.state.bufferBitMask[i] = true;
            this.state.bufferBitMask[++i] = true;
            this.state.bufferBitMask[++i] = true;
            this.state.bufferBitMask[++i] = true;
            this.state.bufferBitMask[++i] = true;
            this.state.bufferBitMask[++i] = true;
            this.state.bufferBitMask[++i] = true;
            this.state.bufferBitMask[++i] = true;
            this.state.bufferBitMask[++i] = true;
            this.state.bufferBitMask[++i] = true;
            this.state.bufferBitMask[++i] = true;
            this.state.bufferBitMask[++i] = true;
            this.state.bufferBitMask[++i] = true;
            this.state.bufferBitMask[++i] = true;
            this.state.bufferBitMask[++i] = true;
            this.state.bufferBitMask[++i] = true;
        }
        for (; i < this.state.bufferBitMask.length; ++i) {
            this.state.bufferBitMask[i] = true;
        }
    }
    repaint() {
        let repaint = this.redraw;
        for (let i = 0; !repaint && i < this.layers.length; i++) {
            repaint = this.layers[i].repaint;
        }
        return repaint;
    }
    zoomToScreen() {
        if (this.zoom) {
            const whRatio = (this.zoom.zoomX / this.zoom.zoomY);
            this.zoom.offsetX = 0;
            this.zoom.offsetY = 0;
            this.zoom.zoomY = this.renderDim[1] / this.height();
            this.zoom.zoomX = this.zoom.zoomY * whRatio;
        }
    }
    setDimOnCurrent(dim) {
        if (this.toolSelector && this.toolSelector.settingsTool)
            this.toolSelector.settingsTool.setDim(dim);
        this.layers.forEach(layer => {
            const zoom = layer.setDim(dim);
        });
        this.zoomToScreen();
        if (this.state.bufferBitMask.length !== dim[0] * dim[1]) {
            this.state.bufferBitMask = [];
            for (let i = 0; i < dim[0] * dim[1]; ++i)
                this.state.bufferBitMask.push(true);
        }
        if (this.layers[0]) {
            const bounds = [this.layers[0].bounds.first, this.layers[0].bounds.second];
            this.dim = [bounds[0], bounds[1]];
            this.canvas.width = bounds[0];
            this.canvas.height = bounds[1];
            this.selectionCanvas.width = bounds[0];
            this.selectionCanvas.height = bounds[1];
            this.ctx = this.canvas.getContext("2d");
            this.resizeTransparencyCanvas(bounds, bounds[0] / this.layers[0].dimensions.first * 8);
            this.resizePixelGridCanvas(bounds, bounds[0] / this.layers[0].dimensions.first);
        }
    }
    resizePixelGridCanvas(bounds, dim) {
        if ((this.canvasPixelGrid.width !== bounds[0] || this.canvasPixelGrid.height !== bounds[1])) {
            this.canvasPixelGrid.width = bounds[0];
            this.canvasPixelGrid.height = bounds[1];
        }
        const ctx = this.canvasPixelGrid.getContext("2d");
        ctx.fillStyle = "#DCDCFF";
        ctx.globalAlpha = 0.4;
        ctx.clearRect(0, 0, bounds[0], bounds[1]);
        ctx.fillRect(0, 0, bounds[0], bounds[1]);
        let i = 0;
        const squareSize = dim;
        for (let y = 0; y < bounds[1] + 100; y += squareSize) {
            let offset = +(i % 2 === 0);
            for (let x = offset * squareSize; x < bounds[0] + 200; x += squareSize * 2) {
                ctx.clearRect(x, y, squareSize, squareSize);
            }
            i++;
        }
    }
    resizeTransparencyCanvas(bounds, dim) {
        if ((this.canvasTransparency.width !== bounds[0] || this.canvasTransparency.height !== bounds[1])) {
            this.canvasTransparency.width = bounds[0];
            this.canvasTransparency.height = bounds[1];
        }
        const ctx = this.canvasTransparency.getContext("2d");
        ctx.fillStyle = "#DCDCDF";
        ctx.globalAlpha = 0.7;
        ctx.clearRect(0, 0, bounds[0], bounds[1]);
        ctx.fillRect(0, 0, bounds[0], bounds[1]);
        let i = 0;
        const squareSize = dim;
        for (let y = 0; y < bounds[1] + 100; y += squareSize) {
            let offset = +(i % 2 === 0);
            for (let x = offset * squareSize; x < bounds[0] + 200; x += squareSize * 2) {
                ctx.clearRect(x, y, squareSize, squareSize);
            }
            i++;
        }
    }
    swapLayers(x1, x2) {
        if (x1 >= 0 && x1 < this.layers.length && x2 < this.layers.length && x2 >= 0) {
            const temp = this.layers[x1];
            const temp2 = this.layersState[x1];
            this.layers[x1] = this.layers[x2];
            this.layers[x2] = temp;
            this.layersState[x1] = this.layersState[x2];
            this.layersState[x2] = temp2;
            this.redraw = true;
        }
    }
    layer() {
        return this.layers[this.selected];
    }
    deleteLayer(index) {
        if (this.layers.length > 1 && this.layers.length > index && index >= 0) {
            this.layers.splice(index, 1);
            this.layersState.splice(index, 1);
            if (this.selected && this.selected >= this.layers.length)
                this.selected = this.layers.length - 1;
            this.redraw = true;
        }
    }
    loadImageToLayer(image) {
        const bounds = [image.width, image.height];
        this.offscreenCanvas.width = bounds[0];
        this.offscreenCanvas.height = bounds[1];
        const sprite = new Sprite([], bounds[0], bounds[1], false);
        this.setDimOnCurrent([bounds[0], bounds[1]]);
        const ctx = this.offscreenCanvas.getContext("2d");
        ctx.clearRect(0, 0, bounds[0], bounds[1]);
        ctx.drawImage(image, 0, 0);
        sprite.imageData = ctx.getImageData(0, 0, bounds[0], bounds[1]);
        sprite.pixels = sprite.imageData.data;
        const layer = this.layers[this.layers.length - 1];
        this.selected = this.layers.length - 1;
        sprite.width = bounds[0];
        sprite.height = bounds[1];
        sprite.copyToBuffer(layer.screenBuffer, bounds[0], bounds[1]);
    }
    addBlankLayer() {
        let finalDim = null;
        if (this.toolSelector.settingsTool) {
            finalDim = this.toolSelector.settingsTool.dim;
        }
        const dim = this.layers[0] ? [this.layers[0].dimensions.first, this.layers[0].dimensions.second] : this.dim;
        const layer = new DrawingScreen(document.createElement("canvas"), this.keyboardHandler, this.pallette, [0, 0], [128, 128], this.toolSelector, this.state, this.clipBoard);
        layer.setDim(dim);
        this.layers.push(layer);
        this.layersState.push(true);
        return layer;
    }
    width() {
        return this.dim[0];
    }
    height() {
        return this.dim[1];
    }
    saveToFile(fileName) {
        const a = document.createElement("a");
        this.toSprite();
        this.offscreenCanvas.toBlob(blob => {
            if (blob) {
                a.href = window.URL.createObjectURL(blob);
                a.download = fileName;
                a.click();
            }
        });
    }
    selectionToSprite(x, y, width, height) {
        //set offscreen canvas state, and get ctx for rescale
        const widthCanvasSpace = Math.floor((width - this.layer().offset.first) / this.layer().bounds.first * this.layer().dimensions.first);
        const heightCanvasSpace = Math.floor((height - this.layer().offset.second) / this.layer().bounds.second * this.layer().dimensions.second);
        this.offscreenCanvas.width = widthCanvasSpace;
        this.offscreenCanvas.height = heightCanvasSpace;
        const ctx = this.offscreenCanvas.getContext("2d");
        for (let i = 0; i < this.layers.length; i++) {
            if (this.layersState[i] && this.layers[i].drawWithAlpha) {
                const sprite = this.layers[i].selectionToSprite([x, y, width, height]);
                const oldAlpha = ctx.globalAlpha;
                if (oldAlpha !== this.layers[i].drawWithAlpha) {
                    ctx.globalAlpha = this.layers[i].drawWithAlpha;
                    ctx.drawImage(sprite.image, 0, 0);
                    ctx.globalAlpha = oldAlpha;
                }
                else
                    ctx.drawImage(sprite.image, 0, 0);
            }
        }
        const result = new Sprite([], widthCanvasSpace, heightCanvasSpace, false);
        result.imageData = ctx.getImageData(0, 0, widthCanvasSpace, heightCanvasSpace);
        result.pixels = result.imageData.data;
        result.refreshImage();
        return result;
    }
    toSprite() {
        //set offscreen canvas state, and get ctx for rescale
        this.offscreenCanvas.width = this.layer().dimensions.first;
        this.offscreenCanvas.height = this.height();
        const ctx = this.offscreenCanvas.getContext("2d");
        //rescale main canvas with offscreen canvas
        for (let i = 0; i < this.layers.length; i++) {
            if (this.layersState[i] && this.layers[i].drawWithAlpha) {
                const layer = this.layers[i];
                layer.drawToContextAsSprite(ctx, 0, 0, this.layer().dimensions.first, this.layer().dimensions.second);
            }
        }
        //save rescaled offscreen canvas to sprite
        const sprite = new Sprite([], this.layer().dimensions.first, this.layer().dimensions.second, false);
        sprite.imageData = ctx.getImageData(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
        sprite.pixels = sprite.imageData.data;
        sprite.refreshImage();
        return sprite;
    }
    renderMiniMap(canvas, ctx, x, y, width, height) {
        if (this.miniMapAlpha !== 0) {
            const zoomedWidth = this.width() * this.zoom.zoomX;
            const zoomedHeight = this.height() * this.zoom.zoomY;
            if (this.offscreenCanvas.width !== width || this.offscreenCanvas.height !== height) {
                this.offscreenCanvas.width = width;
                this.offscreenCanvas.height = height;
            }
            const renderingCtx = this.offscreenCanvas.getContext("2d");
            const fullCanvas = [0, 0, width, height];
            renderingCtx.clearRect(0, 0, width, height);
            renderingCtx.lineWidth = 3;
            renderingCtx.fillStyle = `rgba(125, 125, 125, ${this.miniMapAlpha})`;
            renderingCtx.globalAlpha = this.miniMapAlpha;
            renderingCtx.fillRect(0, 0, width, height);
            renderingCtx.lineWidth = 1;
            let projectionRect = [0, 0, 0, 0];
            if ((this.height() / this.width()) <= 1)
                projectionRect = [fullCanvas[0], fullCanvas[1], fullCanvas[2], (this.height() / this.width()) * fullCanvas[3]];
            else //if((this.width() / this.height()) < 1)
                projectionRect = [fullCanvas[0], fullCanvas[1], (this.width() / this.height()) * fullCanvas[2], fullCanvas[3]];
            projectionRect[0] += width / 2 - projectionRect[2] / 2;
            projectionRect[1] += height / 2 - projectionRect[3] / 2;
            const view = [(-this.zoom.zoomedX / zoomedWidth) * projectionRect[2] + projectionRect[0], (-this.zoom.zoomedY / zoomedHeight) * projectionRect[3] + projectionRect[1], canvas.width / zoomedWidth * projectionRect[2], canvas.height / zoomedHeight * projectionRect[3]];
            renderingCtx.drawImage(this.canvas, projectionRect[0], projectionRect[1], projectionRect[2], projectionRect[3]);
            renderingCtx.strokeRect(1, 1, width - 2, height - 2);
            if (this.height() / this.width() !== 1) {
                renderingCtx.fillStyle = "#808080";
                renderingCtx.strokeRect(projectionRect[0], projectionRect[1], projectionRect[2], projectionRect[3]);
                //Create border when aspect ratio is not 1:1
                renderingCtx.fillRect(0, 0, width, projectionRect[1]);
                renderingCtx.fillRect(0, projectionRect[1] + projectionRect[3], width, height - projectionRect[1] + projectionRect[3]);
                renderingCtx.fillRect(0, projectionRect[1], projectionRect[0], height);
                renderingCtx.fillRect(projectionRect[0] + projectionRect[2], 0, width - projectionRect[0] + projectionRect[2], height);
            }
            //Render rectangle previewing current viewpoint
            renderingCtx.strokeStyle = "#FFFFFF";
            renderingCtx.strokeRect(view[0], view[1], view[2], view[3]);
            renderingCtx.strokeStyle = "#000000";
            renderingCtx.strokeRect(view[0] + 1, view[1] + 1, view[2] - 2, view[3] - 2);
            //render to external canvas
            ctx.drawImage(this.offscreenCanvas, x, y);
        }
    }
    draw(canvas, ctx, x, y, width, height) {
        this.renderDim[0] = width;
        this.renderDim[1] = height;
        ctx.clearRect(0, 0, width, height);
        const zoomedWidth = this.width() * this.zoom.zoomX;
        const zoomedHeight = this.height() * this.zoom.zoomY;
        this.zoom.zoomedX = x - this.zoom.offsetX + (width - zoomedWidth) / 2;
        this.zoom.zoomedY = y - this.zoom.offsetY + (height - zoomedHeight) / 2;
        if (this.repaint()) {
            this.redraw = false;
            this.ctx.imageSmoothingEnabled = false;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.canvasTransparency, 0, 0);
            if (this.toolSelector.settingsTool.checkboxPixelGrid.checked)
                this.ctx.drawImage(this.canvasPixelGrid, 0, 0, this.canvas.width, this.canvas.height);
            for (let i = 0; i < this.layers.length; i++) {
                if (this.layersState[i]) {
                    const layer = this.layers[i];
                    layer.drawToContext(this.ctx, 0, 0, this.width(), this.height());
                }
            }
        }
        {
            ctx.fillRect(0, 0, this.zoom.zoomedX, height);
            ctx.fillRect(0, 0, width, this.zoom.zoomedY);
            ctx.fillRect(this.zoom.zoomedX + zoomedWidth, 0, width, height);
            ctx.fillRect(0, this.zoom.zoomedY + zoomedHeight, width, height);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(this.canvas, this.zoom.zoomedX, this.zoom.zoomedY, zoomedWidth, zoomedHeight);
            if (this.toolSelector.selectionTool.checkboxComplexPolygon.checked && this.toolSelector.polygon.length) {
                const cellWidth = this.zoom.zoomX * this.width() / this.width();
                const cellHeight = this.zoom.zoomY * this.height() / this.height();
                let start = this.toolSelector.polygon.length - 1;
                ctx.lineWidth = cellWidth;
                ctx.beginPath();
                ctx.strokeStyle = "#FF4040";
                for (let i = 0; i < this.toolSelector.polygon.length; i++) {
                    const lineStart = this.toolSelector.polygon[start];
                    const lineEnd = this.toolSelector.polygon[i];
                    ctx.moveTo(lineStart[0] * cellWidth + this.zoom.zoomedX, lineStart[1] * cellHeight + this.zoom.zoomedY);
                    ctx.lineTo(lineEnd[0] * cellWidth + this.zoom.zoomedX, lineEnd[1] * cellHeight + this.zoom.zoomedY);
                    start++;
                    start %= this.toolSelector.polygon.length;
                }
                const lastIndex = this.toolSelector.polygon.length - 1;
                ctx.lineWidth = 2;
                ctx.stroke();
                if (!this.toolSelector.drawingScreenListener.registeredTouch) {
                    ctx.fillStyle = "#0000FF";
                    ctx.moveTo(this.toolSelector.polygon[lastIndex][0] * cellWidth + this.zoom.zoomedX, this.toolSelector.polygon[lastIndex][1] * cellHeight + this.zoom.zoomedY);
                    ctx.ellipse(this.toolSelector.polygon[lastIndex][0] * cellWidth + this.zoom.zoomedX, this.toolSelector.polygon[lastIndex][1] * cellHeight + this.zoom.zoomedY, 5, 5, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.fillStyle = "#000000";
                ctx.strokeStyle = "#000000";
            }
            else if (this.state.selectionSelectionRect[3] !== 0 && this.state.selectionSelectionRect[4] !== 0) {
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#FF0000";
                ctx.strokeRect(this.state.selectionSelectionRect[0] * this.zoom.zoomX + this.zoom.zoomedX, this.state.selectionSelectionRect[1] * this.zoom.zoomY + this.zoom.zoomedY, this.state.selectionSelectionRect[2] * this.zoom.zoomX, this.state.selectionSelectionRect[3] * this.zoom.zoomY);
                ctx.strokeStyle = "#000000";
            }
            ctx.strokeRect(this.zoom.zoomedX, this.zoom.zoomedY, zoomedWidth, zoomedHeight);
            if (zoomedHeight > canvas.height || zoomedWidth > canvas.width) {
                this.zoom.miniMapRect[0] = canvas.width - this.zoom.miniMapRect[2];
                this.zoom.miniMapRect[1] = canvas.height - this.zoom.miniMapRect[3];
                this.renderMiniMap(canvas, ctx, this.zoom.miniMapRect[0], this.zoom.miniMapRect[1], this.zoom.miniMapRect[2], this.zoom.miniMapRect[3]);
            }
        }
    }
}
;
class KeyListenerTypes {
    constructor() {
        this.keydown = new Array();
        this.keypressed = new Array();
        this.keyup = new Array();
    }
}
;
class KeyboardHandler {
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
class TouchHandler {
    constructor(pred, callBack) {
        this.pred = pred;
        this.callBack = callBack;
    }
}
;
class ListenerTypes {
    constructor() {
        this.touchstart = new Array();
        this.touchmove = new Array();
        this.touchend = new Array();
    }
}
;
;
function isTouchSupported() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0));
}
class MouseDownTracker {
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
class SingleTouchListener {
    constructor(component, preventDefault, mouseEmulation, stopRightClick = false) {
        this.lastTouchTime = Date.now();
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
                component.addEventListener('touchstart', (event) => { this.touchStartHandler(event); }, false);
                component.addEventListener('touchmove', (event) => this.touchMoveHandler(event), false);
                component.addEventListener('touchend', (event) => this.touchEndHandler(event), false);
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
        this.registeredTouch = true;
        this.moveCount = 0;
        event.timeSinceLastTouch = Date.now() - (this.lastTouchTime ? this.lastTouchTime : 0);
        this.lastTouchTime = Date.now();
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
            this.touchVelocity = 100 * this.deltaTouchPos / (Date.now() - this.lastTouchTime);
            const a = this.normalize([deltaX, deltaY]);
            const b = [1, 0];
            const dotProduct = this.dotProduct(a, b);
            const angle = Math.acos(dotProduct) * (180 / Math.PI) * (deltaY < 0 ? 1 : -1);
            event.deltaX = deltaX;
            event.startTouchPos = this.startTouchPos;
            event.deltaY = deltaY;
            event.mag = mag;
            event.angle = angle;
            event.avgVelocity = this.touchVelocity;
            event.touchPos = this.touchPos ? [this.touchPos[0], this.touchPos[1]] : [0, 0];
            event.startTouchTime = this.lastTouchTime;
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
                const delay = Date.now() - this.lastTouchTime; // from start tap to finish
                this.touchVelocity = 100 * mag / (Date.now() - this.lastTouchTime);
                event.deltaX = deltaX;
                event.deltaY = deltaY;
                event.mag = mag;
                event.angle = angle;
                event.avgVelocity = this.touchVelocity;
                event.touchPos = this.touchPos ? [this.touchPos[0], this.touchPos[1]] : [0, 0];
                event.timeDelayFromStartToEnd = delay;
                event.startTouchTime = this.lastTouchTime;
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
class MultiTouchListenerTypes {
    constructor() {
        this.pinchIn = [];
        this.pinchOut = [];
    }
}
;
class MultiTouchListener {
    constructor(component) {
        this.lastDistance = 0;
        this.listenerTypeMap = new MultiTouchListenerTypes();
        this.registeredMultiTouchEvent = false;
        if (isTouchSupported()) {
            component.addEventListener('touchmove', event => this.touchMoveHandler(event), false);
            component.addEventListener('touchend', event => { this.registeredMultiTouchEvent = false; event.preventDefault(); }, false);
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
        const touch1 = event.changedTouches.item(0);
        const touch2 = event.changedTouches.item(1);
        if (SingleTouchListener.mouseDown.getTouchCount() > 1) {
            this.registeredMultiTouchEvent = true;
        }
        if (this.registeredMultiTouchEvent) {
            const newDist = Math.sqrt(Math.pow((touch1.clientX - touch2.clientX), 2) + Math.pow(touch1.clientY - touch2.clientY, 2));
            if (this.lastDistance > newDist) {
                this.callHandler("pinchOut", event);
            }
            else {
                this.callHandler("pinchIn", event);
            }
            event.preventDefault();
            this.lastDistance = newDist;
        }
    }
}
;
class Pallette {
    constructor(canvas, keyboardHandler, colorCount = 10, colors = null) {
        this.repaint = true;
        this.canvas = canvas;
        this.renderedSpace = [0, 0];
        this.keyboardHandler = keyboardHandler;
        this.ctx = canvas.getContext("2d");
        this.highLightedCell = 0;
        this.listeners = new SingleTouchListener(canvas, true, true, true);
        this.colors = new Array();
        const width = canvas.width / colorCount;
        const height = canvas.height;
        for (let i = 0; i < colorCount; i++) {
            const left = i / colorCount;
            const right = (i + 1) / colorCount;
            const top = 0;
            const bottom = 1;
            const depth = 0;
        }
        if (colors !== null) {
            colors.forEach(el => {
                this.colors.push(new RGB(el.red(), el.green(), el.blue(), el.alpha()));
            });
        }
        else {
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
        this.selectedPixelColor = new RGB(0, 0, 0);
        this.selectedBackColor = new RGB(0, 0, 0);
        this.selectedPixelColor.color = this.colors[0].color;
        this.selectedBackColor.color = this.colors[1].color;
        this.listeners.registerCallBack("touchstart", (e) => true, (e) => {
            document.activeElement.blur();
            this.handleClick(e);
            this.repaint = true;
        });
        this.listeners.registerCallBack("touchmove", (e) => true, (e) => {
            document.activeElement.blur();
            this.handleClick(e);
            this.repaint = true;
        });
        this.keyboardHandler.registerCallBack("keydown", (e) => true, (e) => {
            this.repaint = true;
        });
        this.keyboardHandler.registerCallBack("keyup", (e) => true, (e) => this.repaint = true);
    }
    changeSize(newSize) {
        if (newSize !== 0) {
            if (newSize > this.colors.length) {
                const diff = newSize - this.colors.length;
                for (let i = 0; i < diff; i++) {
                    this.colors.push(new RGB(0, 0, 0, 0));
                }
            }
            else {
                const deleteCount = this.colors.length - newSize;
                this.colors.splice(newSize, deleteCount);
            }
        }
    }
    calcColor(i) {
        const color = new RGB(this.colors[i].red(), this.colors[i].green(), this.colors[i].blue(), this.colors[i].alpha());
        return color;
    }
    handleClick(event) {
        const clicked = Math.floor((event.touchPos[0] / this.canvas.width) * (this.colors.length + 2));
        if (clicked > -1) {
            if (!event.button) {
                this.selectedPixelColor.color = this.colors[clicked - 2].color;
            }
            else {
                this.selectedBackColor.color = this.colors[clicked - 2].color;
            }
            this.highLightedCell = clicked - 2;
        }
    }
    setSelectedColor(color) {
        this.colors[this.highLightedCell].loadString(color);
        this.selectedPixelColor.loadString(color);
    }
    cloneColor(color) {
        const newc = new RGB(0, 0, 0, 0);
        newc.copy(color);
        return newc;
    }
    draw() {
        if (this.repaint) {
            const ctx = this.ctx;
            const width = (this.canvas.width / (this.colors.length + 2));
            const height = this.canvas.height;
            ctx.clearRect(0, 0, width * (this.colors.length + 2), height);
            let j = 2;
            for (let i = 0; i < this.colors.length; i++, j++) {
                ctx.fillStyle = this.calcColor(i).htmlRBGA();
                ctx.fillRect(j * width, 0, width, height);
                ctx.strokeRect(j * width, 0, width, height);
                if (this.highLightedCell == i)
                    for (let j = 0; j < height && j < width; j += 5)
                        if (width - j * 2 > 0) {
                            ctx.strokeRect((this.highLightedCell + 2) * width + j, j, width - j * 2, height - j * 2);
                        }
                if (i < 10) {
                    this.ctx.font = '18px Calibri';
                    const visibleColor = (this.calcColor(i));
                    this.ctx.strokeStyle = "#FFFFFF";
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeText((i + 1) % 10, j * width + width * 0.5 - 3, height / 2 + 4);
                    visibleColor.setBlue(Math.floor(visibleColor.blue() / 2));
                    visibleColor.setRed(Math.floor(visibleColor.red() / 2));
                    visibleColor.setGreen(Math.floor(visibleColor.green() / 2));
                    visibleColor.setAlpha(255);
                    this.ctx.fillStyle = visibleColor.htmlRBGA();
                    this.ctx.fillText((i + 1) % 10, j * width + width * 0.5 - 3, height / 2 + 4);
                    this.ctx.strokeStyle = "#000000";
                    this.ctx.lineWidth = 1;
                }
            }
            {
                ctx.fillStyle = this.selectedPixelColor.htmlRBGA();
                ctx.fillRect(0, 0, width, height);
                ctx.fillStyle = this.selectedBackColor.htmlRBGA();
                ctx.fillRect(width, 0, width, height);
                for (let j = 0; j < height * 1 / 5; j += 2) {
                    this.ctx.strokeStyle = "#000000";
                    ctx.strokeRect(j, j, width - j * 2, height - j * 2);
                    ctx.strokeRect(width + j, j, width - j * 2, height - j * 2);
                    this.ctx.strokeStyle = "#FF0000";
                    ctx.strokeRect(j, j, width - j * 2, height - j * 2);
                    this.ctx.strokeStyle = "#0000FF";
                    ctx.strokeRect(width + j, j, width - j * 2, height - j * 2);
                }
            }
        }
    }
}
;
function buildSpriteFromBuffer(buffer, index) {
    const size = buffer[index++];
    const type = buffer[index++];
    const height = buffer[index] >> 16;
    const width = buffer[index++] & ((1 << 17) - 1);
    const sprite = new Sprite([], width, height);
    if (type !== 3)
        throw new Error("Corrupted project file sprite type should be: 3, but is: " + type.toString());
    if (width * height !== size - 3)
        throw new Error("Corrupted project file, sprite width, and height are: (" + width.toString() + "," + height.toString() + "), but size is: " + size.toString());
    const limit = width * height;
    const view = new Uint32Array(sprite.pixels.buffer);
    for (let i = 0; i < limit; i++) {
        view[i] = buffer[index];
        index++;
    }
    sprite.refreshImage();
    return new Pair(sprite, size);
}
function buildSpriteAnimationFromBuffer(buffer, index) {
    const size = buffer[index++];
    const type = buffer[index++];
    const width = buffer[index + 2] >> 16;
    const height = buffer[index + 2] & ((1 << 16) - 1);
    if (type !== 2)
        throw new Error("Corrupted project file animation type should be: 2, but is: " + type.toString());
    let i = 2;
    const animation = new SpriteAnimation(0, 0, width, height);
    for (; i < size - 2;) {
        const result = buildSpriteFromBuffer(buffer, index);
        index += result.second;
        i += result.second;
        animation.pushSprite(result.first);
    }
    let spriteMemory = 0;
    animation.sprites.forEach((sprite) => spriteMemory += (sprite.pixels.length >> 2) + 3);
    if (spriteMemory !== size - 2)
        throw new Error("Error invalid group size: " + size.toString() + " should be: " + size.toString());
    return new Pair(animation, size);
}
function buildAnimationGroupFromBuffer(buffer, index, groupsSelector) {
    const size = buffer[index++];
    const type = buffer[index++];
    if (type !== 1)
        throw new Error("Corrupted project file animation group type should be: 1, but is: " + type.toString());
    const group = groupsSelector.createEmptyAnimationGroup();
    let i = 0;
    while (i < size - 2) {
        const result = buildSpriteAnimationFromBuffer(buffer, index);
        i += result.second;
        index += result.second;
        group.pushAnimationOnly(result.first);
    }
    return size;
}
function buildGroupsFromBuffer(buffer, groupsSelector) {
    let index = 0;
    groupsSelector.animationGroups = [];
    groupsSelector.selectedAnimationGroup = 0;
    const size = buffer[index++];
    const type = buffer[index++];
    if (type !== 0)
        throw new Error("Corrupted project file group of animation groups type should be: 0, but is: " + type.toString());
    if (size !== buffer.length)
        throw Error("Corrupted file, sie does not match header value of: " + size.toString() + " instead it is: " + buffer.length);
    let i = 0;
    while (i < size - 2) {
        const result = buildAnimationGroupFromBuffer(buffer, index, groupsSelector);
        i += result;
        index += result;
    }
    return size;
}
class Sprite {
    constructor(pixels, width, height, fillBackground = true) {
        this.fillBackground = fillBackground;
        this.imageData = null;
        this.pixels = null;
        this.image = document.createElement("canvas");
        this.ctx = this.image.getContext("2d");
        this.width = width;
        this.height = height;
        this.copy(pixels, width, height);
    }
    createImageData() {
        const canvas = this.image;
        if (canvas.width !== this.width || canvas.height !== this.height) {
            canvas.width = this.width;
            canvas.height = this.height;
        }
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        return this.ctx.createImageData(this.width, this.height);
    }
    copy(pixels, width, height) {
        this.width = width;
        this.height = height;
        if (width !== 0 && height !== 0) {
            if (!this.pixels || this.pixels.length !== pixels.length || this.pixels.length > 0) {
                this.imageData = this.createImageData();
                this.pixels = this.imageData.data;
            }
            const view = new Uint32Array(this.pixels.buffer);
            for (let i = 0; i < pixels.length; i++) {
                view[i] = pixels[i].color;
            }
            if (pixels.length)
                this.refreshImage();
        }
    }
    putPixels(ctx) {
        ctx.putImageData(this.imageData, 0, 0);
    }
    fillRect(color, x, y, width, height, view = new Uint32Array(this.pixels.buffer)) {
        for (let yi = y; yi < y + height; yi++) {
            const yiIndex = (yi * this.width);
            const rowLimit = x + width + yiIndex;
            for (let xi = x + yiIndex; xi < rowLimit; xi++) {
                view[xi] = color.color;
            }
        }
    }
    fillRectAlphaBlend(source, color, x, y, width, height, view = new Uint32Array(this.pixels.buffer)) {
        for (let yi = y; yi < y + height; yi++) {
            for (let xi = x; xi < x + width; xi++) {
                let index = (xi) + (yi * this.width);
                source.color = view[index];
                source.blendAlphaCopy(color);
                view[index] = source.color;
            }
        }
    }
    copyToBuffer(buf, width, height, view = new Uint32Array(this.pixels.buffer)) {
        if (width * height !== buf.length) {
            console.log("error invalid dimensions supplied");
            return;
        }
        for (let y = 0; y < this.height && y < height; y++) {
            for (let x = 0; x < this.width && x < width; x++) {
                const i = (x + y * width);
                const vi = x + y * this.width;
                buf[i].color = view[vi];
            }
        }
    }
    binaryFileSize() {
        return 3 + this.width * this.height;
    }
    saveToUint32Buffer(buf, index, view = new Uint32Array(this.pixels.buffer)) {
        buf[index++] = this.binaryFileSize();
        buf[index++] = 3;
        buf[index] |= this.height << 16;
        buf[index++] |= this.width;
        for (let i = 0; i < view.length; i++) {
            buf[index] = view[i];
            index++;
        }
        return index;
    }
    refreshImage() {
        const canvas = this.image;
        if (canvas.width !== this.width || canvas.height !== this.height) {
            canvas.width = this.width;
            canvas.height = this.height;
            this.ctx = canvas.getContext("2d");
        }
        this.putPixels(this.ctx);
    }
    copySprite(sprite) {
        this.width = sprite.width;
        this.height = sprite.height;
        if (!this.pixels || this.pixels.length !== sprite.pixels.length) {
            this.imageData = this.createImageData();
            this.pixels = this.imageData.data;
        }
        for (let i = 0; i < this.pixels.length;) {
            this.pixels[i] = sprite.pixels[i++];
            this.pixels[i] = sprite.pixels[i++];
            this.pixels[i] = sprite.pixels[i++];
            this.pixels[i] = sprite.pixels[i++];
        }
    }
    copySpriteBlendAlpha(sprite) {
        if (this.pixels.length !== sprite.pixels.length) {
            this.imageData = this.createImageData();
            this.pixels = this.imageData.data;
        }
        this.width = sprite.width;
        this.height = sprite.height;
        const o = new RGB(0, 0, 0, 0);
        const t = new RGB(0, 0, 0, 0);
        for (let i = 0; i < this.pixels.length; i += 4) {
            o.setRed(sprite.pixels[i]);
            o.setGreen(sprite.pixels[i + 1]);
            o.setBlue(sprite.pixels[i + 2]);
            o.setAlpha(sprite.pixels[i + 3]);
            t.setRed(this.pixels[i]);
            t.setGreen(this.pixels[i + 1]);
            t.setBlue(this.pixels[i + 2]);
            t.setAlpha(this.pixels[i + 3]);
            t.blendAlphaCopy(o);
            this.pixels[i] = t.red();
            this.pixels[i + 1] = t.green();
            this.pixels[i + 2] = t.blue();
            this.pixels[i + 3] = t.alpha();
        }
    }
    draw(ctx, x, y, width, height) {
        if (this.pixels) {
            if (this.fillBackground) {
                ctx.clearRect(x, y, width, height);
            }
            ctx.drawImage(this.image, x, y, width, height);
        }
    }
}
;
class SpriteAnimation {
    constructor(x, y, width, height) {
        this.sprites = [];
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.animationIndex = 0;
    }
    pushSprite(sprite) {
        this.sprites.push(sprite);
    }
    binaryFileSize() {
        let size = 2;
        this.sprites.forEach((sprite) => size += sprite.binaryFileSize());
        return size;
    }
    toGifBlob(callBack, fps = 30) {
        const frameTime = 1000 / fps;
        const gif = new GIF({
            workers: 2,
            quality: 10
        });
        // add an image element
        for (let i = 0; i < this.sprites.length; i++)
            gif.addFrame(this.sprites[i].image, { delay: Math.ceil(frameTime) });
        gif.on('finished', function (blob) {
            callBack(blob);
        });
        gif.render();
    }
    saveToUint32Buffer(buf, index) {
        buf[index++] = this.binaryFileSize();
        buf[index++] = 2;
        this.sprites.forEach((sprite) => index = sprite.saveToUint32Buffer(buf, index));
        return index;
    }
    cloneAnimation() {
        const cloned = new SpriteAnimation(0, 0, this.width, this.height);
        const original = this;
        original.sprites.forEach((sprite) => {
            const clonedSprite = new Sprite([], sprite.width, sprite.height);
            clonedSprite.copySprite(sprite);
            clonedSprite.refreshImage();
            cloned.sprites.push(clonedSprite);
        });
        return cloned;
    }
    draw(ctx, x, y, width, height) {
        if (this.sprites.length) {
            ++this.animationIndex;
            this.sprites[this.animationIndex %= this.sprites.length].draw(ctx, x, y, width, height);
        }
        else {
            this.animationIndex = -1;
        }
    }
}
;
class SpriteSelector {
    constructor(canvas, listener, drawingField, animationGroup, keyboardHandler, spritesPerRow, width, height) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.ctx.strokeStyle = "#000000";
        this.ctx.lineWidth = 2;
        this.dragSprite = null;
        this.keyboardHandler = keyboardHandler;
        this.dragSpriteLocation = [-1, -1];
        this.drawingField = drawingField;
        this.animationGroup = animationGroup;
        this.spritesPerRow = spritesPerRow;
        this.spriteWidth = canvas.width / spritesPerRow;
        this.spriteHeight = this.spriteWidth;
        this.selectedSprite = 0;
        canvas.height = this.spriteWidth;
        this.listener = listener;
        this.spritesCount = this.sprites() ? this.sprites().length : 0;
    }
    handleTouchEvents(type, e) {
        const clickedSprite = Math.floor(e.touchPos[0] / this.canvas.width * this.spritesPerRow) + this.spritesPerRow * Math.floor(e.touchPos[1] / this.spriteHeight);
        switch (type) {
            case ("touchstart"):
                document.activeElement.blur();
                break;
            case ("touchmove"):
                if (e.moveCount === 3 && this.sprites() && this.sprites()[clickedSprite] && this.sprites().length > 1) {
                    if (this.keyboardHandler.keysHeld["AltLeft"] || this.keyboardHandler.keysHeld["AltRight"]) {
                        const dragSprite = new Sprite([], 1, 1);
                        dragSprite.copySprite(this.sprites()[clickedSprite]);
                        dragSprite.refreshImage();
                        this.dragSprite = dragSprite;
                    }
                    else
                        this.dragSprite = this.sprites().splice(clickedSprite, 1)[0];
                    this.dragSpriteLocation[0] = e.touchPos[0];
                    this.dragSpriteLocation[1] = e.touchPos[1];
                }
                else if (e.moveCount > 3) {
                    this.dragSpriteLocation[0] += e.deltaX;
                    this.dragSpriteLocation[1] += e.deltaY;
                }
                break;
            case ("touchend"):
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                if (this.sprites() && clickedSprite >= 0 && this.dragSprite !== null) {
                    this.sprites().splice(clickedSprite, 0, this.dragSprite);
                    this.spritesCount = this.sprites().length;
                    this.dragSprite = null;
                }
                if (this.sprites() && this.sprites()[clickedSprite]) {
                    this.selectedSprite = clickedSprite;
                    const sprite = this.sprites()[clickedSprite];
                    if (sprite.width !== this.drawingField.layer().spriteScreenBuf.width || sprite.height !== this.drawingField.layer().spriteScreenBuf.height) {
                        this.drawingField.setDimOnCurrent([sprite.width, sprite.height]);
                    }
                    this.drawingField.layer().loadSprite(sprite);
                }
                else if (this.sprites() && this.sprites().length > 1)
                    this.selectedSprite = this.sprites().length - 1;
                else
                    this.selectedSprite = 0;
                break;
        }
    }
    update() {
        if (this.sprites()) {
            if ((1 + Math.floor(this.sprites().length / this.spritesPerRow) * this.spriteHeight) > this.canvas.height) {
                this.canvas.height = (1 + Math.floor(this.sprites().length / this.spritesPerRow)) * this.spriteHeight;
            }
            if (this.spritesCount !== this.sprites().length) {
                this.spritesCount = this.sprites() ? this.sprites().length : 0;
                this.selectedSprite = this.spritesCount - 1;
            }
        }
    }
    draw() {
        if (this.sprites()) {
            const position = this.canvas.getBoundingClientRect();
            if (position.top < window.innerHeight && position.bottom >= 0) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                const touchX = Math.floor(this.listener.touchPos[0] / this.canvas.width * this.spritesPerRow);
                const touchY = Math.floor(this.listener.touchPos[1] / this.canvas.height * Math.floor(this.canvas.height / this.spriteHeight));
                let setOffForDragSprite = 0;
                for (let i = 0; i < this.sprites().length; i++) {
                    if (this.dragSprite && i === touchX + touchY * this.spritesPerRow)
                        setOffForDragSprite++;
                    const x = (setOffForDragSprite % this.spritesPerRow) * this.spriteWidth;
                    const y = Math.floor(setOffForDragSprite / this.spritesPerRow) * this.spriteHeight;
                    this.sprites()[i].draw(this.ctx, x, y, this.spriteHeight, this.spriteWidth);
                    setOffForDragSprite++;
                }
                if (this.dragSprite) {
                    this.dragSprite.draw(this.ctx, this.dragSpriteLocation[0] - this.spriteWidth * 0.5, this.dragSpriteLocation[1] - this.spriteHeight * 0.5, this.spriteWidth, this.spriteHeight);
                    this.ctx.strokeRect(this.dragSpriteLocation[0] - this.spriteWidth * 0.5 + 2, this.dragSpriteLocation[1] - this.spriteHeight * 0.5 + 2, this.spriteWidth - 4, this.spriteHeight - 4);
                }
                else
                    this.ctx.strokeRect(this.selectedSprite % this.spritesPerRow * this.spriteWidth + 2, Math.floor(this.selectedSprite / this.spritesPerRow) * this.spriteHeight + 2, this.spriteWidth - 4, this.spriteHeight - 4);
            }
        }
    }
    deleteSelectedSprite() {
        if (this.sprites() && this.sprites().length > 1)
            this.sprites().splice(this.selectedSprite--, 1);
    }
    pushSelectedToCanvas() {
        const spriteWidth = this.drawingField.width();
        const spriteHeight = this.drawingField.layer().dimensions.second;
        if (this.selectedSpriteVal()) {
            this.selectedSpriteVal().copySprite(this.drawingField.toSprite());
            this.selectedSpriteVal().refreshImage();
        }
    }
    selectedSpriteVal() {
        if (this.sprites())
            return this.sprites()[this.selectedSprite];
        return null;
    }
    sprites() {
        if (this.animationGroup.animations[this.animationGroup.selectedAnimation] && this.animationGroup.animations[this.animationGroup.selectedAnimation].sprites)
            return this.animationGroup.animations[this.animationGroup.selectedAnimation].sprites;
        else if (this.animationGroup.animations.length && this.animationGroup.animations[0]) {
            this.animationGroup.selectedAnimation = 0;
            return this.animationGroup.animations[0].sprites;
        }
        this.animationGroup.selectedAnimation = -1;
        return null;
    }
}
;
class AnimationGroup {
    constructor(listener, spriteSelectorListener, drawingField, keyboardHandler, animiationsID, animationsSpritesID, spritesPerRow = 10, spriteWidth = 64, spriteHeight = 64, animationWidth = 128, animationHeight = 128, animationsPerRow = 5) {
        this.drawingField = drawingField;
        this.keyboardHandler = keyboardHandler;
        this.spriteSelectorListener = spriteSelectorListener;
        this.animationDiv = document.getElementById(animiationsID);
        this.animations = new Array();
        this.animationCanvas = document.getElementById(animiationsID);
        this.selectedAnimation = 0;
        this.animationsPerRow = animationsPerRow;
        this.animationWidth = animationWidth;
        this.animationHeight = animationHeight;
        this.listener = listener;
        this.dragSpritePos = [0, 0];
        this.spriteSelector = new SpriteSelector(document.getElementById(animationsSpritesID), spriteSelectorListener, this.drawingField, this, keyboardHandler, spritesPerRow, spriteWidth, spriteHeight);
        this.dragSprite = null;
        this.autoResizeCanvas();
    }
    handleTouchEvents(type, e) {
        switch (type) {
            case ("touchstart"):
                document.activeElement.blur();
                break;
            case ("touchmove"):
                if (e.moveCount === 1 && this.animations.length > 1) {
                    const clickedSprite = Math.floor(e.touchPos[0] / this.spriteSelector.spriteWidth) + Math.floor(e.touchPos[1] / this.spriteSelector.spriteHeight) * this.animationsPerRow;
                    this.dragSprite = this.animations.splice(clickedSprite, 1)[0];
                    this.dragSpritePos[0] = e.touchPos[0] - this.animationWidth / 2;
                    this.dragSpritePos[1] = e.touchPos[1] - this.animationWidth / 2;
                }
                else if (e.moveCount > 1) {
                    this.dragSpritePos[0] += e.deltaX;
                    this.dragSpritePos[1] += e.deltaY;
                }
                break;
            case ("touchend"):
                let clickedSprite = Math.floor(e.touchPos[0] / this.animationWidth) + Math.floor(e.touchPos[1] / this.animationHeight) * this.animationsPerRow;
                if (clickedSprite >= 0) {
                    if (this.dragSprite !== null) {
                        if (clickedSprite >= this.animations.length)
                            clickedSprite = this.animations.length ? this.animations.length - 1 : 0;
                        this.animations.splice(clickedSprite, 0, this.dragSprite);
                    }
                    this.dragSprite = null;
                    this.dragSpritePos[0] = -1;
                    this.dragSpritePos[1] = -1;
                }
                if (clickedSprite < this.animations.length && this.spriteSelector.sprites()) {
                    this.selectedAnimation = clickedSprite;
                    if (this.spriteSelector.sprites().length) {
                        const sprite = this.spriteSelector.sprites()[0];
                        if (sprite.width !== this.drawingField.layer().spriteScreenBuf.width || sprite.height !== this.drawingField.layer().spriteScreenBuf.height) {
                            this.drawingField.setDimOnCurrent([sprite.width, sprite.height]);
                        }
                        sprite.copyToBuffer(this.drawingField.layer().screenBuffer, this.drawingField.layer().dimensions.first, this.drawingField.layer().dimensions.second);
                    }
                }
        }
    }
    pushAnimationOnly(animation) {
        this.animations.push(animation);
        //resize canvas if necessary
        this.autoResizeCanvas();
    }
    pushAnimation(animation) {
        this.animations.push(animation);
        //if this animation has no sprites in it 
        //then push the current buffer in the drawing screen as new sprite to animation
        if (animation.sprites.length === 0)
            this.pushDrawingScreenToAnimation(animation);
        //resize canvas if necessary
        this.autoResizeCanvas();
    }
    deleteAnimation(index) {
        if (index >= 0 && index < this.animations.length) {
            this.animations.splice(index, 1);
            if (this.selectedAnimation >= this.animations.length)
                this.selectedAnimation--;
            //resize canvas if necessary
            this.autoResizeCanvas();
            return true;
        }
        return false;
    }
    cloneAnimation(index) {
        if (index >= 0 && index < this.animations.length) {
            const original = this.animations[index];
            const cloned = original.cloneAnimation();
            //resize canvas if necessary
            this.autoResizeCanvas();
            return cloned;
        }
        return null;
    }
    pushDrawingScreenToAnimation(animation) {
        const sprites = animation.sprites;
        this.spriteSelector.spritesCount = sprites.length;
        this.spriteSelector.selectedSprite = sprites.length - 1;
        const sprite = new Sprite([], 0, 0);
        sprite.copySprite(this.drawingField.toSprite());
        sprite.refreshImage();
        sprites.push(sprite);
    }
    pushSprite() {
        if (this.selectedAnimation >= this.animations.length) {
            this.pushAnimation(new SpriteAnimation(0, 0, this.spriteSelector.spriteWidth, this.spriteSelector.spriteHeight));
        }
        else {
            const sprites = this.animations[this.selectedAnimation].sprites;
            this.spriteSelector.selectedSprite = sprites.length - 1;
            const sprite = new Sprite([], 0, 0);
            sprite.copySprite(this.drawingField.toSprite());
            sprite.refreshImage();
            sprites.push(sprite);
        }
    }
    maxAnimationsOnCanvas() {
        return Math.floor(this.animationCanvas.height / this.animationHeight) * this.animationsPerRow;
    }
    neededRowsInCanvas() {
        return Math.floor(this.animations.length / this.animationsPerRow) + 1;
    }
    autoResizeCanvas() {
        this.animationCanvas.width = this.animationWidth * this.animationsPerRow;
        if (this.maxAnimationsOnCanvas() < this.animations.length) {
            this.animationCanvas.height += this.animationHeight;
        }
        else if (this.maxAnimationsOnCanvas() / this.animationsPerRow > this.neededRowsInCanvas()) {
            this.animationCanvas.height = this.neededRowsInCanvas() * this.animationHeight;
        }
    }
    binaryFileSize() {
        let size = 2;
        this.animations.forEach(animation => size += animation.binaryFileSize());
        return size;
    }
    buildFromBinary(binary) {
        let i = 1;
        const groupSize = binary[i];
        const color = new RGB(0, 0, 0, 0);
        const groups = [];
        let j = 0;
        //while(j < binary.length)
        {
            if (j != 0)
                throw new Error("Corrupted File, animation group project header corrupted");
            const animationSize = binary[i + 1];
            groups.push(new AnimationGroup(this.listener, this.spriteSelectorListener, this.drawingField, this.keyboardHandler, "animations", "sprites_canvas", this.spriteSelector.spritesPerRow, this.spriteSelector.spriteWidth, this.spriteSelector.spriteHeight));
            if (binary[i + 2] != 1)
                throw new Error("Corrupted File, animation header corrupted value is:" + binary[(i + 2)] + " should be 1");
            for (; j < groupSize; j += animationSize) {
                const animationSize = binary[i + j + 2];
                groups[groups.length - 1].animations.push(new SpriteAnimation(0, 0, this.spriteSelector.spriteWidth, this.spriteSelector.spriteHeight));
                const animations = groups[groups.length - 1].animations;
                const sprites = animations[animations.length - 1].sprites;
                let k = 0;
                const spriteSize = binary[i + j + 5];
                if (binary[i + j + 6] != 2)
                    throw new Error("Corrupted sprite header file value is: " + binary[i + j + 6] + ", and should be 2");
                for (; k < animationSize; k += spriteSize) {
                    const spriteSize = binary[i + j + k + 5];
                    const type = binary[i + j + k + 6];
                    const spriteWidth = binary[i + j + k + 7] & ((1 << 16) - 1);
                    const spriteHeight = binary[i + j + k + 7] >> 16;
                    let binaryPixelIndex = i + j + k + 8;
                    let l = 0;
                    const sprite = new Sprite([], spriteWidth, spriteHeight);
                    sprites.push(sprite);
                    for (; l < spriteSize; l++, binaryPixelIndex++) {
                        color.color = binary[binaryPixelIndex];
                        const pixelIndex = (l << 2);
                        sprite.pixels[pixelIndex] = color.red();
                        sprite.pixels[pixelIndex + 1] = color.blue();
                        sprite.pixels[pixelIndex + 2] = color.green();
                        sprite.pixels[pixelIndex + 3] = color.alpha();
                    }
                }
            }
            i += groupSize;
        }
        return groups;
    }
    toBinary(buffer, index) {
        const size = this.binaryFileSize();
        buffer[index++] = size;
        buffer[index++] = 1;
        this.animations.forEach(animation => index = animation.saveToUint32Buffer(buffer, index));
        return index;
    }
    selectedAnimationX() {
        return (this.selectedAnimation % this.animationsPerRow) * this.animationWidth;
    }
    selectedAnimationY() {
        return Math.floor(this.selectedAnimation / this.animationsPerRow) * this.animationHeight;
    }
    chosenAnimation() {
        return this.animations[this.selectedAnimation];
    }
    drawAnimation(ctx, animationIndex, spriteIndex, x, y, width, height) {
        if (this.animations[animationIndex] && spriteIndex < this.animations[animationIndex].sprites.length) {
            this.animations[animationIndex].sprites[spriteIndex].draw(ctx, x, y, width, height);
        }
    }
    draw() {
        const position = this.animationCanvas.getBoundingClientRect();
        if (this.animations.length) {
            this.spriteSelector.update();
            this.spriteSelector.draw();
        }
        let ctx1;
        if ((ctx1 = this.animationCanvas.getContext("2d")) && position.top < window.innerHeight && position.bottom >= 0) {
            const ctx = ctx1;
            ctx.clearRect(0, 0, this.animationCanvas.width, this.animationCanvas.height);
            let dragSpriteAdjustment = 0;
            const touchX = Math.floor(this.listener.touchPos[0] / this.animationCanvas.width * this.animationsPerRow);
            const touchY = Math.floor((this.listener.touchPos[1]) / this.animationCanvas.height * Math.floor(this.animationCanvas.height / this.animationHeight));
            let x = (dragSpriteAdjustment) % this.animationsPerRow;
            let y = Math.floor((dragSpriteAdjustment) / this.animationsPerRow);
            for (let i = 0; i < this.animations.length; i++) {
                x = (dragSpriteAdjustment) % this.animationsPerRow;
                y = Math.floor((dragSpriteAdjustment) / this.animationsPerRow);
                if (this.dragSprite && x === touchX && y === touchY) {
                    dragSpriteAdjustment++;
                    x = (dragSpriteAdjustment) % this.animationsPerRow;
                    y = Math.floor((dragSpriteAdjustment) / this.animationsPerRow);
                }
                if (this.animations[i])
                    this.animations[i].draw(ctx, x * this.animationWidth, y * this.animationHeight, this.animationWidth, this.animationHeight);
                dragSpriteAdjustment++;
            }
            if (this.animations.length) {
                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 3;
                ctx.strokeRect(1 + this.selectedAnimationX(), 1 + this.selectedAnimationY(), this.animationWidth - 2, this.animationHeight - 2);
            }
            if (this.dragSprite)
                this.dragSprite.draw(ctx, this.dragSpritePos[0], this.dragSpritePos[1], this.animationWidth, this.animationHeight);
        }
    }
}
;
class AnimationGroupsSelector {
    constructor(field, keyboardHandler, animationGroupSelectorId, animationsCanvasId, spritesCanvasId, spriteWidth, spriteHeight, renderWidth, renderHeight, spritesPerRow = 5) {
        this.animationGroups = [];
        this.selectedAnimationGroup = 0;
        this.field = field;
        this.dragAnimationGroup = null;
        this.dragAnimationGroupPos = [0, 0];
        this.spritesPerRow = spritesPerRow;
        this.renderWidth = renderWidth;
        this.renderHeight = renderHeight;
        this.canvas = document.getElementById(animationGroupSelectorId);
        this.canvas.height = renderHeight;
        this.canvas.width = renderWidth * spritesPerRow;
        this.ctx = this.canvas.getContext("2d");
        this.animationsCanvasId = animationsCanvasId;
        this.spritesCanvasId = spritesCanvasId;
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.keyboardHandler = keyboardHandler;
        this.listener = new SingleTouchListener(this.canvas, true, true);
        this.listener.registerCallBack("touchstart", (e) => true, (e) => {
            document.activeElement.blur();
        });
        this.listener.registerCallBack("touchmove", (e) => true, (e) => {
            const clickedIndex = Math.floor(e.touchPos[0] / this.renderWidth) + Math.floor(e.touchPos[1] / this.renderHeight);
            if (e.moveCount === 1 && this.animationGroups.length > 1) {
                this.dragAnimationGroup = this.animationGroups.splice(clickedIndex, 1)[0];
                if (this.selectedAnimationGroup > 0 && this.selectedAnimationGroup >= this.animationGroups.length) {
                    this.selectedAnimationGroup--;
                }
            }
            else if (e.moveCount > 1) {
                this.dragAnimationGroupPos[0] += e.deltaX;
                this.dragAnimationGroupPos[1] += e.deltaY;
            }
        });
        this.listener.registerCallBack("touchend", (e) => true, (e) => {
            const clickedIndex = Math.floor(e.touchPos[0] / this.renderWidth) + Math.floor(e.touchPos[1] / this.renderHeight);
            if (clickedIndex >= 0 && clickedIndex <= this.animationGroups.length) {
                if (this.dragAnimationGroup) {
                    this.animationGroups.splice(clickedIndex, 0, this.dragAnimationGroup);
                    this.dragAnimationGroup = null;
                    this.dragAnimationGroupPos[0] = -1;
                    this.dragAnimationGroupPos[1] = -1;
                }
                if (clickedIndex < this.animationGroups.length)
                    this.selectedAnimationGroup = clickedIndex;
            }
        });
        this.listenerAnimationsSelector = new SingleTouchListener(document.getElementById(animationsCanvasId), false, true);
        this.listenerAnimationsSelector.registerCallBack("touchstart", (e) => true, (e) => {
            const group = this.animationGroup();
            if (group) {
                group.handleTouchEvents("touchstart", e);
            }
        });
        this.listenerAnimationsSelector.registerCallBack("touchmove", (e) => true, (e) => {
            const group = this.animationGroup();
            if (group) {
                group.handleTouchEvents("touchmove", e);
            }
        });
        this.listenerAnimationsSelector.registerCallBack("touchend", (e) => true, (e) => {
            const group = this.animationGroup();
            if (group) {
                group.handleTouchEvents("touchend", e);
            }
        });
        this.listenerSpritesSelector = new SingleTouchListener(document.getElementById(spritesCanvasId), false, true);
        this.listenerSpritesSelector.registerCallBack("touchstart", (e) => true, (e) => {
            const group = this.animationGroup();
            if (group && group.spriteSelector) {
                group.spriteSelector.handleTouchEvents("touchstart", e);
            }
        });
        this.listenerSpritesSelector.registerCallBack("touchmove", (e) => true, (e) => {
            const group = this.animationGroup();
            if (group && group.spriteSelector) {
                group.spriteSelector.handleTouchEvents("touchmove", e);
            }
        });
        this.listenerSpritesSelector.registerCallBack("touchend", (e) => true, (e) => {
            const group = this.animationGroup();
            if (group && group.spriteSelector) {
                group.spriteSelector.handleTouchEvents("touchend", e);
            }
        });
    }
    maxAnimationsOnCanvas() {
        return Math.floor(this.canvas.height / this.renderHeight) * this.spritesPerRow;
    }
    neededRowsInCanvas() {
        return Math.floor(this.animationGroups.length / this.spritesPerRow) + 1;
    }
    binaryFileSize() {
        let size = 2;
        this.animationGroups.forEach(el => size += el.first.binaryFileSize());
        return size;
    }
    buildFromBinary(binary) {
        /*const groups:AnimationGroup[] = this.animationGroup().buildFromBinary(binary);
        this.animationGroups = [];
        this.selectedAnimationGroup = 0;
        groups.forEach(el => {
            this.animationGroups.push(new Pair(el, new Pair(0,0)));
        })*/
        buildGroupsFromBuffer(binary, this);
    }
    toBinary() {
        const size = this.binaryFileSize();
        const data = new Uint32Array(size);
        let index = 0;
        data[index++] = size;
        data[index++] = 0;
        this.animationGroups.forEach(group => {
            index = group.first.toBinary(data, index);
        });
        return data;
    }
    saveAs(name) {
        saveBlob(new Blob([this.toBinary()], { type: "application/octet-stream" }), name);
    }
    autoResizeCanvas() {
        if (this.animationGroup()) {
            this.canvas.width = this.renderWidth * this.spritesPerRow;
            if (this.maxAnimationsOnCanvas() / this.spritesPerRow > this.neededRowsInCanvas() || this.maxAnimationsOnCanvas() / this.spritesPerRow < this.neededRowsInCanvas()) {
                this.canvas.height = this.neededRowsInCanvas() * this.renderHeight;
            }
        }
    }
    createEmptyAnimationGroup() {
        this.animationGroups.push(new Pair(new AnimationGroup(this.listenerAnimationsSelector, this.listenerSpritesSelector, this.field, this.keyboardHandler, this.animationsCanvasId, this.spritesCanvasId, 5, this.spriteWidth, this.spriteHeight), new Pair(0, 0)));
        this.autoResizeCanvas();
        return this.animationGroups[this.animationGroups.length - 1].first;
    }
    createAnimationGroup() {
        this.animationGroups.push(new Pair(new AnimationGroup(this.listenerAnimationsSelector, this.listenerSpritesSelector, this.field, this.keyboardHandler, this.animationsCanvasId, this.spritesCanvasId, 5, this.spriteWidth, this.spriteHeight), new Pair(0, 0)));
        this.animationGroups[this.animationGroups.length - 1].first.pushAnimation(new SpriteAnimation(0, 0, dim[0], dim[1]));
        this.autoResizeCanvas();
        return this.animationGroups[this.animationGroups.length - 1].first;
    }
    animationGroup() {
        if (this.selectedAnimationGroup >= 0 && this.selectedAnimationGroup < this.animationGroups.length) {
            return this.animationGroups[this.selectedAnimationGroup].first;
        }
        return null;
    }
    pushAnimationToSelected(animation) {
        const group = this.animationGroup();
        if (group)
            group.pushAnimation(animation);
    }
    inSelectedAnimationBounds(animationIndex) {
        const group = this.animationGroup();
        if (group)
            return (animationIndex >= 0 && animationIndex < group.animations.length);
        return false;
    }
    cloneAnimationFromSelected(animationIndex) {
        const group = this.animationGroup();
        if (group)
            group.cloneAnimation(animationIndex);
    }
    cloneSelectedAnimationGroup() {
        this.animationGroups.push(new Pair(new AnimationGroup(this.listenerAnimationsSelector, this.listenerSpritesSelector, this.field, this.keyboardHandler, this.animationsCanvasId, this.spritesCanvasId, 5, this.spriteWidth, this.spriteHeight), new Pair(0, 0)));
        const animationGroup = this.animationGroups[this.animationGroups.length - 1].first;
        const group = this.animationGroup();
        if (group)
            group.animations.forEach(animation => {
                animationGroup.pushAnimation(animation.cloneAnimation());
            });
        this.autoResizeCanvas();
    }
    deleteAnimationFromSelected(animationIndex) {
        const group = this.animationGroup();
        if (group)
            group.deleteAnimation(animationIndex);
    }
    pushSpriteToSelected() {
        const group = this.animationGroup();
        if (group)
            group.pushSprite();
    }
    pushSelectedSpriteToCanvas() {
        const group = this.animationGroup();
        if (group)
            group.spriteSelector.pushSelectedToCanvas();
    }
    deleteSelectedSprite() {
        const group = this.animationGroup();
        if (group)
            group.spriteSelector.deleteSelectedSprite();
    }
    deleteSelectedAnimationGroup() {
        this.animationGroups.splice(this.selectedAnimationGroup, 1);
        if (this.selectedAnimationGroup >= this.animationGroups.length) {
            this.selectedAnimationGroup--;
        }
        this.autoResizeCanvas();
    }
    selectedAnimation() {
        const group = this.animationGroup();
        if (group)
            return group.animations[group.selectedAnimation];
        return null;
    }
    drawIndex(ctx, animationGroupIndex, encodedLocation) {
        const group = this.animationGroups[animationGroupIndex].first;
        let animationIndex = this.animationGroups[animationGroupIndex].second.first;
        if (group) {
            let spriteIndex = this.animationGroups[animationGroupIndex].second.second;
            spriteIndex++;
            if (group.animations[animationIndex] && group.animations[animationIndex].sprites.length <= spriteIndex) {
                animationIndex++;
                spriteIndex = 0;
                if (animationIndex >= group.animations.length) {
                    animationIndex = 0;
                }
            }
            else if (!group.animations[animationIndex]) {
                spriteIndex = 0;
                animationIndex = 0;
            }
            this.animationGroups[animationGroupIndex].second.first = animationIndex;
            this.animationGroups[animationGroupIndex].second.second = spriteIndex;
            const x = encodedLocation % this.spritesPerRow;
            const y = Math.floor(encodedLocation / this.spritesPerRow);
            group.drawAnimation(ctx, animationIndex, spriteIndex, x * this.renderWidth, y * this.renderHeight, this.renderWidth, this.renderHeight);
        }
    }
    draw() {
        let group;
        if (group = this.animationGroup()) {
            group.draw();
        }
        const position = this.canvas.getBoundingClientRect();
        if (position.top < window.innerHeight && position.bottom >= 0) {
            const ctx = this.ctx;
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            const clickedIndex = Math.floor(this.listener.touchPos[0] / this.renderWidth) + Math.floor(this.listener.touchPos[1] / this.renderHeight);
            let offSetI = 0;
            for (let i = 0; i < this.animationGroups.length; i++, offSetI++) {
                if (i === clickedIndex && this.dragAnimationGroup)
                    offSetI++;
                if (this.animationGroup())
                    this.drawIndex(ctx, i, offSetI);
            }
            if (this.dragAnimationGroup) {
                let spriteIndex = this.dragAnimationGroup.second.second++;
                let animationIndex = this.dragAnimationGroup.second.first;
                const group = this.dragAnimationGroup.first;
                if (group.animations[animationIndex].sprites.length === spriteIndex) {
                    animationIndex++;
                    spriteIndex = 0;
                }
                if (group.animations.length === animationIndex)
                    animationIndex = 0;
                this.dragAnimationGroup.second.first = animationIndex;
                this.dragAnimationGroup.second.second = spriteIndex;
                this.dragAnimationGroup.first.drawAnimation(ctx, animationIndex, spriteIndex, this.listener.touchPos[0] - this.renderWidth / 2, this.listener.touchPos[1] - this.renderHeight / 2, this.renderWidth, this.renderHeight);
            }
            if (this.animationGroup()) {
                const x = this.selectedAnimationGroup % this.spritesPerRow;
                const y = Math.floor(this.selectedAnimationGroup / this.spritesPerRow);
                ctx.strokeStyle = "#000000";
                ctx.strokeRect(x * this.renderWidth + 1, y * this.renderHeight + 1, this.renderWidth - 2, this.renderHeight - 2);
            }
        }
    }
}
;
async function fetchImage(url) {
    const img = new Image();
    img.src = URL.createObjectURL(await (await fetch(url)).blob());
    return img;
}
function logToServer(data) {
    fetch("/data", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }).then(res => { console.log("Request complete! response:", data); });
}
function saveBlob(blob, fileName) {
    const a = document.createElement("a");
    if (blob) {
        a.href = window.URL.createObjectURL(blob);
        a.download = fileName;
        a.click();
    }
}
function getWidth() {
    return Math.max(document.body.scrollWidth, document.documentElement.scrollWidth, document.body.offsetWidth, document.documentElement.offsetWidth, document.documentElement.clientWidth);
}
async function main() {
    const canvas = document.getElementById("screen");
    let maybectx = canvas.getContext("2d");
    if (!maybectx)
        return;
    const ctx = maybectx;
    let field;
    const multiTouchHandler = new MultiTouchListener(canvas);
    multiTouchHandler.registerCallBack("pinchIn", (e) => true, (e) => {
        {
            let delta = 0;
            if (field.zoom.zoomX < 1.05) {
                delta = 0.01;
            }
            else if (field.zoom.zoomX < 3) {
                delta = 0.05;
            }
            else if (field.zoom.zoomX < 8)
                delta = 0.1;
            else if (field.zoom.zoomX < 25)
                delta = 0.2;
            else if (field.zoom.zoomX < 50)
                delta = 0.4;
            else if (field.zoom.zoomX >= 25 && e.deltaY < 0)
                delta = 0;
            field.zoom.zoomY += delta * (field.zoom.zoomY / field.zoom.zoomX);
            field.zoom.zoomX += delta;
            const text = (Math.round(field.zoom.zoomX * 100) / 100).toString();
            toolSelector.transformTool.textBoxZoom.setText(text);
            const touchPos = [field.zoom.invZoomX(toolSelector.drawingScreenListener.touchPos[0]),
                field.zoom.invZoomY(toolSelector.drawingScreenListener.touchPos[1])];
            const centerX = (field.width() / 2);
            const centerY = (field.height() / 2);
            const deltaX = delta * (touchPos[0] - centerX);
            const deltaY = delta * (touchPos[1] - centerY);
            //field.zoom.offsetX += deltaX;
            //field.zoom.offsetY += deltaY;
        }
    });
    multiTouchHandler.registerCallBack("pinchOut", (e) => true, (e) => {
        {
            let delta = 0;
            if (field.zoom.zoomX < 1.05) {
                delta = 0.01;
            }
            else if (field.zoom.zoomX < 3) {
                delta = 0.05;
            }
            else if (field.zoom.zoomX < 8)
                delta = 0.1;
            else if (field.zoom.zoomX < 25)
                delta = 0.2;
            else if (field.zoom.zoomX < 50)
                delta = 0.4;
            else if (field.zoom.zoomX >= 25 && e.deltaY < 0)
                delta = 0;
            {
                field.zoom.zoomY -= delta * (field.zoom.zoomY / field.zoom.zoomX);
                field.zoom.zoomX -= delta;
            }
            const text = (Math.round(field.zoom.zoomX * 100) / 100).toString();
            toolSelector.transformTool.textBoxZoom.setText(text);
            const touchPos = [field.zoom.invZoomX(toolSelector.drawingScreenListener.touchPos[0]),
                field.zoom.invZoomY(toolSelector.drawingScreenListener.touchPos[1])];
            const centerX = (field.width() / 2);
            const centerY = (field.height() / 2);
            const deltaX = delta * (touchPos[0] - centerX);
            const deltaY = delta * (touchPos[1] - centerY);
            //field.zoom.offsetX -= deltaX;
            //field.zoom.offsetY -= deltaY;
        }
    });
    const keyboardHandler = new KeyboardHandler();
    const pallette = new Pallette(document.getElementById("pallette_screen"), keyboardHandler);
    const canvasListener = new SingleTouchListener(canvas, true, true, true);
    const toolSelector = new ToolSelector(pallette, keyboardHandler, canvasListener, 64, 64);
    field = toolSelector.field;
    field.toolSelector = toolSelector;
    field.setDimOnCurrent([128, 128]);
    toolSelector.penTool.tbSize.setText(field.layer().suggestedLineWidth().toString());
    toolSelector.penTool.lineWidth = field.layer().suggestedLineWidth();
    keyboardHandler.registerCallBack("keydown", (e) => true, (e) => {
        if (!e.defaultPrevented && (document.getElementById('body') === document.activeElement || document.getElementById('screen') === document.activeElement)) {
            if (e.code.substring(0, "Digit".length) === "Digit") {
                const numTyped = e.code.substring("Digit".length, e.code.length);
                pallette.highLightedCell = (parseInt(numTyped) + 9) % 10;
                pallette.selectedPixelColor.color = pallette.calcColor(pallette.highLightedCell).color;
            }
        }
    });
    const animationGroupSelector = new AnimationGroupsSelector(field, keyboardHandler, "animation_group_selector", "animations", "sprites_canvas", dim[0], dim[1], 128, 128);
    animationGroupSelector.createAnimationGroup();
    animationGroupSelector.selectedAnimationGroup = 0;
    toolSelector.animationsGroupsSelector = animationGroupSelector;
    const add_animationGroup_button = document.getElementById("add_animationGroup");
    const add_animationGroup_buttonListener = new SingleTouchListener(add_animationGroup_button, false, true);
    add_animationGroup_buttonListener.registerCallBack("touchstart", (e) => true, (e) => {
        animationGroupSelector.createAnimationGroup();
    });
    const delete_animationGroup_button = document.getElementById("delete_animationGroup");
    const delete_animationGroup_buttonListener = new SingleTouchListener(delete_animationGroup_button, false, true);
    delete_animationGroup_buttonListener.registerCallBack("touchstart", (e) => true, (e) => {
        animationGroupSelector.deleteSelectedAnimationGroup();
    });
    const clone_animationGroup_button = document.getElementById("clone_animationGroup");
    const clone_animationGroup_buttonListener = new SingleTouchListener(clone_animationGroup_button, false, true);
    clone_animationGroup_buttonListener.registerCallBack("touchstart", (e) => true, (e) => {
        animationGroupSelector.cloneSelectedAnimationGroup();
    });
    pallette.canvas.addEventListener("mouseup", (e) => {
        if (!e.button) {
            field.layer().state.color = pallette.selectedPixelColor;
            field.layer().toolSelector.colorPickerTool.tbColor.setText(pallette.selectedPixelColor.htmlRBGA());
        }
        else {
            field.layer().state.color = pallette.selectedBackColor;
            field.layer().toolSelector.colorPickerTool.tbColor.setText(pallette.selectedBackColor.htmlRBGA());
        }
    });
    pallette.listeners.registerCallBack("touchend", (e) => true, (e) => {
        if (!e.button) {
            field.layer().state.color = pallette.selectedPixelColor;
            field.layer().toolSelector.colorPickerTool.tbColor.setText(pallette.selectedPixelColor.htmlRBGA());
        }
        else {
            field.layer().state.color = (pallette.selectedBackColor);
            field.layer().toolSelector.colorPickerTool.tbColor.setText(pallette.selectedBackColor.htmlRBGA());
        }
    });
    const add_animationButton = document.getElementById("add_animation");
    const add_animationTouchListener = new SingleTouchListener(add_animationButton, false, true);
    add_animationTouchListener.registerCallBack("touchstart", (e) => true, (e) => {
        let group;
        if (group = animationGroupSelector.animationGroup()) {
            const defGroup = group;
            defGroup.pushAnimation(new SpriteAnimation(0, 0, dim[0], dim[1]));
        }
    });
    const clone_animationButton = document.getElementById("clone_animation");
    const clone_animationTouchListener = new SingleTouchListener(clone_animationButton, false, true);
    clone_animationTouchListener.registerCallBack("touchstart", (e) => true, (e) => {
        let group;
        if (group = animationGroupSelector.animationGroup()) {
            const defGroup = group;
            const animation = defGroup.cloneAnimation(defGroup.selectedAnimation);
            if (animation)
                defGroup.pushAnimation(animation);
        }
    });
    const delete_animationButton = document.getElementById("delete_animation");
    const delete_animationTouchListener = new SingleTouchListener(delete_animationButton, false, true);
    delete_animationTouchListener.registerCallBack("touchstart", (e) => true, (e) => {
        let group;
        if (group = animationGroupSelector.animationGroup()) {
            const defGroup = group;
            defGroup.deleteAnimation(defGroup.selectedAnimation);
        }
    });
    const add_spriteButton = document.getElementById("add_sprite");
    const add_spriteButtonTouchListener = new SingleTouchListener(add_spriteButton, false, true);
    add_spriteButtonTouchListener.registerCallBack("touchstart", (e) => true, (e) => {
        let group;
        if (group = animationGroupSelector.animationGroup()) {
            const defGroup = group;
            defGroup.pushSprite();
        }
    });
    const save_spriteButton = document.getElementById("save_sprite");
    const save_spriteButtonTouchListener = new SingleTouchListener(save_spriteButton, false, true);
    save_spriteButtonTouchListener.registerCallBack("touchstart", (e) => true, (e) => {
        let group;
        if (group = animationGroupSelector.animationGroup()) {
            const defGroup = group;
            defGroup.spriteSelector.pushSelectedToCanvas();
        }
    });
    const delete_spriteButton = document.getElementById("delete_sprite");
    const delete_spriteButtonTouchListener = new SingleTouchListener(delete_spriteButton, false, true);
    delete_spriteButtonTouchListener.registerCallBack("touchstart", (e) => true, (e) => {
        let group;
        if (group = animationGroupSelector.animationGroup()) {
            const defGroup = group;
            defGroup.spriteSelector.deleteSelectedSprite();
        }
    });
    canvas.onmousemove = (event) => {
        toolSelector.drawingScreenListener.touchPos[0] = event.offsetX;
        toolSelector.drawingScreenListener.touchPos[1] = event.offsetY;
    };
    canvas.addEventListener("wheel", (e) => {
        e.preventDefault();
        let delta = 0.1;
        if (SingleTouchListener.mouseDown.mouseDown || keyboardHandler.keysHeld["AltRight"] || keyboardHandler.keysHeld["AltLeft"]) {
            field.zoom.offsetX += e.deltaX;
            field.zoom.offsetY += e.deltaY;
            toolSelector.drawingScreenListener.registeredTouch = false;
        }
        else {
            if (field.zoom.zoomX < 1.05) {
                delta = 0.01;
            }
            else if (field.zoom.zoomX < 3) {
                delta = 0.05;
            }
            else if (field.zoom.zoomX > 8 && field.zoom.zoomX < 25)
                delta = 0.2;
            else if (field.zoom.zoomX < 50)
                delta = 0.4;
            else if (field.zoom.zoomX >= 50 && e.deltaY < 0)
                delta = 0;
            if (e.deltaY < 0) {
                field.zoom.zoomY += delta * (field.zoom.zoomY / field.zoom.zoomX);
                field.zoom.zoomX += delta;
            }
            else if (field.zoom.zoomX > 0.10) {
                field.zoom.zoomY -= delta * (field.zoom.zoomY / field.zoom.zoomX);
                field.zoom.zoomX -= delta;
            }
            const text = (Math.round(field.zoom.zoomX * 100) / 100).toString();
            toolSelector.transformTool.textBoxZoom.setText(text);
            const touchPos = [field.zoom.invZoomX(toolSelector.drawingScreenListener.touchPos[0]),
                field.zoom.invZoomY(toolSelector.drawingScreenListener.touchPos[1])];
            const centerX = (field.width() / 2);
            const centerY = (field.height() / 2);
            const deltaX = delta * (touchPos[0] - centerX);
            const deltaY = delta * (touchPos[1] - centerY);
            if (e.deltaY < 0) {
                field.zoom.offsetX += deltaX;
                field.zoom.offsetY += deltaY;
            }
            else {
                field.zoom.offsetX -= deltaX;
                field.zoom.offsetY -= deltaY;
            }
        }
    });
    //setup rendering canvas, and view
    canvas.width = getWidth() - toolSelector.width() - 30;
    canvas.height = screen.height * 0.65;
    field.draw(canvas, ctx, 0, 0, canvas.width, canvas.height);
    field.zoomToScreen();
    const fps = 35;
    const goalSleep = 1000 / fps;
    let counter = 0;
    const touchScreen = isTouchSupported();
    const toolCanvas = document.getElementById("tool_selector_screen");
    let toolCtx = toolCanvas.getContext("2d");
    while (true) {
        const start = Date.now();
        if (canvas.width != getWidth() - (toolCanvas.width + 30) || toolCanvas.width !== Math.floor(toolSelector.width() / toolSelector.height() * toolCanvas.height)) {
            if (!touchScreen)
                canvas.height = screen.height * 0.65;
            else
                canvas.height = screen.height;
            toolCanvas.height = pallette.canvas.height + canvas.height;
            toolCanvas.width = Math.floor(toolSelector.width() / toolSelector.height() * toolCanvas.height);
            toolSelector.repaint = true;
            canvas.width = getWidth() - toolCanvas.width - 30;
            counter = 0;
        }
        if (pallette.canvas.width !== canvas.width)
            pallette.canvas.width = canvas.width;
        toolSelector.draw();
        field.update();
        field.draw(canvas, ctx, 0, 0, canvas.width, canvas.height);
        toolSelector.renderDrawingScreenPreview();
        if (animationGroupSelector.animationGroup())
            animationGroupSelector.draw();
        if (counter++ % 3 === 0)
            pallette.draw();
        const adjustment = Date.now() - start < 30 ? Date.now() - start : 30;
        await sleep(goalSleep - adjustment);
        if (1000 / (Date.now() - start) < fps - 5) {
            console.log("avgfps:", Math.floor(1000 / (Date.now() - start)));
            if (1000 / (Date.now() - start) < 1)
                console.log("frame time:", (Date.now() - start) / 1000);
        }
    }
}
main();
