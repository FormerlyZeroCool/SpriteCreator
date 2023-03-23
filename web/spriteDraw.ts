import { GuiButton, GuiCheckBox, GuiColoredSpacer, GuiElement, GuiLabel, GuiListItem, GuiSlider, GuiSpacer, GuiTextBox, GuiToolBar, ImageContainer, Pair, RGB, RowRecord, SimpleGridLayoutManager, SlideEvent, Sprite, SpriteAnimation, TextBoxEvent, VerticalLayoutManager, blendAlphaCopy, buildSpriteFromBuffer, getWidth, horizontal_group, vertical_group } from './gui.js';
import {
    KeyboardHandler,
    TouchMoveEvent,
    isTouchSupported,
     SingleTouchListener,
     MultiTouchListener} from './io.js'
import { FilesHaver, Queue, RollingStack, matByVec, rleDecode, rleEncode, sleep, threeByThreeMat } from './utils.js';
function changeFavicon(src:string): void
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
fetchImage('/web/images/ThePixelSlime1Icons/penSprite.png').then((value) =>
changeFavicon('/web/images/ThePixelSlime1Icons/penSprite.png'));
fetchImage('images/ThePixelSlime1Icons/penSprite.png').then((value) =>
changeFavicon('images/ThePixelSlime1Icons/penSprite.png'));
const dim = [128,128];

class ToolBarItem {
    toolImages:ImageContainer[];
    selected:number;
    constructor(toolName:string | string[], toolImagePath:string | string[], selected:number = 0)
    {
        this.selected = selected;
        this.toolImages = [];
        if(Array.isArray(toolName) && !(toolImagePath instanceof String) && toolName.length === toolImagePath.length)
        {
            for(let i = 0; i < toolName.length; i++)
                this.toolImages.push(new ImageContainer(toolName[i], toolImagePath[i]));
        }
        else if(!Array.isArray(toolName) && Array.isArray(toolImagePath))
        {
            for(let i = 0; i < toolName.length; i++)
                this.toolImages.push(new ImageContainer(toolName, toolImagePath[i]));
        }
        else if(Array.isArray(toolName) && Array.isArray(toolImagePath) && toolName.length !== toolImagePath.length)
            throw new Error("Invalid params for toolbar item both lists must be same length");
        else if(!Array.isArray(toolName) && !Array.isArray(toolImagePath))
        {
            this.toolImages.push(new ImageContainer(toolName, toolImagePath));
        }
        else if(!(toolName instanceof String) && (toolImagePath instanceof String))
        {
            throw new Error("Invalid params for toolbar item both params should be same type");
        }
    }
    imageContainer():ImageContainer {
        return this.toolImages[this.selected];
    }
    width():number
    {
        return this.imageContainer()!.image!.width;
    }
    height():number
    {
        return this.imageContainer()!.image!.height;
    }
    image():HTMLImageElement | null
    {
        if(this.imageContainer())
            return this.imageContainer()!.image!;
        return null
    }
    name():string
    {
        return this.imageContainer()!.name;
    }
    drawImage(ctx:CanvasRenderingContext2D, x:number, y:number, width:number, height:number)
    {
        if(this.image())
        {
            ctx.drawImage(this.image()!, x, y, width, height);
        }
    }
};
abstract class Tool extends ToolBarItem{
    constructor(toolName:string, toolImagePath:string[])
    {
        super(toolName, toolImagePath);
    }
    abstract optionPanelSize():number[];
    abstract activateOptionPanel():void;
    abstract deactivateOptionPanel():void;
    abstract getOptionPanel():SimpleGridLayoutManager | null;
    abstract drawOptionPanel(ctx:CanvasRenderingContext2D, x:number, y:number):void;
    abstract handle_touch_events(type:string, event:any, touchPos:number[], gx:number, gy:number, deltaX:number, deltaY:number, field:LayeredDrawingScreen, toolBar:ToolSelector):void;
};
class ViewLayoutTool extends Tool {
    handle_touch_events(type: string, event: any, touchPos: number[], gx: number, gy: number, deltaX: number, deltaY: number, field: LayeredDrawingScreen, toolBar: ToolSelector): void 
    {
        if(this.event_handler)
            this.event_handler(type, event, touchPos, gx, gy, deltaX, deltaY, field, toolBar);
    }
    layoutManager:SimpleGridLayoutManager;
    event_handler:null | ((type: string, event: any, touchPos: number[], gx: number, gy: number, deltaX: number, deltaY: number, field: LayeredDrawingScreen, toolBar: ToolSelector) => void);
    constructor(layoutManager:SimpleGridLayoutManager, name:string, path:string[], event_handler: null | ((type: string, event: any, touchPos: number[], gx: number, gy: number, deltaX: number, deltaY: number, field: LayeredDrawingScreen, toolBar: ToolSelector) => void))
    {
        super(name, path);
        this.layoutManager = layoutManager;
        this.event_handler = event_handler;
    }

    activateOptionPanel():void { this.layoutManager.activate(); }
    deactivateOptionPanel():void { this.layoutManager.deactivate(); }
    getOptionPanel():SimpleGridLayoutManager | null {
        return this.layoutManager;
    }
    optionPanelSize():number[]
    {
        return [this.layoutManager.width(), this.layoutManager.height()];
    }
    drawOptionPanel(ctx:CanvasRenderingContext2D, x:number, y:number):void
    {
        const optionPanel:SimpleGridLayoutManager = this.getOptionPanel()!;
        optionPanel.x = x;
        optionPanel.y = y;
        optionPanel.draw(ctx, x, y);
    }
};
abstract class GenericTool extends Tool {
    constructor(name:string, imagePath:string[])
    {
        super(name, imagePath);
    }
    activateOptionPanel():void {}
    deactivateOptionPanel():void {}
    getOptionPanel():SimpleGridLayoutManager | null {
        return null;
    }
    optionPanelSize():number[]
    {
        return [0, 0];
    }
    drawOptionPanel(ctx:CanvasRenderingContext2D, x:number, y:number):void {}
};
abstract class ExtendedTool extends ViewLayoutTool {
    localLayout:VerticalLayoutManager;
    optionPanels:VerticalLayoutManager[];
    constructor(name:string, path:string[], optionPanes:VerticalLayoutManager[], dim:number[], event_handler: null | ((type: string, event: any, touchPos: number[], gx: number, gy: number, deltaX: number, deltaY: number, field: LayeredDrawingScreen, toolBar: ToolSelector) => void) = null)
    {
        super(new VerticalLayoutManager([dim[0], dim[1]]), name, path, event_handler);
        this.localLayout = new VerticalLayoutManager([dim[0], dim[1]]);
        const parentPanel:VerticalLayoutManager = this.getOptionPanel()!;
        parentPanel.addElement(this.localLayout);
        this.optionPanels = [this.localLayout];
        let maxY:number = this.localLayout.height();
        let maxX:number = this.localLayout.width();
        optionPanes.forEach((pane:any) => {
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
        this.getOptionPanel()!.activate();
        this.optionPanels.forEach(element => {
            element.activate();
        });
    }
    deactivateOptionPanel(): void {
        this.getOptionPanel()!.deactivate();
        this.optionPanels.forEach(element => {
            element.deactivate();
        });
    }
};
abstract class SingleCheckBoxTool extends GenericTool {
    optionPanel:SimpleGridLayoutManager;
    checkBox:GuiCheckBox;
    constructor(label:string, name:string, imagePath:string[], callback:() => void = () => null)
    {
        super(name, imagePath);
        this.optionPanel = new SimpleGridLayoutManager([1,4], [200, 90]);
        this.checkBox = new GuiCheckBox(callback, 40, 40);
        this.optionPanel.addElement(new GuiLabel(label, 200, 16, 40));
        this.optionPanel.addElement(this.checkBox);
    }
    activateOptionPanel():void { this.optionPanel.activate(); }
    deactivateOptionPanel():void { this.optionPanel.deactivate(); }
    getOptionPanel():SimpleGridLayoutManager | null {
        return this.optionPanel;
    }
    optionPanelSize():number[]
    {
        return [this.optionPanel.width(), this.optionPanel.height()];
    }
    drawOptionPanel(ctx:CanvasRenderingContext2D, x:number, y:number):void {
        const optionPanel:SimpleGridLayoutManager = this.getOptionPanel()!;
        optionPanel.x = x;
        optionPanel.y = y;
        optionPanel.draw(ctx, x, y);
    }
};
class DragTool extends ExtendedTool {
    handle_touch_events(type: string, event: any, touchPos: number[], gx: number, gy: number, deltaX:number, deltaY:number, field: LayeredDrawingScreen, toolBar: ToolSelector) {
        switch(type)
        {
            case("touchstart"):
            field.layer().saveDragDataToScreen();
            if(toolBar.dragTool.checkboxAutoSelect.checked)
            {
                if(field.layer().state.dragOnlyOneColor || toolBar.keyboardHandler.keysHeld["AltLeft"])
                    field.layer().dragData = field.layer().getSelectedPixelGroupAuto(new Pair<number>(gx,gy), true);
                else
                    field.layer().dragData = field.layer().getSelectedPixelGroupAuto(new Pair<number>(gx,gy), false);
            }
            else
            {
                if(field.layer().state.dragOnlyOneColor || toolBar.keyboardHandler.keysHeld["AltLeft"])
                    field.layer().dragData = field.layer().getSelectedPixelGroupBitMask(new Pair<number>(gx,gy), true);
                else
                    field.layer().dragData = field.layer().getSelectedPixelGroupBitMask(new Pair<number>(gx,gy), false);
            }
            break;
            case("touchmove"):
            field.layer().dragData!.x += (deltaX / field.layer().bounds.first) * field.layer().dimensions.first;
            field.layer().dragData!.y += (deltaY / field.layer().bounds.second) * field.layer().dimensions.second;
            break;
            case("touchend"):
                field.layer().saveDragDataToScreen();
                field.layer().dragData = null;
            break;
        }
    }
    checkBox:GuiCheckBox;
    checkBoxBlendAlpha:GuiCheckBox;
    checkboxAutoSelect:GuiCheckBox;
    checkboxAllowDropOutsideSelection:GuiCheckBox;
    toolSelector:ToolSelector;
    constructor(name:string, imagePath:string[], callBack:() => void, callBackBlendAlphaState:()=>void, optionPanes:SimpleGridLayoutManager[] = [], toolSelector:ToolSelector)
    {
        super(name, imagePath, optionPanes, [200, 190]);
        this.toolSelector = toolSelector;
        this.checkBox = new GuiCheckBox(callBack, 40, 40);
        this.checkBoxBlendAlpha = new GuiCheckBox(callBackBlendAlphaState, 40, 40);
        this.checkboxAutoSelect = new GuiCheckBox(() => toolSelector.field.layer().repaint = true, 40, 40, true);
        this.checkboxAllowDropOutsideSelection = new GuiCheckBox((event) =>{
            toolSelector.field.state.allowDropOutsideSelection = event.checkBox.checked;
        }, 40, 40)
        this.checkBoxBlendAlpha.checked = true;
        this.checkBoxBlendAlpha.refresh();
        this.localLayout.addElement(
            vertical_group([
                horizontal_group([ new GuiLabel("Only drag\none color:", 150, 16, 40), this.checkBox ]),
                horizontal_group([ new GuiLabel("Blend alpha\nwhen dropping:", 150, 16, 40), this.checkBoxBlendAlpha]),
                horizontal_group([ new GuiLabel("Auto select\nwhen dragging:", 150, 16, 40), this.checkboxAutoSelect]),
                horizontal_group([ new GuiLabel("Allow dropping\noutside select:", 150, 16, 40), this.checkboxAllowDropOutsideSelection])
            ])
        );
        this.localLayout.trimDim();
        this.layoutManager.refresh();
    }
    activateOptionPanel(): void {
        super.activateOptionPanel();
        this.checkboxAllowDropOutsideSelection.checked = this.toolSelector.field.state.allowDropOutsideSelection;
    }
    
};
class OutlineTool extends ExtendedTool {
    handle_touch_events(type: string, event: any, touchPos: number[], gx: number, gy: number, deltaX: number, deltaY: number, field: LayeredDrawingScreen, toolBar: ToolSelector): void {
        const startTouchPos:number[] = [field.zoom.invZoomX(toolBar.drawingScreenListener.startTouchPos[0]), field.zoom.invZoomY(toolBar.drawingScreenListener.startTouchPos[1])];
        const gStartX:number = Math.floor((startTouchPos[0])/field.layer().bounds.first*field.layer().dimensions.first);
        const gStartY:number = Math.floor((startTouchPos[1])/field.layer().bounds.second*field.layer().dimensions.second);
            
        switch(type)
        {
            case("touchstart"):
            field.layer().autoOutline(new Pair<number>(gx, gy), toolBar.outLineTool.checkboxOnlyOneColor.checked);
            break;
            case("touchmove"):
            field.layer().autoOutline(new Pair<number>(gStartX, gStartY), false);
            break;
        }
    }
    checkboxOnlyOneColor:GuiCheckBox;
    constructor(name:string, imagePath:string[], toolSelector:ToolSelector, optionPanes:SimpleGridLayoutManager[] = [])
    {
        super(name, imagePath, optionPanes, [200, 110]);
        this.checkboxOnlyOneColor = new GuiCheckBox(() => {}, 40, 40, false);
        this.localLayout.addElement(new GuiLabel("Outline tool:", 200, 16));
        this.localLayout.addElement(new GuiLabel("Outline only one color:", 200, 16));
        this.localLayout.addElement(this.checkboxOnlyOneColor);
    }
};
class RotateTool extends ExtendedTool {
    handle_touch_events(type: string, event: any, touchPos: number[], gx: number, gy: number, deltaX: number, deltaY: number, field: LayeredDrawingScreen, toolBar: ToolSelector): void {
        switch(type)
        {
            case("touchstart"):

            if(field.layer().state.antiAliasRotation)
            field.layer().saveDragDataToScreenAntiAliased();
            else
                field.layer().saveDragDataToScreen();
            if(toolBar.rotateTool.checkboxAutoSelect.checked)
            {
                if(field.layer().state.rotateOnlyOneColor || toolBar.keyboardHandler.keysHeld["AltLeft"])
                    field.layer().dragData = field.layer().getSelectedPixelGroupAuto(new Pair<number>(gx,gy), true);
                else
                    field.layer().dragData = field.layer().getSelectedPixelGroupAuto(new Pair<number>(gx,gy), false);
            }
            else
            {
                if(field.layer().state.rotateOnlyOneColor || toolBar.keyboardHandler.keysHeld["AltLeft"])
                    field.layer().dragData = field.layer().getSelectedPixelGroupBitMask(new Pair<number>(gx,gy), true);
                else
                    field.layer().dragData = field.layer().getSelectedPixelGroupBitMask(new Pair<number>(gx,gy), false);
            }
            break;
            case("touchmove"):
                let angle:number = Math.PI / 2;
                let moveCountBeforeRotation:number = 10;
                if(field.state.antiAliasRotation){
                    angle = (Math.PI / 32) * (event.mag / 3);
                    moveCountBeforeRotation = 2;
                }
                const startTouchPos:number[] = [(toolBar.field.zoom.invZoomX(toolBar.drawingScreenListener.startTouchPos[0]) / field.width()) * field.width(),
                (toolBar.field.zoom.invZoomY(toolBar.drawingScreenListener.startTouchPos[1]) / field.height()) * field.height()];
                const transformed:number[] = [touchPos[0] - startTouchPos[0], (touchPos[1] - startTouchPos[1]) * -1];
                const multiplierY:number = -1 * +(transformed[0] < 0) + +(transformed[0] >= 0);
                const multiplierX:number = -1 * +(transformed[1] < 0) + +(transformed[1] >= 0);
                if(event.moveCount % moveCountBeforeRotation === 0)
                    if(event.deltaY * multiplierY > 0 || event.deltaX * multiplierX > 0)
                        field.layer().rotateSelectedPixelGroup(angle, startTouchPos);
                    else if(event.deltaY * multiplierY < 0 || event.deltaX * multiplierX < 0)
                        field.layer().rotateSelectedPixelGroup(-angle, startTouchPos);
                    if(field.state.antiAliasRotation){
                        //field.layer().dragData!.second;
                    }
                break;
                case("touchend"):
                    if(field.state.antiAliasRotation)
                        field.layer().saveDragDataToScreenAntiAliased();
                    else
                        field.layer().saveDragDataToScreen();
                    field.layer().dragData = null;
                break;
        }
    }
    checkBox:GuiCheckBox;
    checkBoxAntiAlias:GuiCheckBox;
    checkboxAllowDropOutsideSelection:GuiCheckBox;
    checkboxAutoSelect:GuiCheckBox;

    toolSelector:ToolSelector;
    constructor(name:string, imagePath:string[], callBack:() => void, callBackAntiAlias:() => void, optionPanes:SimpleGridLayoutManager[] = [],toolSelector:ToolSelector)
    {
        super(name, imagePath, optionPanes, [200, 230]);
        this.toolSelector = toolSelector;
        this.checkBox = new GuiCheckBox(callBack, 40, 40);
        this.checkBoxAntiAlias = new GuiCheckBox(callBackAntiAlias, 40, 40);
        this.checkboxAutoSelect = new GuiCheckBox(() => toolSelector.field.layer().repaint = true, 40, 40, true);
        this.checkBoxAntiAlias.checked = true;
        this.checkBoxAntiAlias.refresh();
        this.checkboxAllowDropOutsideSelection = new GuiCheckBox((event) =>{
            toolSelector.field.state.allowDropOutsideSelection = event.checkBox.checked;
        }, 40, 40, false)
        this.localLayout.addElement(
            vertical_group([ 
                horizontal_group([ new GuiLabel("Only rotate adjacent\npixels of same color:", 200, 16, 50), this.checkBox ]),
                horizontal_group([ new GuiLabel("anti-alias\nrotation:", 90, 16, 40), this.checkBoxAntiAlias ]),
                horizontal_group([ new GuiLabel("Auto select:\n ", 150, 16, 40), this.checkboxAutoSelect ]),
                horizontal_group([ new GuiLabel("Allow dropping\noutside select:", 150, 16, 40), this.checkboxAllowDropOutsideSelection ])
            ])
        );

    }
    activateOptionPanel(): void {
        super.activateOptionPanel();
        this.checkboxAllowDropOutsideSelection.checked = this.toolSelector.field.state.allowDropOutsideSelection;
    }
};
class UndoRedoTool extends ExtendedTool {
    handle_touch_events(type: string, event: any, touchPos: number[], gx: number, gy: number, deltaX: number, deltaY: number, field: LayeredDrawingScreen, toolBar: ToolSelector): void {
        
    }
    stackFrameCountLabel:GuiLabel;
    constructor(toolSelector:ToolSelector, name:string, imagePath:string[], callback: () => void)
    {
        super(name, imagePath, [], [200,100]);
        this.stackFrameCountLabel = new GuiLabel(`Redo: ${0}\nUndo: ${0}`, 100, 16, 40);
        const chbx = new GuiCheckBox(callback, 40, 40);
        chbx.activate();
        chbx.refresh();
        this.localLayout.addElement(
            vertical_group([ 
                new GuiLabel("Slow mode(undo/redo):", 200), 
                horizontal_group([ chbx, this.stackFrameCountLabel ]) 
            ])
        );
    }
    updateLabel(redo:number, undo:number):void{
        this.stackFrameCountLabel.setText(`Redo: ${redo}\nUndo: ${undo}`);
    }
};
class FillTool extends ExtendedTool {
    handle_touch_events(type: string, event: any, touchPos: number[], gx: number, gy: number, deltaX: number, deltaY: number, field: LayeredDrawingScreen, toolBar: ToolSelector): void {
        switch(type)
        {
            case("touchmove"):
            case("touchend"):
                if(toolBar.fillTool.checkNonContiguous.checked)
                    field.layer().fillNonContiguous(new Pair<number>(gx, gy));
                else
                    field.layer().fillArea(new Pair<number>(gx, gy));
            break;
        }
    }
    checkNonContiguous:GuiCheckBox;
    constructor(name:string, path:string[], optionPanes:SimpleGridLayoutManager[], updateIgnoreSameColorBoundaries:() => void)
    {
        super(name, path, optionPanes, [200, 100]);
        this.checkNonContiguous = new GuiCheckBox(updateIgnoreSameColorBoundaries);
        this.localLayout.addElement(new GuiLabel("Fill Options:", 200, 16, 35));
        this.localLayout.addElement(horizontal_group([ new GuiLabel("Non\nContiguous:", 130, 16, 35), this.checkNonContiguous ]));
    }
};
class PenViewTool extends ViewLayoutTool {
    pen:PenTool;
    constructor(pen:PenTool, name:string, path:string[], event_handler:null | ((type:string, event:any, touchPos:number[], gx:number, gy:number, deltaX:number, deltaY:number, field) => void))
    {
        super(pen.getOptionPanel()!, name, path, event_handler);
        this.pen = pen;
    }
};
class PenTool extends ExtendedTool {
    handle_touch_events(type: string, event: any, touchPos: number[], gx: number, gy: number, deltaX: number, deltaY: number, field: LayeredDrawingScreen, toolBar: ToolSelector): void {
        const x1:number = touchPos[0] - deltaX;
        const y1:number = touchPos[1] - deltaY;
        switch(type)
        {
            case("touchstart"):
            {
                field.layer().setLineWidthPen();

                if(toolBar.penTool.checkboxPixelPerfect.checked)
                {
                    field.layer().handleTapPixelPerfect(touchPos[0], touchPos[1]);
                }
                else
                    field.layer().handleTapSprayPaint(touchPos[0], touchPos[1]);
            }
            break;

            case("touchmove"):
            if(this.checkboxPixelPerfect.checked)
            {
                field.layer().handleDraw(x1, touchPos[0], y1, touchPos[1], (x, y, screen) => screen.handleTapPixelPerfect(x, y));
                break;
            }
            field.layer().handleDraw(x1, touchPos[0], y1, touchPos[1], (x, y, screen) => screen.handleTapSprayPaint(x, y));
            break;
        }
    }
    lineWidth:number;
    tbSize:GuiTextBox;
    btUpdate:GuiButton;
    checkboxPixelPerfect:GuiCheckBox;
    static checkboxSprayPaint:GuiCheckBox = new GuiCheckBox(null, 40, 40);
    static checkDrawCircular:GuiCheckBox = new GuiCheckBox(null, 40, 40);
    constructor(strokeWith:number, toolName:string = "pen", pathToImage:string[] = ["images/penSprite.png"], optionPanes:SimpleGridLayoutManager[], field:LayeredDrawingScreen, dimLocal:number[] = [200,160])
    {
        super(toolName, pathToImage, optionPanes, [200, 200]);
        this.layoutManager.pixelDim = [200, 600];
        this.lineWidth = strokeWith;
        this.checkboxPixelPerfect = new GuiCheckBox(() => { 
            field.state.lineWidth = 1;
            this.lineWidth = 1;
        }, 40, 40, false);
        this.tbSize = new GuiTextBox(true, 90, null, 16, 35, GuiTextBox.default, (event:TextBoxEvent) => {
            if(!event.textbox.asNumber.get() && event.textbox.text.length > 1)
            {
                return false;
            }
            else if(event.textbox.asNumber.get()! > 128)
            {
                event.textbox.setText("128");
            }
            return true;
        });
        this.tbSize.promptText = "Enter line width:";
        this.tbSize.setText(String(this.lineWidth));
        this.btUpdate = new GuiButton(() => { 
            this.lineWidth = this.tbSize.asNumber.get() ? (this.tbSize.asNumber.get()! <= 128 ? this.tbSize.asNumber.get()! : 128):this.lineWidth; 
            this.tbSize.setText(String(this.lineWidth))},
            "Update", 75, this.tbSize.height(), 16);
        this.tbSize.submissionButton = this.btUpdate;
        this.localLayout.addElement(new GuiLabel("Line width:", 200, 16, 40, GuiTextBox.bottom));
        
        this.localLayout.addElement(horizontal_group([ this.tbSize, this.btUpdate ]));
        this.localLayout.addElement(new GuiSpacer([200, 5]));
        this.localLayout.addElement(horizontal_group([ new GuiLabel("Round\npen tip:", 90, 16, 40), PenTool.checkDrawCircular ]));
        this.localLayout.addElement(horizontal_group([ new GuiLabel("Pixel\nperfect:", 90, 16, 40), this.checkboxPixelPerfect ]));
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
    getOptionPanel():SimpleGridLayoutManager | null {
        return this.layoutManager;
    }
    optionPanelSize():number[]
    {
        return [this.layoutManager.width(), this.layoutManager.height()];
    }
    drawOptionPanel(ctx:CanvasRenderingContext2D, x:number, y:number):void 
    {
        const optionPanel:SimpleGridLayoutManager = this.getOptionPanel()!;
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
    tbProbability:GuiSlider;
    constructor(strokeWidth:number, toolName:string, pathToImage:string[], callBack:(tbProbability:GuiSlider)=>void, optionPanes:SimpleGridLayoutManager[], field:LayeredDrawingScreen)
    {
        super(strokeWidth, toolName, pathToImage, optionPanes, field, [200, 155]);
        this.localLayout.matrixDim = [8, 5];
        this.tbProbability = new GuiSlider(1, [125, 40], (event:SlideEvent) => {
            callBack(this.tbProbability);
        });
        this.btUpdate.callback = () => { 
            this.lineWidth = this.tbSize.asNumber.get() ? (this.tbSize.asNumber.get()! <= 128 ? this.tbSize.asNumber.get()! : 128):this.lineWidth; 
            this.tbSize.setText(String(this.lineWidth));
            callBack(this.tbProbability);
        };
        this.localLayout.addElement(horizontal_group([ new GuiLabel("Spray\nprob:", 70, 16, 40), this.tbProbability ]));
    }
};
class CustomBackgroundSlider extends GuiSlider {
    backgroundCanvas:HTMLCanvasElement;
    backctx:CanvasRenderingContext2D;
    refreshBackground:(ctx:CanvasRenderingContext2D, x:number, y:number, width:number, height:number) => void;
    constructor(state:number, dim:number[], movedCallBack:(e:SlideEvent) => void, 
        refreshBackgroundCallBack:(ctx:CanvasRenderingContext2D, x:number, y:number, width:number, height:number) => void)
    {
        super(state, dim, movedCallBack);
        this.refreshBackground = refreshBackgroundCallBack;
    }
    refresh(): void {
        super.refresh();
        if(!this.backgroundCanvas)
        {
            this.backgroundCanvas = document.createElement("canvas");
            this.backctx = this.backgroundCanvas.getContext("2d")!;
        }
        const bounds:number[] = this.getBounds();
        this.backctx.clearRect(0, 0, this.width(), this.height());
        if(this.refreshBackground)
            this.refreshBackground(this.backctx, bounds[0], bounds[1], bounds[2], bounds[3]);
    }
    draw(ctx:CanvasRenderingContext2D, x:number, y:number, offsetX:number, offsetY:number):void
    {
        ctx.drawImage(this.backgroundCanvas, x + offsetX, y + offsetY);
        super.draw(ctx, x, y, offsetX, offsetY);
    }
};
class ColorPickerTool extends ExtendedTool {
    handle_touch_events(type: string, event: any, touchPos: number[], gx: number, gy: number, deltaX: number, deltaY: number, field: LayeredDrawingScreen, toolBar: ToolSelector): void {
       // for Gui lib
        //field.layer().toolSelector.updateColorPickerTextBox();
        field.state.color.copy(field.layer().screenBuffer[gx + gy*field.layer().dimensions.first]);
        field.layer().toolSelector.updateColorPickerTextBox();
    }
    field:LayeredDrawingScreen;
    tbColor:GuiTextBox;
    btUpdate:GuiButton;
    chosenColor:GuiColoredSpacer;
    hueSlider:CustomBackgroundSlider;
    saturationSlider:CustomBackgroundSlider;
    lightnessSlider:CustomBackgroundSlider;
    alphaSlider:CustomBackgroundSlider;
    buttonInvertColors:GuiButton;

    constructor(field:LayeredDrawingScreen, toolName:string = "color picker", pathToImage:string[] = ["images/colorPickerSprite.png"], optionPanes:SimpleGridLayoutManager[] = [])
    {
        super(toolName, pathToImage, optionPanes, [200, 220]);
        this.field = field;
        this.chosenColor = new GuiColoredSpacer([100, 32], new RGB(0,0,0,255));
        field.toolSelector.repaint = true;
        this.tbColor = new GuiTextBox(true, 200, null, 16, 32, GuiTextBox.default, (e) =>
        {
            const color:RGB = new RGB(0,0,0,0);
            const code:number = color.loadString(e.textbox.text);
            if(code === 2)//overflow
            {
                e.textbox.text = (color.htmlRBGA());
            }
            else if(code === 1)//parse error
            {
                return false;
            }
            this.chosenColor.color.copy(color);
            field.toolSelector.repaint = true;
            return true;
        });
        this.tbColor.promptText = "Enter RGBA color here (RGB 0-255 A 0-1):";
        this.btUpdate = new GuiButton(() => { 
            const color:RGB = new RGB(0,0,0,0);
            const code:number = color.loadString(this.tbColor.text);
            if(code === 0)
            {
                this.field.layer().palette.setSelectedColor(this.tbColor.text);
                this.field.layer().state.color = this.field.layer().palette.selectedPixelColor;
            }
            else if(code === 2)
            {
                this.field.layer().palette.setSelectedColor(color.htmlRBGA());
                this.field.layer().state.color = this.field.layer().palette.selectedPixelColor;
            }
            else{
                this.tbColor.setText(this.field.layer().palette.selectedPixelColor.htmlRBGA());
            }
            this.setColorText()
        },
            "Update", 75, this.tbColor.height(), 16);
        this.tbColor.submissionButton = this.btUpdate;
        const colorSlideEvent:(event:SlideEvent) => void = (event:SlideEvent) => {
            const color:RGB = new RGB(0, 0, 0, 0);
            color.setByHSL(this.hueSlider.state * 360, this.saturationSlider.state, this.lightnessSlider.state);
            color.setAlpha(this.alphaSlider.state * 255);
            field.pallette.selectedPixelColor.copy(color);
            this.color().copy(color);
            this._setColorText();
            this.hueSlider.refresh();
            this.saturationSlider.refresh();
            this.lightnessSlider.refresh();
            this.alphaSlider.refresh();
        }
        this.hueSlider = new CustomBackgroundSlider(0, [150, 25], colorSlideEvent, 
            (ctx:CanvasRenderingContext2D, x:number, y:number, width:number, height:number) => {
                const color:RGB = new RGB(0, 0, 0, 0);
                if(this.color())
                {
                    const hsl:number[] = [this.hueSlider.state * 360, this.saturationSlider.state, this.lightnessSlider.state];

                    const unitStep:number = 1 / width;
                    let i = 0;
                    for(let j = 0; j < 1; j += unitStep)
                    {
                        hsl[0] = j * 360;
                        color.setByHSL(hsl[0], hsl[1], hsl[2]);
                        color.setAlpha(this.color().alpha());
                        ctx.fillStyle = color.htmlRBGA();
                        ctx.fillRect(j * width + x, y, unitStep * width, height);
                    }
                }
        });
        this.saturationSlider = new CustomBackgroundSlider(1, [150, 25], colorSlideEvent, 
            (ctx:CanvasRenderingContext2D, x:number, y:number, width:number, height:number) => {
                const color:RGB = new RGB(0, 0, 0, 0);
                if(this.color())
                {
                    const hsl:number[] = [this.hueSlider.state * 360, this.saturationSlider.state, this.lightnessSlider.state];
                    
                    const unitStep:number = 1 / width;
                    let i = 0;
                    for(let j = 0; j < 1; j += unitStep)
                    {
                        color.setByHSL(hsl[0], j, hsl[2]);
                        color.setAlpha(this.color().alpha());
                        ctx.fillStyle = color.htmlRBGA();
                        ctx.fillRect(j * width + x, y, unitStep * width, height);
                    }
                }
        });
        this.lightnessSlider = new CustomBackgroundSlider(0, [150, 25], colorSlideEvent, 
            (ctx:CanvasRenderingContext2D, x:number, y:number, width:number, height:number) => {
                const color:RGB = new RGB(0, 0, 0, 0);
                if(this.color())
                {
                    const hsl:number[] = [this.hueSlider.state * 360, this.saturationSlider.state, this.lightnessSlider.state];
                    
                    const unitStep:number = 1 / width;
                    let i = 0;
                    for(let j = 0; j < 1; j += unitStep, i++)
                    {
                        hsl[2] = j;
                        color.setByHSL(hsl[0], hsl[1], hsl[2]);
                        color.setAlpha(this.color().alpha());
                        ctx.fillStyle = color.htmlRBGA();
                        ctx.fillRect(i + x, y, unitStep * width, height);
                    }
                }
        });
        this.alphaSlider = new CustomBackgroundSlider(1, [150, 25], colorSlideEvent,
            (ctx:CanvasRenderingContext2D, x:number, y:number, width:number, height:number) => {
                const color:RGB = new RGB(0, 0, 0, 0);
                if(this.color())
                {
                    color.setByHSL(this.hueSlider.state * 360, this.saturationSlider.state, this.lightnessSlider.state);
                    const unitStep:number = width / 255;
                    for(let j = 0; j < width; j += unitStep)
                    {
                        color.setAlpha(j);
                        ctx.fillStyle = color.htmlRBGA();
                        ctx.fillRect(j + x, y, unitStep, height);
                    }
                }
        });
        this.buttonInvertColors = new GuiButton(() => {
            const selected:RGB = field.pallette.selectedPixelColor;
            const back:RGB = field.pallette.selectedBackColor;
            field.swapColors(selected, back);
            const temp:number = selected.color;
            selected.color = back.color;
            back.color = temp;
            field.redraw = true;
        }, "Invert Colors/Flash", 175, 40, 16);
        this.localLayout.addElement(new GuiLabel("Color:", 100, 16));
        this.localLayout.addElement(this.chosenColor);
        this.localLayout.addElement(this.tbColor);
        this.localLayout.addElement(this.btUpdate);
        this.localLayout.addElement(horizontal_group([ new GuiLabel("Hue", 50, 16), this.hueSlider ]));
        this.localLayout.addElement(horizontal_group([ new GuiLabel("Sat", 50, 16), this.saturationSlider ]));
        this.localLayout.addElement(horizontal_group([ new GuiLabel("light", 50, 16), this.lightnessSlider ]));
        this.localLayout.addElement(horizontal_group([ new GuiLabel("ap", 50, 16), this.alphaSlider ]));

        this.getOptionPanel()!.addElement(this.buttonInvertColors);
        this.setColorText();
        
    }
    color():RGB
    {
        return this.field.layer().state.color;
    }
    setColorText():void
    {
        const color:RGB = this._setColorText();
        const hsl:number[] = color.toHSL();
        this.hueSlider.setState(hsl[0] / 360);
        this.saturationSlider.setState(hsl[1]);
        this.lightnessSlider.setState(hsl[2]);
        this.alphaSlider.setState(color.alpha() / 255);
        this.field.toolSelector.repaint = true;
    }
    _setColorText():RGB
    {
        const color:RGB = new RGB(0,0,0);
        if(this.color())
            color.copy(this.color());
        
        this.chosenColor.color.copy(color);
        this.tbColor.setText(color.htmlRBGA());
        this.field.toolSelector.repaint = true;
        return color;
    }
    activateOptionPanel():void { this.layoutManager.activate(); }
    deactivateOptionPanel():void { this.layoutManager.deactivate(); }
    getOptionPanel():SimpleGridLayoutManager | null {
        return this.layoutManager;
    }
    optionPanelSize():number[]
    {
        return [this.layoutManager.width(), this.layoutManager.height()];
    }
    drawOptionPanel(ctx:CanvasRenderingContext2D, x:number, y:number):void 
    {
        const optionPanel:SimpleGridLayoutManager = this.getOptionPanel()!;
        optionPanel.x = x;
        optionPanel.y = y;
        optionPanel.draw(ctx, x, y);
    }
};
class DrawingScreenSettingsTool extends ExtendedTool {
    handle_touch_events(type: string, event: any, touchPos: number[], gx: number, gy: number, deltaX: number, deltaY: number, field: LayeredDrawingScreen, toolBar: ToolSelector): void {
        
    }
    tbX:GuiTextBox;
    tbY:GuiTextBox;
    btUpdate:GuiButton;
    checkBoxResizeImage:GuiCheckBox;
    sliderMiniMapTransparency:GuiSlider;
    dim:number[];
    field:LayeredDrawingScreen;
    textboxPaletteSize:GuiTextBox;
    checkboxPixelGrid:GuiCheckBox;
    backgroundOptions:GuiCheckList;
    checkboxAlwaysShowMiniMap:GuiCheckBox;
    constructor(dim:number[] = [524, 520], field:LayeredDrawingScreen, toolName:string, pathToImage:string[], optionPanes:SimpleGridLayoutManager[])
    {
        super(toolName, pathToImage, optionPanes, [200, 490]);
        this.dim = dim;
        this.field = field;
        this.checkBoxResizeImage = new GuiCheckBox(() => field.state.resizeSprite = this.checkBoxResizeImage.checked, 40, 40);
        this.checkBoxResizeImage.checked = false;
        this.checkBoxResizeImage.refresh();
        this.btUpdate = new GuiButton(() => {
            this.recalcDim();
            if(this.textboxPaletteSize.asNumber.get())
            {
                if(this.textboxPaletteSize.asNumber.get()! < 128)
                    field.pallette.changeSize(this.textboxPaletteSize.asNumber.get()!)
                else
                    field.toolSelector.toolBar.setImagesIndex(+!this.selected);
            }
        },
            "Update", 75, 40, 16);

        this.textboxPaletteSize = new GuiTextBox(true, 80, this.btUpdate, 16, this.btUpdate.height(), GuiTextBox.default, (event:any) => {
            if(!event.textbox.asNumber.get() && event.textbox.text.length > 1)
            {
                return false;
            }
            return true;
        });
        this.textboxPaletteSize.promptText = "Enter a new size for the palette.";
        this.textboxPaletteSize.setText(field.pallette.colors.length.toString());
        this.tbX = new GuiTextBox(true, 70, null, 16, 35, GuiTextBox.default, (event:TextBoxEvent) => {
            if(!event.textbox.asNumber.get() && event.textbox.text.length > 1)
            {
                return false;
            }
            return true;
        });
        this.tbX.promptText = "Enter width:";
        this.tbX.setText(String(this.dim[0]));
        this.tbY = new GuiTextBox(true, 70, null, 16, 35, GuiTextBox.default, (event:TextBoxEvent) => {
            if(!event.textbox.asNumber.get() && event.textbox.text.length > 1)
            {
                return false;
            }
            return true;
        });//, null, 16, 100);
        this.tbY.promptText = "Enter height:";
        this.tbY.setText(String(this.dim[1]));
        this.sliderMiniMapTransparency = new GuiSlider(field.miniMapAlpha, [100, 50], (event:SlideEvent) => {
            field.miniMapAlpha = event.value;
        })
        this.tbX.submissionButton = this.btUpdate;
        this.tbY.submissionButton = this.btUpdate;
        this.checkboxPixelGrid = new GuiCheckBox((e:any) => {field.layer().repaint = true}, 40, 40);
        this.backgroundOptions = new GuiCheckList([1, 3], [200, 100], 16, true, null, null);
        this.backgroundOptions.push("Default", true, (event:any) => {
            field.backgroundState = LayeredDrawingScreen.default_background;
            field.refreshBackgroundCanvas();
        }, () => {});
        this.backgroundOptions.push("White", false, (event:any) => {
            field.backgroundState = LayeredDrawingScreen.white_background;
            field.refreshBackgroundCanvas();
        }, () => {});
        this.backgroundOptions.push("Black", false, (event:any) => {
            field.backgroundState = LayeredDrawingScreen.black_background;
            field.refreshBackgroundCanvas();
        }, () => {});
        this.backgroundOptions.refresh();
        this.checkboxAlwaysShowMiniMap = new GuiCheckBox(() => {}, 40, 40);
        this.localLayout.addElement(new GuiLabel("Sprite Resolution:", 200, 16));
        this.localLayout.addElement(horizontal_group([ new GuiLabel("Width:", 90, 16), new GuiLabel("Height:", 90, 16) ]));
        this.localLayout.addElement(horizontal_group([ this.tbX, new GuiSpacer([90 - this.tbX.width()]), this.tbY ]));
        this.localLayout.addElement(new GuiSpacer([85, 10]));
        this.localLayout.addElement(horizontal_group([ new GuiLabel("Resize\nsprite:", 130, 16, this.btUpdate.height()), this.checkBoxResizeImage ]));
        this.localLayout.addElement(new GuiSpacer([100, 5]));
        this.localLayout.addElement(horizontal_group([ new GuiLabel("Always\nshow map:", 130, 16), this.checkboxAlwaysShowMiniMap ]));
        this.localLayout.addElement(horizontal_group([ new GuiLabel("map\nalpha:", 100, 16), this.sliderMiniMapTransparency ]));
        this.localLayout.addElement(horizontal_group([ new GuiLabel("palette\nsize:", 100, 16), this.textboxPaletteSize ]));
        this.localLayout.addElement(this.btUpdate);
        this.localLayout.addElement(horizontal_group([ new GuiLabel("Show grid?", 100, 16), this.checkboxPixelGrid ]));
        this.localLayout.addElement(new GuiLabel("Background options:", 200, 16, GuiTextBox.bottom));
        this.localLayout.addElement(this.backgroundOptions);

    }
    setDim(dim:number[]):void
    {
        this.tbX.setText(dim[0].toString());
        this.tbY.setText(dim[1].toString());
        this.dim = [dim[0], dim[1]];
    }
    activateOptionPanel():void { this.layoutManager.activate(); }
    deactivateOptionPanel():void { this.layoutManager.deactivate(); }
    getOptionPanel():SimpleGridLayoutManager | null {
        return this.layoutManager;
    }
    recalcDim():void
    {
        let x:number = this.dim[0];
        let y:number = this.dim[1];
        if(this.tbX.asNumber.get())
            x = this.tbX.asNumber.get()!;
        if(this.tbY.asNumber.get())
            y = this.tbY.asNumber.get()!;
        this.dim = [x, y];
        this.field.setDimOnCurrent(this.dim);
    }
    optionPanelSize():number[]
    {
        return [this.layoutManager.width(), this.layoutManager.height()];
    }
    drawOptionPanel(ctx:CanvasRenderingContext2D, x:number, y:number):void 
    {
        const optionPanel:SimpleGridLayoutManager = this.getOptionPanel()!;
        optionPanel.x = x;
        optionPanel.y = y;
        optionPanel.draw(ctx, x, y);
    }
};
class ClipBoard implements GuiElement {
    offscreenCanvas:HTMLCanvasElement;
    offscreenCtx:CanvasRenderingContext2D;
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    sprite:Sprite;
    angle:number;
    repaint:boolean;
    focused:boolean;
    parent: GuiElement | undefined;
    constructor(canvas:HTMLCanvasElement, keyboardHandler:KeyboardHandler, pixelCountX:number, pixelCountY:number)
    {
        this.repaint = true;
        this.canvas = document.createElement("canvas");
        this.offscreenCanvas = document.createElement("canvas");
        this.offscreenCtx = this.offscreenCanvas.getContext("2d")!;
        this.focused = false;
        this.canvas.height = pixelCountX;
        this.canvas.width = pixelCountY;
        this.ctx = this.canvas.getContext("2d")!;
        this.sprite = new Sprite([new RGB(0,0,0,0)], pixelCountX, pixelCountY);
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
            //if(this.clipBoardBuffer.length)
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
            this.repaint = true;
            this.refreshImageFromBuffer();
        }
    }
    //only really works for rotation by pi/2
    rotate(theta:number):void
    {
        const newSprite:Sprite = new Sprite([], this.sprite.height, this.sprite.width);
        for(let i = 0; i < this.sprite.pixels.length >> 2; i++)
        {
            let x:number = i % this.sprite.width;
            let y:number = Math.floor(i/ this.sprite.width);
            const x_old:number = x;
            x = Math.floor(-y );
            y = Math.floor(x_old);
            newSprite.fillRect(new RGB(this.sprite.pixels[i << 2], this.sprite.pixels[(i << 2)+1], this.sprite.pixels[(i << 2)+2], this.sprite.pixels[(i << 2)+3]), 
                x, y, 1, 1);
        }
        this.sprite = newSprite;
        const temp:number = this.offscreenCanvas.width;
        this.offscreenCanvas.width = this.offscreenCanvas.height;
        this.offscreenCanvas.height = temp;
        this.refreshImageFromBuffer();
    }
    loadSprite(sprite:Sprite): void {
        this.sprite.copySprite(sprite);
        this.offscreenCanvas.width = sprite.width;
        this.offscreenCanvas.height = sprite.height;
        this.offscreenCtx = this.offscreenCanvas.getContext("2d")!;
        this.refreshImageFromBuffer();
    }
    //copies array of rgb values to canvas offscreen, centered within the canvas
    refreshImageFromBuffer():void
    {
        this.sprite.refreshImage();
        this.repaint = true;
    }

    draw(ctx:CanvasRenderingContext2D = this.ctx, x:number = 0, y:number = 0)
    {
        if(this.repaint)
        {
            this.repaint = false;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.offscreenCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.offscreenCtx.drawImage(this.sprite.image, 0, 0);
            if(this.offscreenCanvas.width / this.offscreenCanvas.height <= 1)
            {
                const width:number = this.canvas.width * this.offscreenCanvas.width / this.offscreenCanvas.height;
                const height:number = this.canvas.height;
                const x:number = this.canvas.width / 2 - width / 2;
                const y:number =  this.canvas.height / 2 - height / 2;
                this.ctx.drawImage(this.offscreenCanvas, x, y, width, height);
            }
            else
            {
                const width:number = this.canvas.width;
                const height:number =  this.canvas.height * this.offscreenCanvas.height / this.offscreenCanvas.width;
                const x:number = this.canvas.width / 2 - width / 2;
                const y:number =  this.canvas.height / 2 - height / 2;
                this.ctx.drawImage(this.offscreenCanvas, x, y, width, height);
            }
        }
        ctx.drawImage(this.canvas, x, y);
    }
};
class CopyPasteTool extends ExtendedTool {
    handle_touch_events(type: string, event: any, touchPos: number[], gx: number, gy: number, deltaX: number, deltaY: number, field: LayeredDrawingScreen, toolBar: ToolSelector): void {
    }
    blendAlpha:GuiCheckBox;
    buttonCopySelection:GuiButton;
    constructor(name:string, path:string[], optionPanes:SimpleGridLayoutManager[], clipBoard:ClipBoard, updateBlendAlpha: () => void, toolSelector:ToolSelector) {
        super(name, path, optionPanes, [200, clipBoard.height()+ 200]);
        this.blendAlpha = new GuiCheckBox(updateBlendAlpha, 40, 40);
        this.buttonCopySelection = new GuiButton(() => {
            
            const clipBoardSprite:Sprite = toolSelector.field.layer().maskToSprite();
            toolSelector.field.layer().clipBoard.loadSprite(clipBoardSprite); 
            toolSelector.field.layer().repaint = true;
            }, "Copy from selection", 190, 40, 16);
        this.blendAlpha.checked = true;
        this.blendAlpha.refresh();
        this.localLayout.addElement(horizontal_group([ new GuiLabel("Clipboard:", 200, 16), clipBoard ]));
        this.localLayout.addElement(horizontal_group([ new GuiLabel("Preserve\ntransparency:", 150, 16), this.blendAlpha ]));
        this.localLayout.addElement(new GuiSpacer([75, 40]));
        this.localLayout.addElement(this.buttonCopySelection);

    }
};
class GuiCheckList implements GuiElement {
    limit:number;
    list:GuiListItem[];
    dragItem:GuiListItem | null;
    dragItemLocation:number[];
    dragItemInitialIndex:number;
    layoutManager:SimpleGridLayoutManager;
    fontSize:number;
    focused:boolean;
    uniqueSelection:boolean;
    swapElementsInParallelArray:((x1:number, x2:number) => void) | null;
    slideMoved:((event:SlideEvent) => void) | null;
    constructor(matrixDim:number[], pixelDim:number[], fontSize:number, uniqueSelection:boolean, swap:((x1:number, x2:number) => void) | null = null, slideMoved:((event:SlideEvent) => void) | null = null)
    {
        this.focused = true;
        this.uniqueSelection = uniqueSelection;
        this.fontSize = fontSize;
        this.layoutManager = new SimpleGridLayoutManager ([1,matrixDim[1]], pixelDim);
        this.list = [];
        this.limit = 0;
        this.dragItem = null;
        this.dragItemLocation = [-1, -1];
        this.dragItemInitialIndex = -1;
        this.slideMoved = slideMoved;
        this.swapElementsInParallelArray = swap;
    }
    parent: GuiElement | undefined;
    push(text:string, state:boolean = true, checkBoxCallback:(event:any) => void, onClickGeneral:(event:any) => void): void
    {
        const newElement:GuiListItem = new GuiListItem(text, state, [this.width(),
            this.height() / this.layoutManager.matrixDim[1] - 5], this.fontSize, checkBoxCallback, onClickGeneral, this.slideMoved);
        this.list.push(newElement);
    }
    selected():number
    {
        return this.layoutManager.lastTouched;
    }
    selectedItem():GuiListItem | null
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
    get(index:number):GuiListItem | null
    {
        if(this.list[index])
            return this.list[index];
        else
            return null;
    }
    isChecked(index:number):boolean
    {
        return this.list[index] ? this.list[index].checkBox.checked : false;
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
    draw(ctx:CanvasRenderingContext2D, x:number, y:number, offsetX:number, offsetY:number): void
    {
        //this.layoutManager.draw(ctx, x, y, offsetX, offsetY);
        const itemsPositions:RowRecord[] = this.layoutManager.elementsPositions;
        let offsetI:number = 0;
        for(let i = 0; i < itemsPositions.length; i++)
        {
            if(this.dragItem && this.dragItemLocation[1] !== -1 && i === Math.floor((this.dragItemLocation[1] / this.height()) * this.layoutManager.matrixDim[1]))
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
        let checkedIndex:number = -1;
        if(this.uniqueSelection)
        {
            for(let i = 0; i < this.list.length; i++) {
                if(this.list[i].checkBox.checked)
                {
                    checkedIndex = i;
                }
            };
            this.layoutManager.handleTouchEvents(type, e);
            for(let i = 0; i < this.list.length; i++)
            {
                if(this.list[i].checkBox.checked && i !== checkedIndex)
                {
                    this.list[checkedIndex].checkBox.checked = false;
                    this.list[checkedIndex].checkBox.refresh();
                    break;
                }     
            }
        }
        else {
            this.layoutManager.handleTouchEvents(type, e);
        }
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
            if(this.selectedItem() && this.selectedItem()!.callBack)
                this.selectedItem()!.callBack!(e);
            break;
            case("touchmove"):
            const movesNeeded:number = isTouchSupported()?7:2;
            if(this.selectedItem() && e.touchPos[0] < this.selectedItem()!.sliderX)
            {
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
class LayerManagerTool extends Tool {
    handle_touch_events(type: string, event: any, touchPos: number[], gx: number, gy: number, deltaX: number, deltaY: number, field: LayeredDrawingScreen, toolBar: ToolSelector): void {}
    list:GuiCheckList;
    layoutManager:SimpleGridLayoutManager;
    field:LayeredDrawingScreen;
    buttonAddLayer:GuiButton;
    runningId:number;
    layersLimit:number;
    constructor(name:string, path:string[], field:LayeredDrawingScreen, limit:number = 16)
    {
        super(name, path);
        this.field = field;
        this.layersLimit = isTouchSupported()?limit - Math.floor(limit / 4) : limit;
        this.layoutManager = new SimpleGridLayoutManager([2, 24], [200, 640]);
        this.list = new GuiCheckList([1, this.layersLimit], [200, 520], 20, false, (x1, x2) => {
            if(this.field.layers[x1] && this.field.layers[x2])
            {
                this.field.swapLayers(x1, x2);
            }
        },
        (event:SlideEvent) => {
            const index:number = this.list.list.findIndex(element => element.slider === event.element);
            if(field.layers[index])
            {
                field.layers[index].drawWithAlpha = event.value;
                field.layers[index].repaint = true;
            }
        });
        this.buttonAddLayer = new GuiButton(() => { this.pushList(`l${this.runningId++}`); }, "Add Layer", 99, 40, 16);
        this.layoutManager.addElement(vertical_group([ new GuiLabel("Layers list:", 200), this.list ]));
        this.layoutManager.addElement(horizontal_group([ this.buttonAddLayer, new GuiButton(() => this.deleteItem(), "Delete", 99, 40, 16) ]));
        for(let i = 0; i < field.layers.length; i++)
        {
            this.pushList(`l${i}`);
        }
        this.runningId = field.layers.length;
        this.list.refresh();
    }
    deleteItem(index:number = this.field.selected):void
    {
        if(this.field.layers.length > 1 && this.field.layers[index]){
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
                    if(this.list.selectedItem() && this.list.selectedItem()!.checkBox.checked)
                        this.list.selectedItem()!.textBox.activate();

                });
                this.list.refresh();
        }
    }
    activateOptionPanel():void { this.layoutManager.activate(); }
    deactivateOptionPanel():void { this.layoutManager.deactivate(); }
    getOptionPanel():SimpleGridLayoutManager | null {
        return this.layoutManager;
    }
    optionPanelSize():number[]
    {
        return [this.layoutManager.width(), this.layoutManager.height()];
    }
    drawOptionPanel(ctx:CanvasRenderingContext2D, x:number, y:number):void
    {
        const optionPanel:SimpleGridLayoutManager = this.getOptionPanel()!;
        optionPanel.x = x;
        optionPanel.y = y;
        optionPanel.draw(ctx, x, y);
    }
};
class ScreenTransformationTool extends ExtendedTool {
    handle_touch_events(type: string, event: any, touchPos: number[], gx: number, gy: number, deltaX: number, deltaY: number, field: LayeredDrawingScreen, toolBar: ToolSelector): void {}
    textBoxZoom:GuiSlider;
    buttonZoomToScreen:GuiButton;
    buttonFlipHorizonally:GuiButton;
    buttonFlipVertically:GuiButton;
    field:LayeredDrawingScreen;
    maxZoom:number;
    setZoom(zoom:number): void
    {
        const bias = 0.1;
        let ratio:number = 1;
        ratio = zoom / this.field.zoom.zoomX;
        this.field.zoom.zoomX = zoom;
        this.field.zoom.zoomY = this.field.zoom.zoomY * ratio;
        this.textBoxZoom.setState(zoom / this.maxZoom);
    }
    constructor(toolName:string, toolImagePath:string[], optionPanes:SimpleGridLayoutManager[], field:LayeredDrawingScreen)
    {
        super(toolName, toolImagePath, optionPanes, [200, 115]);
        this.field = field;
        this.maxZoom = 60;
        this.getOptionPanel()!.pixelDim[1] += 50;
        const updateZoom = () => {
            const bias = 0.1;
            let ratio:number = 1;
            ratio = (this.textBoxZoom.state * this.maxZoom + bias) / field.zoom.zoomX;
            field.zoom.zoomX = this.textBoxZoom.state * this.maxZoom + bias;
            field.zoom.zoomY = field.zoom.zoomY * ratio;
        };
        this.buttonZoomToScreen = new GuiButton(() => {
            field.zoomToScreen();
            this.setZoom(field.zoom.zoomX);
        }, "Auto", 60, 35, 16);
        this.textBoxZoom = new GuiSlider(25 / 50, [130, 30], updateZoom);
        //this.textBoxZoom.setText(field.zoom.zoomX.toString());

        this.buttonFlipHorizonally = new GuiButton(() => {
            field.layer().flipHorizontally();
        }, "Flip Around Y Axis", 150, 40, 16);
        this.buttonFlipVertically = new GuiButton(() => {
            field.layer().flipVertically();
        }, "Flip Around X Axis", 150, 40, 16);
        this.localLayout.addElement(new GuiLabel("Screen view:", 150, 16));
        this.localLayout.addElement(horizontal_group([ new GuiLabel("Zoom:", 70), this.textBoxZoom ]));
        this.localLayout.addElement(horizontal_group([ this.buttonZoomToScreen, new GuiButton(() => {field.zoom.offsetX = 0;field.zoom.offsetY = 0;}, "Center", 90, 35, 16) ]));
        this.getOptionPanel()!.addElement(this.buttonFlipHorizonally);
        this.getOptionPanel()!.addElement(this.buttonFlipVertically);
    }
};
class FilesManagerTool extends ExtendedTool {
    handle_touch_events(type: string, event: any, touchPos: number[], gx: number, gy: number, deltaX: number, deltaY: number, field: LayeredDrawingScreen, toolBar: ToolSelector): void {}
    pngName:GuiTextBox;
    savePng:GuiButton;
    gifName:GuiTextBox;
    saveGif:GuiButton;
    projectName:GuiTextBox;
    saveProject:GuiButton;
    tbXPartitions:GuiTextBox;
    tbYPartitions:GuiTextBox;
    saveSprites:GuiButton;
    loadImage:GuiButton;
    loadProject:GuiButton;

    constructor(name:string, path:string[], optionPanes:SimpleGridLayoutManager[], field:LayeredDrawingScreen)
    {
        super(name, path, optionPanes,[200, 600]);
        this.savePng = new GuiButton(() => {field.saveToFile(this.pngName.text)}, "Save PNG", 85, 35, 16);
        this.pngName = new GuiTextBox(true, 200, this.savePng, 16, 35, GuiTextBox.bottom, (event) => {
            if(event.textbox.text.substring(event.textbox.text.length - 4, event.textbox.text.length) !== ".png")
            {
                return false;
            }
            return true;
        });
        this.saveGif = new GuiButton(() => {
            field.toolSelector.animationsGroupsSelector.selectedAnimation()!.toGifBlob(blob => {
            saveBlob(blob, this.gifName.text);
        });
        }, "Save Gif", 85, 35, 16);
        this.gifName = new GuiTextBox(true, 200, this.saveGif, 16, 35, GuiTextBox.bottom, (event) => {
            if(event.textbox.text.substring(event.textbox.text.length - 4, event.textbox.text.length) !== ".gif")
            {
                return false;
            }
            return true;
        });
        this.saveProject = new GuiButton(() => {
            field.toolSelector.animationsGroupsSelector.saveAs(this.projectName.text);
        }, "Save Project", 125, 35, 16);
        this.projectName = new GuiTextBox(true, 200, this.saveProject, 16, 35, GuiTextBox.bottom, (event) => {
            if(event.textbox.text.substring(event.textbox.text.length - 5, event.textbox.text.length) !== ".proj")
            {
                return false;
            }
            return true;
        });

        this.saveSprites = new GuiButton(() => {
            const columns:number | null = this.tbXPartitions.asNumber.get();
            const rows:number | null = this.tbYPartitions.asNumber.get();
            if(columns && rows)
            {
                const width:number = Math.floor(field.layer().bounds.first / columns);
                const height:number = Math.floor(field.layer().bounds.second / rows);
                const animation:SpriteAnimation = new SpriteAnimation(0, 0, width, height);
                if(field.toolSelector.animationsGroupsSelector.animationGroup())
                    field.toolSelector.animationsGroupsSelector.animationGroup()!.pushAnimation(animation);
                if(animation)
                {
                    for(let y = 0; y < rows; y++)
                    {
                        for(let x = 0; x < columns; x++)
                        {
                            animation.sprites.push(field.selectionToSprite(x * width, y * height, width, height));
                        }
                    }
                }
            }
        }, "Save Grid", 125, 35, 16);
        this.tbXPartitions = new GuiTextBox(true, 80, this.saveSprites, 16, 35, GuiTextBox.bottom, (event) => {
            if(!event.textbox.asNumber.get())
            {
                return false;
            }
            return true;
        });;
        this.tbYPartitions = new GuiTextBox(true, 80, this.saveSprites, 16, 35, GuiTextBox.bottom, (event) => {
            if(!event.textbox.asNumber.get())
            {
                return false;
            }
            return true;
        });

        this.loadImage = new GuiButton(() => {
            const input:HTMLInputElement = document.createElement('input');
            input.type="file";
            input.addEventListener('change', (event) => {
                const fileList:FileList = (<FilesHaver> <Object> event.target).files;
                const reader = new FileReader();
                reader.readAsDataURL(fileList[0]);
                reader.onload = (() =>
                  {
                      const img = new Image();
                      img.onload = () => {
                          field.toolSelector.layersTool.pushList(`l${field.toolSelector.layersTool.runningId++}`)
                          field.loadImageToLayer(img);
                          field.setDimOnCurrent([img.width, img.height]);
                      };
                      img.src = <string> reader.result;
                  });
              });
            input.click();
        }, "Load Image", 125, 35, 16);

        this.loadProject = new GuiButton(() => {
            const input:HTMLInputElement = document.createElement('input');
            input.type="file";
            input.addEventListener('change', (event) => {
                const fileList:FileList = (<FilesHaver> <Object> event.target).files;
                const reader = new FileReader();
                fileList[0].arrayBuffer().then((buffer) =>
                  {
                      const binary:Int32Array = new Int32Array(buffer);
                      field.toolSelector.animationsGroupsSelector.buildFromBinary(binary);
                  });
              });
            input.click();
        }, "Load Project", 125, 35, 16);
        this.gifName.setText("myFirst.gif");
        this.pngName.setText("myFirst.png");
        this.projectName.setText("myFirst.proj");
        this.localLayout.addElement(new GuiLabel("Save Screen as:", 200, 16));
        this.localLayout.addElement(vertical_group([ this.pngName, this.savePng ]));
        this.localLayout.addElement(new GuiSpacer([150, 20]));
        this.localLayout.addElement(new GuiLabel("Save selected\nanimation as gif:", 200, 16));
        this.localLayout.addElement(vertical_group([ this.gifName, this.saveGif ]));
        this.localLayout.addElement(new GuiSpacer([150, 10]));
        this.localLayout.addElement(new GuiLabel("Save project to a file:", 200, 16));
        this.localLayout.addElement(vertical_group([ this.projectName, this.saveProject ]));
        this.localLayout.addElement(new GuiSpacer([150, 20]));
        this.localLayout.addElement(new GuiLabel("Save screen as grid\nto sprites:", 200, 16));
        this.localLayout.addElement(horizontal_group([ this.tbXPartitions, this.tbYPartitions ]));
        this.localLayout.addElement(this.saveSprites);
        this.localLayout.addElement(new GuiSpacer([200, 20]));
        this.localLayout.addElement(vertical_group([ this.loadImage, this.loadProject ]));
    }
};
class SelectionTool extends ExtendedTool {
    handle_touch_events(type: string, event: any, touchPos: number[], gx: number, gy: number, deltaX: number, deltaY: number, field: LayeredDrawingScreen, toolBar: ToolSelector): void {
        switch(type)
        {
            case("touchstart"):
            if(this.checkboxComplexPolygon.checked){
                toolBar.polygon.push([gx, gy]);
                break;
            }
            field.state.selectionSelectionRect = [touchPos[0], touchPos[1],0,0];
            break;
            case("touchmove"):
            if(this.checkboxComplexPolygon.checked){
                if(event.moveCount % 10 === 0)
                    toolBar.polygon.push([gx, gy]);
                break;
            }

            field.state.selectionSelectionRect[2] += (deltaX);
            field.state.selectionSelectionRect[3] += (deltaY);
            break;
            case("touchend"):
            if(this.checkboxComplexPolygon.checked && toolBar.polygon.length > 2)
            {
                field.scheduleUpdateMaskPolygon(toolBar.polygon);
            }
            else
            {
                if(field.state.selectionSelectionRect[2] > 0 && field.state.selectionSelectionRect[3] > 0)
                    field.updateBitMaskRectangle(field.state.selectionSelectionRect);
                else
                    field.clearBitMask();
            }
            break;
        }
    }
    toolSelector:ToolSelector;
    checkboxComplexPolygon:GuiCheckBox;
    constructor(name:string, path:string[], optionPanes:SimpleGridLayoutManager[], toolSelector:ToolSelector){
        super(name, path, optionPanes, [200, 210]);
        this.checkboxComplexPolygon = new GuiCheckBox(() => { toolSelector.polygon = []; toolSelector.field.state.selectionSelectionRect = [0,0,0,0];toolSelector.field.clearBitMask();toolSelector.field.layer().repaint = true;}, 
            40, 40, true);
        this.toolSelector = toolSelector;
        this.localLayout.addElement(new GuiLabel("Polygonal selector:", 200, 16));
        this.localLayout.addElement(this.checkboxComplexPolygon);
        this.localLayout.addElement(new GuiSpacer([200,10]));
        this.localLayout.addElement(new GuiButton(() => {toolSelector.polygon = [], toolSelector.field.state.selectionSelectionRect = [0,0,0,0]; toolSelector.field.clearBitMask(); toolSelector.field.layer().repaint = true}, 
            "Reset Selection", 150, 40, 16));
            this.localLayout.addElement(new GuiSpacer([200,3]));
        this.localLayout.addElement(new GuiButton(() => {toolSelector.polygon.pop(), toolSelector.field.state.selectionSelectionRect = [0,0,0,0]; toolSelector.field.scheduleUpdateMaskPolygon(toolSelector.polygon); toolSelector.field.layer().repaint = true}, 
        "Undo last point", 150, 40, 16));
    }
}; 
//megadrive mode adds 6 colors to palette, restricts color selection to 8 red 8 green 8 blue, and 1 transparent color
class ToolSelector {// clean up class code remove fields made redundant by GuiToolBar
    toolBar:GuiToolBar;
    animationsGroupsSelector:AnimationGroupsSelector;
    previewScreen:DrawingScreen;
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    externalCanvas:HTMLCanvasElement;
    touchListener:SingleTouchListener;
    drawingScreenListener:SingleTouchListener;
    keyboardHandler:KeyboardHandler;
    toolPixelDim:number[];
    penTool:SprayCanTool;
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
    outLineTool:OutlineTool;
    filesManagerTool:FilesManagerTool;
    selectionTool:SelectionTool;
    polygon:number[][];

    constructor(pallette:Pallette, keyboardHandler:KeyboardHandler, drawingScreenListener:SingleTouchListener, imgWidth:number = 64, imgHeight:number = 64)
    {
        this.lastDrawTime = Date.now();
        this.polygon = [];
        this.animationsGroupsSelector = <any> null;
        const field:LayeredDrawingScreen = new LayeredDrawingScreen(keyboardHandler, pallette);
        field.toolSelector = this;
        field.addBlankLayer();
        this.field = field;
        this.previewScreen = new DrawingScreen(document.createElement("canvas"), field.keyboardHandler, pallette, [0,0], [128, 128], this, field.state, field.clipBoard);
        this.toolBar = new GuiToolBar([64, 64], []);
        this.toolBar.activate();
        this.toolBar.toolRenderDim[1] = imgHeight;
        this.toolBar.toolRenderDim[0] = imgWidth;
        this.sprayPaint = false;
        this.repaint = true;
        this.toolBar.refresh();
        this.toolPixelDim = [imgWidth,imgHeight*10];
        this.canvas = document.createElement("canvas");
        this.externalCanvas = <HTMLCanvasElement> document.getElementById("tool_selector_screen");
        this.keyboardHandler = keyboardHandler;
        this.keyboardHandler.registerCallBack("keydown", (e:any) => true, event => {
            if(event.code == "Space")
                event.preventDefault();
            if(this.keyboardHandler.keysHeld["ControlLeft"] || this.keyboardHandler.keysHeld["ControlRight"] ||
                this.keyboardHandler.keysHeld["MetaLeft"] || this.keyboardHandler.keysHeld["MetaRight"]){
                switch(event.code) {
                case('KeyC'):
                if(this.keyboardHandler.keysHeld["KeyC"] === 1) {
                    field.state.selectionRect = [0,0,0,0];
                    field.state.pasteRect = [0,0,0,0];
                }
                break;
                case('KeyV'):
                field.layer().paste();
                break;
                case('KeyZ'):
                if(this.keyboardHandler.keysHeld["ShiftLeft"] || this.keyboardHandler.keysHeld["ShiftRight"])
                {
                    field.layer().redoLast(field.state.slow).then(() =>
                    field.layer().updateLabelUndoRedoCount());
                    break;
                }
                field.layer().undoLast(field.state.slow).then(() =>
                field.layer().updateLabelUndoRedoCount());
                break;
                case('KeyY'):
                field.layer().redoLast(field.state.slow).then(() =>
                field.layer().updateLabelUndoRedoCount());
                break;
                case('KeyD'):
                field.clearBitMask();
                this.polygon = [];
                break;
                case("Space"):
                event.preventDefault();
                }
            }
        });
        this.keyboardHandler.registerCallBack("keydown", (e:any) => <boolean> <any> this.tool()!.getOptionPanel(), (e:any) => {this.tool()!.getOptionPanel()!.handleKeyBoardEvents("keydown", e); this.repaint = true;});
        this.keyboardHandler.registerCallBack("keyup", (e:any) =>   <boolean> <any> this.tool()!.getOptionPanel(), (e:any) => {this.tool()!.getOptionPanel()!.handleKeyBoardEvents("keyup", e); this.repaint = true;});
        this.keyboardHandler.registerCallBack("keydown", (e:any) => (e.code === "ArrowUp" || e.code === "ArrowDown" || e.code === "ArrowLeft" || e.code === "ArrowRight"),
            (e:any) => {
                const imgPerColumn:number = (this.canvas.height / this.toolBar.toolRenderDim[1]);
                if((this.keyboardHandler.keysHeld["AltLeft"] || this.keyboardHandler.keysHeld["AltRight"]) && (document.activeElement!.id === "body" || field.layer().canvas === document.activeElement! || this.canvas === document.activeElement!))
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
                        this.tool()!.deactivateOptionPanel();
                        this.toolBar.selected = newToolIndex;
                        this.tool()!.activateOptionPanel();
                    }
                }  
                this.repaint = true;
            });
        this.touchListener = new SingleTouchListener(this.externalCanvas, true, true);  
        this.touchListener.registerCallBack("touchstart", (e:any) => <boolean> <any> this.tool()!.getOptionPanel(),  (e:any) => {
            this.transformEvent(e);
            e.translateEvent(e, this.tool()!.getOptionPanel()!.x , this.tool()!.getOptionPanel()!.y);
            
            this.tool()!.getOptionPanel()!.handleTouchEvents("touchstart", e); 
            (<any>document.activeElement).blur();
            const previousTool:number = this.selected();
            const imgPerColumn:number = (this.canvas.height / this.toolBar.toolRenderDim[1]);
            const y:number = Math.floor(e.touchPos[1] / this.toolBar.toolRenderDim[1]);
            const x:number = Math.floor(e.touchPos[0] / this.toolBar.toolRenderDim[0]);
            const clicked:number = y + x * imgPerColumn;
            if(clicked >= 0 && clicked < this.toolBar.tools.length)
            {
                if(this.tool())
                    this.tool()!.deactivateOptionPanel();
                this.toolBar.handleTouchEvents("touchstart", e);
                
            }
            if(this.selectedToolName() === "undo")
            {
                field.layer().undoLast(field.state.slow).then(() =>
                this.undoTool.updateLabel(field.layer().undoneUpdatesStack.length(), field.layer().updatesStack.length()));
                this.toolBar.selected = previousTool;
            }
            else if(this.selectedToolName() === "redo")
            {
                field.layer().redoLast(field.state.slow).then(() =>
                this.undoTool.updateLabel(field.layer().undoneUpdatesStack.length(), field.layer().updatesStack.length()));
                this.toolBar.selected = previousTool;
            }
            if(this.tool()){
                this.tool()!.activateOptionPanel();
            }
            this.invScaleEvent(e);
            this.repaint = true;
        });
        this.touchListener.registerCallBack("touchmove", (e:any) => <boolean> <any> this.tool()!.getOptionPanel(),  (e:any) => {
            this.transformEvent(e);
            e.translateEvent(e, this.tool()!.getOptionPanel()!.x , this.tool()!.getOptionPanel()!.y);
            this.tool()!.getOptionPanel()!.handleTouchEvents("touchmove", e); 
            this.repaint = true;
        }); 
        this.touchListener.registerCallBack("hover", (event:any) => true, (event:any) => {
            this.transformEvent(event);
            event.translateEvent(event, this.tool()!.getOptionPanel()!.x , this.tool()!.getOptionPanel()!.y);
            this.tool()!.getOptionPanel()!.handleTouchEvents("hover", event); 
            this.repaint = true;
        });
        this.touchListener.registerCallBack("doubletap", (event:any) => true, (event:any) => {
            this.transformEvent(event);
            event.translateEvent(event, this.tool()!.getOptionPanel()!.x , this.tool()!.getOptionPanel()!.y);
            this.tool()!.getOptionPanel()!.handleTouchEvents("doubletap", event); 
            this.repaint = true;
        });
        this.touchListener.registerCallBack("longtap", (event:any) => true, (event:any) => {
            this.transformEvent(event);
            event.translateEvent(event, this.tool()!.getOptionPanel()!.x , this.tool()!.getOptionPanel()!.y);
            this.tool()!.getOptionPanel()!.handleTouchEvents("longtap", event); 
            this.repaint = true;
        });
        this.touchListener.registerCallBack("tap", (event:any) => true, (event:any) => {
            this.transformEvent(event);
            event.translateEvent(event, this.tool()!.getOptionPanel()!.x , this.tool()!.getOptionPanel()!.y);
            this.tool()!.getOptionPanel()!.handleTouchEvents("tap", event); 
            this.repaint = true;
        });
        this.touchListener.registerCallBack("touchend", (e:any) => <boolean> <any> this.tool()!.getOptionPanel(),  (e:any) => {
            this.transformEvent(e);
            e.translateEvent(e, this.tool()!.getOptionPanel()!.x , this.tool()!.getOptionPanel()!.y);
            this.tool()!.getOptionPanel()!.handleTouchEvents("touchend", e); 
            this.repaint = true;  
        });
        {
            //field.layer() listeners
        const colorBackup:RGB = new RGB(0,0,0,0);
        this.drawingScreenListener = drawingScreenListener;
        this.drawingScreenListener.registerCallBack("touchstart", 
            (e:any) => this.layersTool.list.selectedItem()! && this.layersTool.list.selectedItem()!.checkBox.checked, 
            (e:any) => {
                if(!e.button) 
                {
                    field.layer().state.color = pallette.selectedPixelColor; 
                    field.layer().toolSelector.colorPickerTool._setColorText(); 
                }
                else
                {
                    field.layer().state.color = (pallette.selectedBackColor); 
                    field.layer().toolSelector.colorPickerTool._setColorText(); 
                }
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
                field.state.pasteRect = [0,0,0,0];
            }
            else
            {
                field.state.pasteRect = [touchPos[0] , touchPos[1], field.layer().clipBoard.sprite.width * (field.layer().bounds.first / field.layer().dimensions.first),field.layer().clipBoard.sprite.width * (field.layer().bounds.second / field.layer().dimensions.second)];
            }
            if(keyboardHandler.keysHeld["AltLeft"] || keyboardHandler.keysHeld["AltRight"])
            {
                field.state.color.copy(field.layer().screenBuffer[gx + gy*field.layer().dimensions.first]);
                field.layer().toolSelector.updateColorPickerTextBox();
            }
            else if(!keyboardHandler.keysHeld["Space"])
            {
            switch (field.layer().toolSelector.selectedToolName())
            {
                case("spraycan"):
                this.field.layer().state.lineWidth = this.penTool.tbSize.asNumber.get()?this.penTool.tbSize.asNumber.get()!:this.field.layer().state.lineWidth;
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
                case("oval"):
                case("rect"):
                case("copy"):
                case("line"):
                field.state.selectionRect = [touchPos[0], touchPos[1],0,0];
                field.layer().setLineWidthPen();
                break;
                case("paste"):                
                field.state.pasteRect = [touchPos[0] - field.state.pasteRect[2]/2, touchPos[1] - field.state.pasteRect[3]/2,field.state.pasteRect[2],field.state.pasteRect[3]];
                break;
            }
                if(this.tool() && this.tool()!.handle_touch_events)
                    this.tool()?.handle_touch_events("touchstart", e, touchPos, gx, gy, 0, 0, field, this);
            }
        });

        this.drawingScreenListener.registerCallBack("touchmove",
            (e:any) => this.layersTool.list.selectedItem()! && this.layersTool.list.selectedItem()!.checkBox.checked,
            (e:any) => {
            const deltaX:number = this.field.zoom.invJustZoomX(e.deltaX);
            const deltaY:number = this.field.zoom.invJustZoomY(e.deltaY);
            const touchPos:number[] = [this.field.zoom.invZoomX(e.touchPos[0]),this.field.zoom.invZoomY(e.touchPos[1])];
            const x1:number = touchPos[0] - deltaX;
            const y1:number = touchPos[1] - deltaY;
            const gx:number = Math.floor((touchPos[0])/field.layer().bounds.first*field.layer().dimensions.first);
            const gy:number = Math.floor((touchPos[1])/field.layer().bounds.second*field.layer().dimensions.second);
            let repaint:boolean = true;

            if(keyboardHandler.keysHeld["Space"])
            {

                field.zoom.offsetX -= e.deltaX;
                field.zoom.offsetY -= e.deltaY;
                repaint = false;
            }
            else if(keyboardHandler.keysHeld["AltLeft"] || keyboardHandler.keysHeld["AltRight"])
            {
                field.state.color.copy(field.layer().screenBuffer[gx + gy*field.layer().dimensions.first]);
                field.layer().toolSelector.updateColorPickerTextBox();
                repaint = false;
            }
            else
            {
            switch (field.toolSelector.selectedToolName())
            {
                case("settings"):
                case("save"):
                case("layers"):
                case("move"):
                field.zoom.offsetX -= e.deltaX;
                field.zoom.offsetY -= e.deltaY;
                repaint = false;
                break;
                case("eraser"):
                if(this.eraserTool.checkboxPixelPerfect.checked)
                {
                    field.layer().handleDraw(x1, touchPos[0], y1, touchPos[1], (x, y, screen) => screen.handleTapPixelPerfect(x, y));
                    break;
                }
                field.layer().handleDraw(x1, touchPos[0], y1, touchPos[1], (x, y, screen) => screen.handleTapSprayPaint(x, y));
                break;
                case("spraycan"):
                field.layer().handleDraw(x1, touchPos[0], y1, touchPos[1], (x, y, screen) => screen.handleTapSprayPaint(x, y));
                break;
                
                case("line"):
                case("oval"):
                case("rect"):
                field.state.selectionRect[2] += (deltaX);
                field.state.selectionRect[3] += (deltaY);
                break;
                case("copy"):
                field.state.selectionRect[2] += (deltaX);
                field.state.selectionRect[3] += (deltaY);
                field.state.pasteRect[2] = field.state.selectionRect[2];
                field.state.pasteRect[3] = field.state.selectionRect[3];
                break;
                case("paste"):
                field.state.pasteRect[0] += (deltaX);
                field.state.pasteRect[1] += (deltaY);
                break;
            }
            if(this.tool() && this.tool()!.handle_touch_events)
                this.tool()?.handle_touch_events("touchmove", e, touchPos, gx, gy, deltaX, deltaY, field, this);
    
            }
            field.layer().repaint = repaint;
            
        });

        this.drawingScreenListener.registerCallBack("touchend",
        (e:any) => this.layersTool.list.selectedItem()! && this.layersTool.list.selectedItem()!.checkBox.checked,
        (e:any) => {

            if(!this.field.layer()!.updatesStack.length())
                this.field.layer()!.updatesStack.push([]);
            const deltaX:number = this.field.zoom.invJustZoomX(e.deltaX);
            const deltaY:number = this.field.zoom.invJustZoomY(e.deltaY);
            const touchPos:number[] = [this.field.zoom.invZoomX(e.touchPos[0]),this.field.zoom.invZoomY(e.touchPos[1])];
            
            const gx:number = Math.floor((touchPos[0])/field.layer().bounds.first*field.layer().dimensions.first);
            const gy:number = Math.floor((touchPos[1])/field.layer().bounds.second*field.layer().dimensions.second);
            let repaint:boolean = true;
            if(keyboardHandler.keysHeld["AltLeft"] || keyboardHandler.keysHeld["AltRight"])
            {
                field.state.color.copy(field.layer().screenBuffer[gx + gy*field.layer().dimensions.first]);
                field.layer().toolSelector.updateColorPickerTextBox();
                repaint = false;
            }
            else if(!keyboardHandler.keysHeld["Space"])
            {
            switch (this.selectedToolName())
            {
                case("eraser"):
                if(deltaX === 0 && deltaY === 0 && this.eraserTool.checkboxPixelPerfect)
                    field.layer().handleTap(touchPos[0], touchPos[1]);

                field.state.color.copy(colorBackup);
                break;
                case("copy"):
                    const clipBoardSprite:Sprite = field.layer().selectionToSprite(field.state.selectionRect);
                    field.layer().clipBoard.loadSprite(clipBoardSprite); 
                    field.layer().repaint = true;
                    field.state.selectionRect = [0,0,0,0];
                break;
                case("paste"):
                    field.layer().paste();
                break;
            }

            if(this.tool())
                this.tool()?.handle_touch_events("touchend", e, touchPos, gx, gy, deltaX, deltaY, field, this);
    
            }
            if(this.penTool.checkboxPixelPerfect.checked || this.eraserTool.checkboxPixelPerfect.checked)
            {
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
        
        this.selectionTool = new SelectionTool("selection", ["images/ThePixelSlime1Icons/selectionSprite.png","images/selectionSprite.png"], [this.transformTool.localLayout, this.undoTool.localLayout], this);
        this.outLineTool = new OutlineTool("outline", ["images/ThePixelSlime1Icons/outlineSprite.png", "images/outlineSprite.png"], this, [this.colorPickerTool.localLayout, this.transformTool.localLayout, this.undoTool.localLayout]);
        this.rotateTool = new RotateTool("rotate", ["images/ThePixelSlime1Icons/rotateSprite.png", "images/rotateSprite.png"], () => field.state.rotateOnlyOneColor = this.rotateTool.checkBox.checked, 
            () => field.state.antiAliasRotation = this.rotateTool.checkBoxAntiAlias.checked, [this.transformTool.localLayout, this.undoTool.localLayout], this);
        this.dragTool = new DragTool("drag", ["images/ThePixelSlime1Icons/dragSprite.png", "images/dragSprite.png"], () => field.state.dragOnlyOneColor = this.dragTool.checkBox.checked,
        () => field.state.blendAlphaOnPutSelectedPixels = this.dragTool.checkBoxBlendAlpha.checked, [this.transformTool.localLayout, this.undoTool.localLayout], this);
        this.settingsTool = new DrawingScreenSettingsTool([524, 524], field, "settings",["images/ThePixelSlime1Icons/settingsSprite.png", "images/settingsSprite.png"], [ this.transformTool.localLayout ]);
        this.copyTool = new CopyPasteTool("copy", ["images/ThePixelSlime1Icons/copySprite.png", "images/copySprite.png"], [this.transformTool.localLayout], field.layer().clipBoard, () => field.state.blendAlphaOnPaste = this.copyTool.blendAlpha.checked, this);
        PenTool.checkDrawCircular.checked = true;
        PenTool.checkDrawCircular.refresh();
        const sprayCallBack:(tb:GuiSlider) => void = (tbprob)=> {
            const state:number = tbprob.state === 1? 1 : tbprob.state / 10;
            this.field.layer().state.sprayProbability = state;
            this.field.layer().state.lineWidth = this.penTool.tbSize.asNumber.get()?this.penTool.tbSize.asNumber.get()!:this.field.layer().state.lineWidth;
        };
        //this.sprayCanTool = new SprayCanTool(field.layer().suggestedLineWidth(), "spraycan", "images/spraycanSprite.png", sprayCallBack, [this.colorPickerTool.localLayout, this.transformTool.localLayout, this.undoTool.localLayout]);
        this.penTool = new SprayCanTool(field.layer().suggestedLineWidth(), "pen",["images/ThePixelSlime1Icons/penSprite.png", "images/penSprite.png"], sprayCallBack, [this.colorPickerTool.localLayout, this.transformTool.localLayout, this.undoTool.localLayout], this.field);
        this.penTool.activateOptionPanel();
        this.eraserTool = new PenTool(field.layer().suggestedLineWidth() * 3, "eraser",["images/ThePixelSlime1Icons/eraserSprite.png", "images/eraserSprite.png"], [this.transformTool.localLayout, this.undoTool.localLayout], this.field);

        PenTool.checkDrawCircular.callback = () => field.state.drawCircular = PenTool.checkDrawCircular.checked;
        this.fillTool = new FillTool("fill", ["images/ThePixelSlime1Icons/fillSprite.png", "images/fillSprite.png"], [this.transformTool.localLayout, this.colorPickerTool.localLayout, this.undoTool.localLayout],
            () => {});
        this.toolBar.tools = [];
        this.toolBar.tools.push(this.penTool);
        //this.toolBar.tools.push(this.sprayCanTool);
        this.toolBar.tools.push(this.fillTool);
        this.toolBar.tools.push(new PenViewTool(this.penTool, "line", ["images/ThePixelSlime1Icons/LineDrawSprite.png", "images/LineDrawSprite.png"], 
        (type:string, event:any, touchPos:number[], gx:number, gy:number, deltaX:number, deltaY:number, field) => {
            const x1:number = touchPos[0] - deltaX;
            const y1:number = touchPos[1] - deltaY;
            switch(type)
            {
                
                case("touchend"):
                    if(deltaX === 0 && deltaY === 0)
                    {
                        field.layer().handleTapSprayPaint(touchPos[0], touchPos[1]);
                    }
                    if(this.penTool.checkboxPixelPerfect.checked)
                        field.layer().handleDraw(x1, touchPos[0], y1, touchPos[1], (x, y, screen) => screen.handleTapPixelPerfect(x, y));
                    else
                        field.layer().handleDraw(x1, touchPos[0], y1, touchPos[1], (x, y, screen) => screen.handleTapSprayPaint(x, y));
                    field.state.selectionRect = [0,0,0,0];
                break;
            }
        }));
        this.toolBar.tools.push(new PenViewTool(this.penTool, "rect", ["images/ThePixelSlime1Icons/rectSprite.png", "images/rectSprite.png"], 
        (type:string, event:any, touchPos:number[], gx:number, gy:number, deltaX:number, deltaY:number, field) => {
            switch(type)
            {

                case("touchend"):
                if(this.penTool.checkboxPixelPerfect.checked)
                    field.layer().drawRect([field.state.selectionRect[0], field.state.selectionRect[1]], [field.state.selectionRect[0]+field.state.selectionRect[2], field.state.selectionRect[1]+ field.state.selectionRect[3]], (x, y, screen) => screen.handleTapPixelPerfect(x, y));
                else
                    field.layer().drawRect([field.state.selectionRect[0], field.state.selectionRect[1]], [field.state.selectionRect[0]+field.state.selectionRect[2], field.state.selectionRect[1]+ field.state.selectionRect[3]], (x, y, screen) => screen.handleTapSprayPaint(x, y));
                field.state.selectionRect = [0,0,0,0];
                break;
            }
        }));
        this.toolBar.tools.push(new PenViewTool(this.penTool, "oval", ["images/ThePixelSlime1Icons/ovalSprite.png", "images/ovalSprite.png"], 
        (type:string, event:any, touchPos:number[], gx:number, gy:number, deltaX:number, deltaY:number, field) => {
            switch(type)
            {

                case("touchend"):
                const start_x:number = Math.min(touchPos[0] - deltaX, touchPos[0]);
                const end_x:number = Math.max(touchPos[0] - deltaX, touchPos[0]);
                const min_y:number = Math.min(touchPos[1] - deltaY, touchPos[1]);
                const max_y:number = Math.max(touchPos[1] - deltaY, touchPos[1]);
                field.state.selectionRect = [0,0,0,0];
                if(this.penTool.checkboxPixelPerfect.checked)
                    field.layer().handleEllipse(start_x, end_x, min_y, max_y, (x, y, screen) => screen.handleTapPixelPerfect(x, y));
                else
                    field.layer().handleEllipse(start_x, end_x, min_y, max_y, (x, y, screen) => screen.handleTapSprayPaint(x, y));
                break;
            }
        }));
        this.toolBar.tools.push(this.copyTool);
        this.toolBar.tools.push(new ViewLayoutTool(this.copyTool.getOptionPanel()!, "paste", ["images/ThePixelSlime1Icons/pasteSprite.png", "images/pasteSprite.png"], 
        (type:string, event:any, touchPos:number[], gx:number, gy:number, deltaX:number, deltaY:number, field) => {
            switch(type)
            {

            }
        }));
        this.toolBar.tools.push(this.dragTool);
        this.toolBar.tools.push(new ViewLayoutTool(this.undoTool.localLayout, "redo", ["images/ThePixelSlime1Icons/redoSprite.png", "images/redoSprite.png"], (type:string, event:any, touchPos:number[], gx:number, gy:number, deltaX:number, deltaY:number, field) => {
            switch(type)
            {
                
            }
        }));
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
        this.ctx = this.canvas.getContext("2d")!;
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = "#000000";
        this.ctx.fillStyle = "#FFFFFF";
        this.repaint = true;
        this.lastDrawTime = Date.now();
        this.toolBar.refresh();
    }    
    transformEvent(e:any): void
    {
            const xScale:number = this.canvas.width / this.externalCanvas.width;
            const yScale:number = this.canvas.height / this.externalCanvas.height;
            e.touchPos[0] *= xScale;
            e.touchPos[1] *= yScale;
            e.translateEvent(e, -this.tool()!.getOptionPanel()!.x , -this.tool()!.getOptionPanel()!.y);
    }
    invScaleEvent(e:any): void
    {
        const xScale:number = 1 / this.canvas.width / this.externalCanvas.width;
        const yScale:number = 1 / this.canvas.height / this.externalCanvas.height;
        e.touchPos[0] *= xScale;
        e.touchPos[1] *= yScale;
    }
    setNormalInputValidation(): void {
        this.settingsTool.tbX.validationCallback = (event:TextBoxEvent) => {
            if(!event.textbox.asNumber.get() && event.textbox.text.length > 1)
            {
                return false;
            }
            return true;
        };
        this.settingsTool.tbY.validationCallback = (event:TextBoxEvent) => {
            if(!event.textbox.asNumber.get() && event.textbox.text.length > 1)
            {
                return false;
            }
            return true;
        };
        this.settingsTool.recalcDim = () => {
            let x:number = this.settingsTool.dim[0];
            let y:number = this.settingsTool.dim[1];
            if(this.settingsTool.tbX.asNumber.get())
                x = this.settingsTool.tbX.asNumber.get()!;
            if(this.settingsTool.tbY.asNumber.get())
                y = this.settingsTool.tbY.asNumber.get()!;
            this.settingsTool.dim = [x, y];
            this.field.setDimOnCurrent(this.settingsTool.dim);
        };
        this.colorPickerTool.tbColor.validationCallback = (e) =>
        {
            const color:RGB = new RGB(0,0,0,0);
            const code:number = color.loadString(e.textbox.text);
            if(code === 2)//overflow
            {
                e.textbox.text = (color.htmlRBGA());
            }
            else if(code === 1)//parse error
            {
                return false;
            }
            return true;
        };
    }
    setMegaDriveInputValidation(): void {
        this.settingsTool.tbX.validationCallback = (event:TextBoxEvent) => {
            if(!event.textbox.asNumber.get() && event.textbox.text.length > 1)
            {
                return false;
            }
            return true;
        };
        this.settingsTool.tbY.validationCallback = (event:TextBoxEvent) => {
            if(!event.textbox.asNumber.get() && event.textbox.text.length > 1)
            {
                return false;
            }
            return true;
        };
        this.settingsTool.recalcDim = () => {
            let x:number = this.settingsTool.dim[0];
            let y:number = this.settingsTool.dim[1];
            if(this.settingsTool.tbX.asNumber.get())
                x = this.settingsTool.tbX.asNumber.get()!;
            if(this.settingsTool.tbY.asNumber.get())
                y = this.settingsTool.tbY.asNumber.get()!;
            this.settingsTool.dim = [x, y];
            this.field.setDimOnCurrent(this.settingsTool.dim);
        };
        this.colorPickerTool.tbColor.validationCallback = (e) =>
        {
            const color:RGB = new RGB(0,0,0,0);
            const code:number = color.loadString(e.textbox.text);
            if(code === 2)//overflow
            {
                e.textbox.text = (color.htmlRBGA());
            }
            else if(code === 1)//parse error
            {
                return false;
            }
            return true;
        };
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
        if(this.tool() && this.tool()!.image() && this.toolBar.tools.length > imgPerColumn * imgPerRow){
            this.toolPixelDim[0] = this.toolBar.toolRenderDim[0] * Math.ceil(this.toolBar.tools.length / imgPerColumn);
            this.canvas.width = this.toolPixelDim[0] + this.tool()!.optionPanelSize()[0];
            this.toolPixelDim[1] = this.toolBar.toolRenderDim[1] * 10;

            this.canvas.height = this.toolPixelDim[1] > this.tool()!.height() ? this.toolPixelDim[1] : this.tool()!.height();
            this.ctx = this.canvas.getContext("2d")!;
        }
        this.resizePreviewScreen();
    }
    resizePreviewScreen(): void
    {
        if(this.previewScreen.dimensions.first !== this.field.width() || this.previewScreen.dimensions.second !== this.field.height())
        {
            this.previewScreen.clearScreenBuffer();
            this.previewScreen.setDim(this.field.dim);
        }
    }
    width():number
    {
        return this.canvas.width;
    }
    height():number
    {
        return this.canvas.height;
    }
    drawableTool(): boolean
    {
        if(this.selectedToolName())
        {
            const toolName:string = this.selectedToolName()!;
            return toolName == "line" || toolName == "pen" || toolName == "rect" || toolName == "oval";
        }
        return false;
    }
    async renderDrawingScreenPreview(): Promise<void>
    {
        this.resizePreviewScreen();
        const screen:DrawingScreen = this.previewScreen;
        const ctx = (<HTMLCanvasElement> this.drawingScreenListener.component).getContext("2d")!;
        const oLineWidth:number = ctx.lineWidth;
        let i = screen.updatesStack.length();
        while(i--)
        {
            await screen.undoLast();
        }
        screen.updatesStack.push([]);

        if(this.previewScreen.state.lineWidth === 1 || 
            (this.previewScreen.state.lineWidth <= 20 && screen.dimensions.first * screen.dimensions.second <= 128*128) ||
            (this.previewScreen.state.lineWidth <= 10 && screen.dimensions.first * screen.dimensions.second <= 256*256) ||
            (this.previewScreen.state.lineWidth <= 5 && screen.dimensions.first * screen.dimensions.second <= 1024*1024) ||  
            (screen.dimensions.first * screen.dimensions.second <= 256*256))
        {
            const oSlow:boolean = screen.state.slow;
            const oColor:number = screen.state.color.color;
            const pixelPerfect = (x:number, y:number) => screen.handleTapPixelPerfect(x, y);
            const defa = (x:number, y:number) => screen.handleTapSprayPaint(x, y);
            screen.state.slow = false;
            const touchPos:number[] = [this.field.zoom.invZoomX(this.drawingScreenListener.touchPos[0]),this.field.zoom.invZoomY(this.drawingScreenListener.touchPos[1])];
            let touchStart = [this.field.state.selectionRect[0], this.field.state.selectionRect[1]];
            
            if(this.drawingScreenListener && this.drawingScreenListener.registeredTouch && this.selectedToolName() === "line")
            {
                
                if(this.penTool.checkboxPixelPerfect.checked) {
                    screen.handleDraw(touchStart[0], touchPos[0], touchStart[1], touchPos[1], (x, y, screen) => screen.handleTapPixelPerfect(x, y));
                }
                else
                    screen.handleDraw(touchStart[0], touchPos[0], touchStart[1], touchPos[1], (x, y, screen) => screen.handleTapSprayPaint(x, y));
                
                screen.drawToContextAsSprite(ctx, this.field.zoom.zoomedX, this.field.zoom.zoomedY, this.field.width() * this.field.zoom.zoomX, this.field.height() * this.field.zoom.zoomY);
    
                screen.cleanPixelPerfectBuffer();
                screen.state.drawCacheMap.clear();
            }
            else if(this.drawingScreenListener && this.drawingScreenListener.registeredTouch && screen.state.selectionRect[3] !== 0)
            {
                const xr:number = Math.abs(screen.state.selectionRect[2]/2);
                const yr:number = Math.abs(screen.state.selectionRect[3]/2);
                if(this.selectedToolName() === "copy")
                {
                    screen.state.color = new RGB(255, 255, 255, 255);
                    screen.drawRect([screen.state.selectionRect[0]+1, screen.state.selectionRect[1]+1], [screen.state.selectionRect[0] + screen.state.selectionRect[2]-1, screen.state.selectionRect[1] + screen.state.selectionRect[3]-1], defa);
                    screen.updatesStack.push([]);
                    screen.state.color = new RGB(255, 0, 0, 255);
                    screen.drawRect([screen.state.selectionRect[0], screen.state.selectionRect[1]], [screen.state.selectionRect[0] + screen.state.selectionRect[2], screen.state.selectionRect[1] + screen.state.selectionRect[3]], defa);
                    screen.drawToContextAsSprite(ctx, this.field.zoom.zoomedX, this.field.zoom.zoomedY, this.field.width() * this.field.zoom.zoomX, this.field.height() * this.field.zoom.zoomY);
                    
                }
                else if(this.selectedToolName() !== "oval")
                {
                    screen.state.color.color = oColor;
                    
                    if(this.penTool.checkboxPixelPerfect.checked)
                        screen.drawRect([screen.state.selectionRect[0], screen.state.selectionRect[1]], [screen.state.selectionRect[0]+screen.state.selectionRect[2], screen.state.selectionRect[1]+ screen.state.selectionRect[3]], (x, y, screen) => screen.handleTapPixelPerfect(x, y));
                    else
                        screen.drawRect([screen.state.selectionRect[0], screen.state.selectionRect[1]], [screen.state.selectionRect[0]+screen.state.selectionRect[2], screen.state.selectionRect[1]+ screen.state.selectionRect[3]], (x, y, screen) => screen.handleTapSprayPaint(x, y));
                    
                    screen.drawToContextAsSprite(ctx, this.field.zoom.zoomedX, this.field.zoom.zoomedY, this.field.width() * this.field.zoom.zoomX, this.field.height() * this.field.zoom.zoomY);
        
                    screen.cleanPixelPerfectBuffer();
                    screen.state.drawCacheMap.clear();
                }
                else if(Math.abs(screen.state.selectionRect[3]) > 0)
                {
                    const start_x:number = Math.min(touchStart[0], touchPos[0]);
                    const end_x:number = Math.max(touchStart[0], touchPos[0]);
                    const min_y:number = Math.min(touchStart[1], touchPos[1]);
                    const max_y:number = Math.max(touchStart[1], touchPos[1]);
                    //screen.state.selectionRect = [0,0,0,0];
                    if(this.penTool.checkboxPixelPerfect.checked)
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
        else
        {
            
            screen.ctx.lineWidth = screen.state.lineWidth;
            const xMult:number = this.field.zoom.zoomX;
            const yMult:number = this.field.zoom.zoomY;
            if(screen.toolSelector.drawingScreenListener && screen.toolSelector.drawingScreenListener.registeredTouch && screen.toolSelector.selectedToolName() === "line")
            {
                let touchStart = [screen.state.selectionRect[0], screen.state.selectionRect[1]];
                screen.ctx.beginPath();
                screen.ctx.strokeStyle = screen.state.color.htmlRBGA();
                screen.ctx.moveTo(touchStart[0], touchStart[1]);
                screen.ctx.lineTo((screen.state.selectionRect[2] + touchStart[0]), (screen.state.selectionRect[3] + touchStart[1]));
                screen.ctx.stroke();
            }
            else if(screen.toolSelector.drawingScreenListener && screen.toolSelector.drawingScreenListener.registeredTouch && screen.state.selectionRect[3] !== 0)
            {
                const xr:number = Math.abs(screen.state.selectionRect[2]/2);
                const yr:number = Math.abs(screen.state.selectionRect[3]/2);
                if(screen.toolSelector.selectedToolName() === "copy")
                {
                    screen.ctx.lineWidth = 1;
                    screen.ctx.strokeStyle = "#FFFFFF";
                    screen.ctx.strokeRect(screen.state.selectionRect[0]+2, screen.state.selectionRect[1]+2, screen.state.selectionRect[2]-4, screen.state.selectionRect[3]-4);
                    screen.ctx.strokeStyle = "#FF0000";
                    screen.ctx.strokeRect(screen.state.selectionRect[0], screen.state.selectionRect[1], screen.state.selectionRect[2], screen.state.selectionRect[3]);
               
                }
                else if(screen.toolSelector.selectedToolName() !== "oval")
                {
                    screen.ctx.strokeStyle = "#FFFFFF";
                    screen.ctx.strokeRect(screen.state.selectionRect[0]+2, screen.state.selectionRect[1]+2, screen.state.selectionRect[2]-4, screen.state.selectionRect[3]-4);
                    screen.ctx.strokeStyle = screen.state.color.htmlRBG();
                    screen.ctx.strokeRect(screen.state.selectionRect[0], screen.state.selectionRect[1], screen.state.selectionRect[2], screen.state.selectionRect[3]);
                }
                else if(screen.state.selectionRect[2] / 2 > 0 && screen.state.selectionRect[3] / 2 > 0)
                {
                    screen.ctx.beginPath();
                    screen.ctx.strokeStyle = screen.state.color.htmlRBG();
                    screen.ctx.ellipse(screen.state.selectionRect[0] + xr, screen.state.selectionRect[1]+yr, xr, yr, 0, 0, 2*Math.PI);
                    screen.ctx.stroke();
                }
                else if(screen.state.selectionRect[2] < 0 && screen.state.selectionRect[3] >= 0)
                {
                    screen.ctx.beginPath();
                    screen.ctx.strokeStyle = screen.state.color.htmlRBG();
                    screen.ctx.ellipse(screen.state.selectionRect[0] - xr, screen.state.selectionRect[1] + yr, xr, yr, 0, 0, 2*Math.PI);
                    screen.ctx.stroke();
                }
                else if(screen.state.selectionRect[2] < 0 && screen.state.selectionRect[3] < 0)
                {
                    screen.ctx.beginPath();
                    screen.ctx.strokeStyle = screen.state.color.htmlRBG();
                    screen.ctx.ellipse(screen.state.selectionRect[0] - xr, screen.state.selectionRect[1] - yr, xr, yr, 0, 0, 2*Math.PI);
                    screen.ctx.stroke();
                }
                else if(screen.state.selectionRect[2] != 0 && screen.state.selectionRect[3] != 0)
                {
                    screen.ctx.beginPath();
                    screen.ctx.strokeStyle = screen.state.color.htmlRBG();
                    screen.ctx.ellipse(screen.state.selectionRect[0] + xr, screen.state.selectionRect[1] - yr, xr, yr, 0, 0, 2*Math.PI);
                    screen.ctx.stroke();
                }
            }
            ctx.drawImage(screen.canvas, this.field.zoom.zoomedX, this.field.zoom.zoomedY, this.field.zoom.zoomX * screen.dimensions.first, this.field.zoom.zoomY * screen.dimensions.second);
            screen.ctx.clearRect(0, 0, screen.canvas.width, screen.canvas.height);
        }
        if(screen.dimensions.first * screen.dimensions.second < (1400*1400) && this.drawingScreenListener.registeredTouch === false && this.drawingScreenListener.mouseOverElement)
        {
            if(this.drawableTool())
            {
                const touchPos:number[] = [this.field.zoom.invZoomX(this.drawingScreenListener.touchPos[0]),this.field.zoom.invZoomY(this.drawingScreenListener.touchPos[1])];
                screen.handleTapSprayPaint(touchPos[0], touchPos[1]);
                if(this.penTool.tbProbability.state !== 1)
                {
                    for(let i = 0; i < 10; i++)
                    {
                        screen.updatesStack.push([]);
                        screen.handleTapSprayPaint(touchPos[0], touchPos[1]);
                    }
                }
                screen.drawToContextAsSprite(ctx, this.field.zoom.zoomedX, this.field.zoom.zoomedY, screen.dimensions.first * this.field.zoom.zoomX, screen.dimensions.second * this.field.zoom.zoomY);
                screen.ctx.clearRect(0, 0, screen.canvas.width, screen.canvas.height);
            }
        }
        ctx.lineWidth = oLineWidth;
    }
    draw()
    {
        const imgPerColumn:number = (this.toolPixelDim[1] / this.toolBar.toolRenderDim[1]);
        const imgPerRow:number = (this.toolPixelDim[0] / this.toolBar.toolRenderDim[0]);
        if(this.repaint || Date.now() - this.lastDrawTime > 600)
        {
            this.repaint = false;
            this.lastDrawTime = Date.now();
            this.resizeCanvas();
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.toolBar.refresh();
            this.toolBar.draw(this.ctx, 0, 0);
            if(this.tool()){
                (<Tool>this.toolBar.tools[this.selected()]).drawOptionPanel(this.ctx, this.toolBar.toolRenderDim[0]*imgPerRow, 0);
            }
            //render name of tool mouse is hovering over/last selected in touchscreen
            if(this.touchListener.mouseOverElement || isTouchSupported())
            {
                const touchPos:number[] = this.touchListener.touchPos;

                const xScale:number = this.canvas.width / this.externalCanvas.width;
                const yScale:number = this.canvas.height / this.externalCanvas.height;
                const x:number = Math.floor(touchPos[0] / this.toolPixelDim[0] * imgPerRow * xScale);
                const y:number = Math.floor(touchPos[1] / this.toolPixelDim[1] * imgPerColumn * yScale);
                if(this.toolBar.tools[x * imgPerColumn + y])
                {
                    const name:string = this.toolBar.tools[x * imgPerColumn + y].name();
                    const wordsInName:string[] = name.split(" ");

                    for (let i = 0; i < wordsInName.length; i++) {
                        wordsInName[i] = wordsInName[i][0].toUpperCase() + wordsInName[i].substring(1);
                    }
                    const capitalized:string = wordsInName.join(' ');
                    this.ctx.font = '16px Calibri';
                    this.ctx.strokeStyle = "#FFFF00";
                    this.ctx.strokeText(capitalized, x * this.toolBar.toolRenderDim[0], 16 + y * this.toolBar.toolRenderDim[1]);
                    this.ctx.fillStyle = "#000000";
                    this.ctx.fillText(capitalized, x * this.toolBar.toolRenderDim[0], 16 + y * this.toolBar.toolRenderDim[1]);
                }
            }
            const extCtx:CanvasRenderingContext2D = this.externalCanvas.getContext("2d")!;
            extCtx.clearRect(0, 0, this.externalCanvas.width, this.externalCanvas.height);
            extCtx.drawImage(this.canvas, 0, 0, this.externalCanvas.width, this.externalCanvas.height);
        }
    }
    selectedToolName():string | null
    {
        if(this.tool())
            return this.tool()!.name();
        return null;
    }
    tool():Tool | null
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
    drawCircular:boolean;
    dragOnlyOneColor:boolean;
    rotateOnlyOneColor:boolean;
    blendAlphaOnPaste:boolean;
    blendAlphaOnPutSelectedPixels:boolean;
    antiAliasRotation:boolean;
    sprayProbability:number;
    slow:boolean;
    resizeSprite:boolean;
    bufferBitMask:boolean[];
    allowDropOutsideSelection:boolean;
    selectionRect:number[];
    pasteRect:number[];
    selectionSelectionRect:number[];
    pixelPerfectBuffer:number[];
    drawCacheMap:Set<number>;

    constructor(lineWidth:number) {
        this.drawCacheMap = new Set<number>();
        this.color = new RGB(0,0,0);
        this.allowDropOutsideSelection = false;
        this.bufferBitMask = [];
        this.sprayProbability = 1;
        this.antiAliasRotation = true;
        this.blendAlphaOnPutSelectedPixels = true;
        this.dragOnlyOneColor = false;
        this.rotateOnlyOneColor = false;
        this.drawCircular = true;
        this.slow = false;
        this.blendAlphaOnPaste = true;
        this.resizeSprite = false;
        this.selectionRect = [0,0,0,0];
        this.pasteRect = [0,0,0,0];
        this.selectionSelectionRect = [0,0,0,0];
        this.lineWidth = lineWidth;//dimensions[0] / bounds[0] * 4;
        this.pixelPerfectBuffer = [];
    }
};
class DetailedPixelsGroup {
    x:number;
    y:number;
    colors:number[];
    topLeftPoints:number[];
    bottomLeftPoints:number[];
    topRightPoints:number[];
    bottomRightPoints:number[];

    constructor()
    {
        this.x = 0;
        this.y = 0;
        this.colors = [];
        this.topLeftPoints = [];
        this.bottomLeftPoints = [];
        this.topRightPoints = [];
        this.bottomRightPoints = [];
    }
    push(color:number, topLeftX:number, topLeftY:number, bottomLeftX:number, bottomLeftY:number, topRightX:number, topRightY:number, bottomRightX:number, bottomRightY:number): void {
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
    pushSimple(color:number, topLeftX:number, topLeftY:number, bottomLeftX:number): void
    {
        this.colors.push(color);
        this.topLeftPoints.push(topLeftX);
        this.topLeftPoints.push(topLeftY);
    }
    clearLists(): void
    {
        this.colors = [];
        this.topLeftPoints = [];
        this.bottomLeftPoints = [];
        this.topRightPoints = [];
        this.bottomRightPoints = [];
    }
    resetState(): void
    {
        this.x = -1;
        this.y = -1;
        this.clearLists();
    }
}
class DrawingScreen {
    offset:Pair<number>;
    screenBufUnlocked:boolean;
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
    updatesStack:RollingStack<Array<Pair<number,RGB>>>;
    undoneUpdatesStack:RollingStack<Array<Pair<number,RGB>>>;
    toolSelector:ToolSelector;
    dragData:DetailedPixelsGroup | null;
    dragDataMaxPoint:number;
    dragDataMinPoint:number;
    state:DrawingScreenState;
    drawWithAlpha:number;
    constructor(canvas:HTMLCanvasElement, keyboardHandler:KeyboardHandler, palette:Pallette, offset:Array<number>, dimensions:Array<number>, toolSelector:ToolSelector, state:DrawingScreenState, clipBoard:ClipBoard)
    {
        const bounds:Array<number> = [dim[0], dim[1]];
        this.screenBufUnlocked = true;
        this.dragDataMaxPoint = -1;
        this.dragDataMinPoint = -1;
        this.clipBoard = clipBoard;
        this.palette = palette;
        this.noColor = new RGB(255, 255, 255, 0);
        this.state = state;
        this.drawWithAlpha = 1;
        this.repaint = true;
        this.dimensions = new Pair<number>(dimensions[0], dimensions[1]);
        this.offset = new Pair<number>(offset[0], offset[1]);
        this.bounds = new Pair<number>(bounds[0], bounds[1]);
        this.ctx = canvas.getContext("2d")!;
        canvas.width = bounds[0];
        canvas.height = bounds[1];
        this.dragDataMaxPoint = 0;
        this.canvas = canvas;
        this.dragData = null;
        this.spriteScreenBuf = new Sprite([], this.canvas.width, this.canvas.height, false);
        this.toolSelector = toolSelector;
        this.updatesStack = new RollingStack<Array<Pair<number,RGB>>>();
        this.undoneUpdatesStack = new RollingStack<Array<Pair<number,RGB>>>();
        this.screenBuffer = new Array<RGB>();
        for(let i = 0; i < dimensions[0] * dimensions[1]; i++)
        {
            this.screenBuffer.push(new RGB(this.noColor.red(), this.noColor.green(), this.noColor.blue(), this.noColor.alpha()));
        }
        const colorBackup:RGB = new RGB(this.noColor.red(), this.noColor.green(), this.noColor.blue(), this.noColor.alpha());

        this.state.color = new RGB(0,0,0,255);
    }
    clearScreenBuffer(): void
    {
        for(let i = 0; i < this.screenBuffer.length; i++)
        {
            this.screenBuffer[i].color = this.noColor.color;
        }
    }
    swapColorsOnScreen(c1:RGB, c2:RGB): void
    {
        for(let i = 0; i < this.screenBuffer.length; i++)
        {
            const color:RGB = this.screenBuffer[i];
            if(color.compare(c1))
            {
                color.copy(c2);
            }
            else if(color.compare(c2))
            {
                color.copy(c1);
            }
        }
    }
    updateLabelUndoRedoCount(): void 
    {
        this.toolSelector.undoTool.updateLabel(this.undoneUpdatesStack.length(), this.updatesStack.length());
    }
    suggestedLineWidth():number
    {
        return Math.floor(this.dimensions.first / 128);
    }
    setLineWidthPen():void
    {
        const pen:PenTool = this.toolSelector.penTool;
        this.state.lineWidth = pen.penSize();
        pen.tbSize.setText(String(this.state.lineWidth));
    }
    flipHorizontally(): void
    {
        if(this.screenBufUnlocked)
        {
            this.screenBufUnlocked = false;
            let left:RGB = new RGB(0,0,0,0);
            let right:RGB = new RGB(0,0,0,0);
            for(let y = 0; y < this.dimensions.second; y++)
            {
                const yOffset:number = y * this.dimensions.first;
                for(let x = 0; x < this.dimensions.first << 1; x++)
                {
                    left = this.screenBuffer[x + yOffset];
                    right = this.screenBuffer[yOffset + (this.dimensions.first - 1) - x];
                    if(left && right)
                    {
                        const temp:number = left.color;
                        left.copy(right);
                        right.color = temp;
                    }
                }
            }
            this.repaint = true;
            this.screenBufUnlocked = true;
        }
    }
    flipVertically(): void
    {
        if(this.screenBufUnlocked)
        {
            this.screenBufUnlocked = false;
            let top:RGB = new RGB(0,0,0,0);
            let bottom:RGB = new RGB(0,0,0,0);
            for(let y = 0; y < this.dimensions.second >> 1; y++)
            {
                const upperYOffset:number = y * this.dimensions.first;
                const lowerYOffset:number = (this.dimensions.second - 1 - y) * this.dimensions.first;
                for(let x = 0; x < this.dimensions.first; x++)
                {
                    top = this.screenBuffer[x + upperYOffset];
                    bottom = this.screenBuffer[x + lowerYOffset];
                    //if(top && bottom)
                    {
                        const temp:number = bottom.color;
                        bottom.copy(top);
                        top.color = temp;
                    }
                }
            }
            this.repaint = true;
            this.screenBufUnlocked = true;
        }
    }
    maskToSprite():Sprite {
        let minY:number = this.dimensions.second;
        let minX:number = this.dimensions.first;
        let maxY:number = 0;
        let maxX:number = 0;
        for(let i = 0; i < this.screenBuffer.length; i++)
        {
            if(this.state.bufferBitMask[i])
            {
                const x:number = i % this.dimensions.first;
                const y:number = Math.floor(i / this.dimensions.first);
                if(minX > x)
                    minX = x;
                if(maxX < x)
                    maxX = x;
                if(minY > y)
                    minY = y;
                if(maxY < y)
                    maxY = y;
            }
        }
        const width:number = maxX - minX;
        const height:number = maxY - minY;
        const sprite:Sprite = new Sprite([], width, height, false);
        for(let y = 0; y < height; y++)
        {
            for(let x = 0; x < width; x++)
            {
                const key:number = minX + x + (y + minY) * this.dimensions.first;
                if(this.state.bufferBitMask[key])
                {
                    const spriteBufKey:number = x + y * width;
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
    selectionToSprite(selectionRect:number[]):Sprite
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
        
        const source_x:number = Math.floor((selectionRect[0]-this.offset.first)/this.bounds.first*this.dimensions.first);
        const source_y:number = Math.floor((selectionRect[1]-this.offset.second)/this.bounds.second*this.dimensions.second);
        const width:number = Math.floor((selectionRect[2]-this.offset.first)/this.bounds.first*this.dimensions.first);
        const height:number = Math.floor((selectionRect[3]-this.offset.second)/this.bounds.second*this.dimensions.second);
        const area:number = width * height;
        const asSprite:Sprite = new Sprite([], width, height);
        for(let i = 0; i < area; i++)
        {
            const copyAreaX:number = i%width;
            const copyAreaY:number = Math.floor(i/width);
            const sourceIndex:number = source_x + source_y*this.dimensions.first + copyAreaX + copyAreaY*this.dimensions.first;
            
            if(this.inBufferBounds(source_x + copyAreaX, source_y + copyAreaY) && this.state.bufferBitMask[sourceIndex])
            {
                const pixel:RGB = this.screenBuffer[sourceIndex];
                asSprite.fillRect(pixel ,copyAreaX, copyAreaY, 1, 1);
            }
        }
        asSprite.refreshImage();
        return asSprite;
    }
    paste():void
    {
        if(this.screenBufUnlocked)
        {
            this.screenBufUnlocked = false;
            const dest_x:number = Math.floor(((this.getTouchPosX() - this.clipBoard.sprite.width/2)-this.offset.first)/this.bounds.first*this.dimensions.first);
            const dest_y:number = Math.floor(((this.getTouchPosY() - this.clipBoard.sprite.height/2)-this.offset.second)/this.bounds.second*this.dimensions.second);
            const width:number = this.clipBoard.sprite.width;
            const height:number = this.clipBoard.sprite.height;
            const initialIndex:number = dest_x + dest_y*this.dimensions.first;
            const blendAlpha:boolean = this.state.blendAlphaOnPaste;
            const color:RGB = new RGB(0,0,0);
            for(let i = 0; i < this.clipBoard.sprite.pixels.length >> 2; i++)
            {
                const copyAreaX:number = i%width;
                const copyAreaY:number = Math.floor(i/width);
                const destIndex:number = initialIndex + copyAreaX + copyAreaY*this.dimensions.first;
                const dest:RGB = this.screenBuffer[destIndex];
                color.setRed(this.clipBoard.sprite.pixels[i << 2]);
                color.setGreen(this.clipBoard.sprite.pixels[(i << 2)+1]);
                color.setBlue(this.clipBoard.sprite.pixels[(i << 2)+2]);
                color.setAlpha(this.clipBoard.sprite.pixels[(i << 2)+3]);
                const source:RGB = color;
                if(this.inBufferBounds(dest_x + copyAreaX, dest_y + copyAreaY) && this.state.bufferBitMask[destIndex] && (!dest.compare(source) || source.alpha() != 255))
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
            this.screenBufUnlocked = true;
        }
    }
    horizontalsAdjacent(x:number, y:number):boolean
    {
        const key:number = x + y * this.dimensions.first;
        return (this.screenBuffer[key].compare(this.screenBuffer[key + this.dimensions.first])
            && this.screenBuffer[key].compare(this.screenBuffer[key - this.dimensions.first])) 
            || (this.screenBuffer[key].compare(this.screenBuffer[key + 1]) 
            && this.screenBuffer[key].compare(this.screenBuffer[key - 1]));
    }
    cleanPixelPerfectBuffer(rollover:number = 8): void 
    {
        const buffer:number[] = this.state.pixelPerfectBuffer;
        for(let i = 0; i < buffer.length - 1; i += 2)
        {
            let adjacent:number = 0;
            const idata:Pair<number, RGB> = new Pair(buffer[i], new RGB(0, 0, 0, 0));
            idata.second.color = buffer[i + 1];
            const ix:number = idata.first >> 16;
            const iy:number = idata.first & ((1 << 16) - 1);
            for(let j = 0; j < buffer.length - 1; j += 2)
            {
                const jdata:Pair<number, RGB> = new Pair(buffer[j], new RGB(0, 0, 0, 0));
                jdata.second.color = buffer[j + 1];
                const jx:number = jdata.first >> 16;
                const jy:number = jdata.first & ((1 << 16) - 1);
                const dx:number = ix - jx;
                const dy:number = iy - jy;
                if(Math.abs(dx) === 1 && Math.abs(dy) === 0)
                {
                    adjacent++;
                }
                else if(Math.abs(dx) === 0 && Math.abs(dy) === 1)
                {
                    adjacent++;
                }
            }
            if(adjacent > 1 && (adjacent !== 2 || !this.horizontalsAdjacent(ix, iy)))
            {
                {
                    this.screenBuffer[ix + iy * this.dimensions.first].color = idata.second.color;
                    buffer.splice(i, 2);
                    i -= 2;
                }
            }
            else
            {
                idata.first = ix + iy * this.dimensions.first;
                const existsInBuf:(val:Pair<number, RGB>) => boolean = (val:Pair<number, RGB>) => {
                    for(let i = 0; i < this.updatesStack.get(this.updatesStack.length() - 1).length; i++)
                    {
                        const el:Pair<number, RGB> = this.updatesStack.get(this.updatesStack.length() - 1)[i];
                        if(el.first === val.first && el.second.compare(val.second))
                            return true;
                    }
                    return false;
                };
                if(!this.state.drawCacheMap.has(idata.first)){
                    this.updatesStack.get(this.updatesStack.length() - 1).push(idata);
                    this.state.drawCacheMap.add(idata.first);
                }
                
            }
        }
        this.state.pixelPerfectBuffer.splice(0, this.state.pixelPerfectBuffer.length - rollover);
    }
    handleTapPixelPerfect(px:number, py:number, bufLen:number = 20)
    {
        bufLen += bufLen % 2;
        const gx:number = Math.floor((px-this.offset.first)/this.bounds.first*this.dimensions.first);
        const gy:number = Math.floor((py-this.offset.second)/this.bounds.second*this.dimensions.second);
        const pixelColor:RGB = this.screenBuffer[gx + gy * this.dimensions.first];
        if(gx < this.dimensions.first && gy < this.dimensions.second && this.screenBufUnlocked && pixelColor && !this.state.color.compare(pixelColor)) 
        {
            this.screenBufUnlocked = false;
            if(this.state.bufferBitMask[gx + gy * this.dimensions.first] && gx >= 0 && gy >= 0 && gx <= this.dimensions.first && gy < this.dimensions.second)
            {
                this.state.pixelPerfectBuffer.push((gx << 16) | gy);
                this.state.pixelPerfectBuffer.push(pixelColor.color);
                pixelColor.copy(this.state.color);
            }
            if(this.state.pixelPerfectBuffer.length > bufLen)
            {
                this.cleanPixelPerfectBuffer(bufLen - 6);
            }
            this.screenBufUnlocked = true;
        }
    }
    handleTap(px:number, py:number):void
    {
        const gx:number = Math.floor((px-this.offset.first)/this.bounds.first*this.dimensions.first);
        const gy:number = Math.floor((py-this.offset.second)/this.bounds.second*this.dimensions.second);
        if(gx < this.dimensions.first && gy < this.dimensions.second && this.screenBufUnlocked) 
        {
            this.screenBufUnlocked = false;
            const radius:number = this.state.lineWidth * 0.5;
            const offset:number = this.state.lineWidth > 1 ? 0.5 : 0;
            if(this.state.drawCircular)
            {
                const radius:number = this.state.lineWidth * 0.5;
                for(let i = -0.5*this.state.lineWidth; i < radius; i++)
                {
                    for(let j = -0.5*this.state.lineWidth;  j < radius; j++)
                    {
                        const ngx:number = gx+Math.round(j);
                        const ngy:number = (gy+Math.round(i));
                        const dx:number = ngx + offset - gx;
                        const dy:number = ngy + offset - gy;
                        const key = ngx + ngy*this.dimensions.first;
                        const pixel:RGB = this.screenBuffer[key];
                        if(this.inBufferBounds(ngx, ngy) && !pixel.compare(this.state.color) && this.state.bufferBitMask[key] && Math.sqrt(dx*dx+dy*dy) <= radius){
                            this.updatesStack.get(this.updatesStack.length()-1).push(new Pair(key, new RGB(pixel.red(),pixel.green(),pixel.blue(), pixel.alpha()))); 
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
                        const key = ngx + ngy*this.dimensions.first;
                        const pixel:RGB = this.screenBuffer[key];
                        if(this.inBufferBounds(ngx, ngy) && this.state.bufferBitMask[key] && !pixel.compare(this.state.color)){
                            this.updatesStack.get(this.updatesStack.length()-1).push(new Pair(key, new RGB(pixel.red(),pixel.green(),pixel.blue(), pixel.alpha()))); 
                            pixel.copy(this.state.color);
                        }
                    }
                }
            }
            this.repaint = true;
            this.screenBufUnlocked = true;
        }
    }
    handleTapSprayPaint(px:number, py:number):void
    {
        const gx:number = Math.floor((px-this.offset.first)/this.bounds.first*this.dimensions.first);
        const gy:number = Math.floor((py-this.offset.second)/this.bounds.second*this.dimensions.second);
        if(gx < this.dimensions.first && gy < this.dimensions.second && this.screenBufUnlocked){
            this.screenBufUnlocked = false;
            const radius:number = this.state.lineWidth * 0.5;
            if(this.state.drawCircular)
            {
                const offset:number = this.state.lineWidth > 1 ? 0.5 : 0;
                const radius:number = this.state.lineWidth * 0.5;
                for(let i = -0.5*this.state.lineWidth; i < radius; i++)
                {
                    for(let j = -0.5*this.state.lineWidth;  j < radius; j++)
                    {
                        const ngx:number = gx+Math.round(j);
                        const ngy:number = (gy+Math.round(i));
                        const dx:number = ngx + offset - gx;
                        const dy:number = ngy + offset - gy;
                        const key:number = ngx + ngy*this.dimensions.first;
                        const pixel:RGB = this.screenBuffer[key];
                        if(this.inBufferBounds(ngx, ngy) && this.state.bufferBitMask[key] && !pixel.compare(this.state.color) && Math.sqrt(dx*dx+dy*dy) <= radius && Math.random() < this.state.sprayProbability){
                            this.updatesStack.get(this.updatesStack.length()-1).push(new Pair(key, new RGB(pixel.red(),pixel.green(),pixel.blue(), pixel.alpha()))); 
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
                        const key:number = ngx + ngy*this.dimensions.first;
                        const pixel:RGB = this.screenBuffer[key];
                        if(this.inBufferBounds(ngx, ngy) && this.state.bufferBitMask[key] && !pixel.compare(this.state.color) && Math.random() < this.state.sprayProbability){
                            this.updatesStack.get(this.updatesStack.length()-1).push(new Pair(key, new RGB(pixel.red(),pixel.green(),pixel.blue(), pixel.alpha()))); 
                            pixel.copy(this.state.color);
                        }
                    }
                }
            }
            this.repaint = true;
            this.screenBufUnlocked = true;
        }
    }
    fillNonContiguous(startCoordinate:Pair<number>): void
    {
        if(this.screenBufUnlocked && 
            startCoordinate.first > 0 && startCoordinate.first < this.dimensions.first &&
            startCoordinate.second > 0 && startCoordinate.second < this.dimensions.second)
        {
            this.screenBufUnlocked = false;
            const startIndex:number = startCoordinate.first + startCoordinate.second*this.dimensions.first;
            const startPixel:RGB = this.screenBuffer[startIndex];
            const spc:RGB = new RGB(startPixel.red(), startPixel.green(), startPixel.blue(), startPixel.alpha());
            let i = 0;
            console.log(spc.color);
            while(i < this.screenBuffer.length)
            {
                if(spc.compare(this.screenBuffer[i])){
                    this.updatesStack.get(this.updatesStack.length()-1).push(new Pair(i, new RGB(this.screenBuffer[i].red(), this.screenBuffer[i].green(), this.screenBuffer[i].blue(), this.screenBuffer[i].alpha())));
                    this.screenBuffer[i].copy(this.state.color);
                }
                i++;
            }
            this.screenBufUnlocked = true;
        }
    }
    fillArea(startCoordinate:Pair<number>):void
    {
        if(this.screenBufUnlocked && 
            startCoordinate.first > 0 && startCoordinate.first < this.dimensions.first &&
            startCoordinate.second > 0 && startCoordinate.second < this.dimensions.second)
        {
            this.screenBufUnlocked = false;
        
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
                const cur:number = <number> stack.pop();
                const pixelColor:RGB = this.screenBuffer[cur];
                if(cur >= 0 && cur < length && 
                    spc.compare(pixelColor) && !checkedMap[cur] && this.state.bufferBitMask[cur])
                {
                    checkedMap[cur] = true;
                    if(!pixelColor.compare(this.state.color))
                    {
                        this.updatesStack.get(this.updatesStack.length()-1).push(new Pair(cur, new RGB(pixelColor.red(), pixelColor.green(), pixelColor.blue(), pixelColor.alpha())));
                        pixelColor.copy(this.state.color);
                    }
                    stack.push(cur + this.dimensions.first);
                    stack.push(cur - this.dimensions.first);
                    stack.push(cur-1);
                    stack.push(cur+1);
                }
            }
            this.screenBufUnlocked = true;
            this.repaint = true;
        }
    }
    getSelectedPixelGroupBitMask(startCoordinate:Pair<number>, countColor:boolean):DetailedPixelsGroup
    {
        const selection:DetailedPixelsGroup = new DetailedPixelsGroup();
        const startIndex:number = startCoordinate.first + startCoordinate.second*this.dimensions.first;
        const startPixel:RGB = this.screenBuffer[startIndex];
        const spc:RGB = new RGB(startPixel.red(), startPixel.green(), startPixel.blue(), startPixel.alpha());
        for(let i = 0; i < this.state.bufferBitMask.length; ++i)
        {
            if(this.state.bufferBitMask[i] && this.screenBuffer[i].alpha())
            {
                if(this.screenBuffer[i].compare(spc) || !countColor)
                {
                        this.updatesStack.get(this.updatesStack.length()-1).push(new Pair(i, new RGB(this.screenBuffer[i].red(), this.screenBuffer[i].green(), this.screenBuffer[i].blue(), this.screenBuffer[i].alpha())));
                        const x:number = i % this.dimensions.first;
                        const y:number = Math.floor(i / this.dimensions.first);
                        selection.push(this.screenBuffer[i].color, 
                            x, y, 
                            x, y + 1, 
                            x+1, y,  
                            x + 1, y + 1);
                        this.screenBuffer[i].copy(this.noColor);
                }
            }
        }
        this.updatesStack.push([]);
        return selection;
    }
    //Pair<offset point>, Map of colors encoded as numbers by location>
    getSelectedPixelGroupAuto(startCoordinate:Pair<number>, countColor:boolean):DetailedPixelsGroup
    {
        const selection:DetailedPixelsGroup = new DetailedPixelsGroup();
        if(this.screenBufUnlocked && 
            startCoordinate.first > 0 && startCoordinate.first < this.dimensions.first &&
            startCoordinate.second > 0 && startCoordinate.second < this.dimensions.second)
        {
            this.screenBufUnlocked = false;
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
                const cur:number = <number> stack.pop();
                const pixelColor:RGB = this.screenBuffer[cur];
                if(cur >= 0 && cur < this.dimensions.first * this.dimensions.second && 
                    (pixelColor.alpha() !== 0 && (!countColor || pixelColor.color === spc.color)) && !checkedMap[cur] && this.state.bufferBitMask[cur])
                {
                    checkedMap[cur] = true;
                    this.updatesStack.get(this.updatesStack.length()-1).push(new Pair(cur, new RGB(pixelColor.red(), pixelColor.green(), pixelColor.blue(), pixelColor.alpha())));
                    
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
                    const x:number = cur % this.dimensions.first;
                    const y:number = Math.floor(cur / this.dimensions.first);
                    selection.push(this.screenBuffer[cur].color, 
                        x, y, 
                        x, y + 1, 
                        x + 1, y,  
                        x + 1, y + 1);
                    //data.push(pixelColor.color);
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
            this.screenBufUnlocked = true;
        }
        return selection;
    }
    //Pair<offset point>, Map of colors encoded as numbers by location>
    autoOutline(startCoordinate:Pair<number>, countColor:boolean):void
    {
        if(this.screenBufUnlocked && 
            startCoordinate.first > 0 && startCoordinate.first < this.dimensions.first &&
            startCoordinate.second > 0 && startCoordinate.second < this.dimensions.second)
        {
            this.screenBufUnlocked = false;
            const stack:number[] = [];
            const defaultColor = this.noColor;
            const checkedMap:Array<boolean> = new Array<boolean>(this.dimensions.first * this.dimensions.second).fill(false);
            
            const startIndex:number = startCoordinate.first + startCoordinate.second*this.dimensions.first;
            const startPixel:RGB = this.screenBuffer[startIndex];
            const spc:RGB = new RGB(startPixel.red(), startPixel.green(), startPixel.blue(), startPixel.alpha());
            stack.push(startIndex);
            while(stack.length > 0)
            {
                const cur:number = <number> stack.pop();
                const pixelColor:RGB = this.screenBuffer[cur];
                if(pixelColor && 
                    pixelColor.alpha() !== 0 && (!countColor || pixelColor.color === spc.color) && !checkedMap[cur] && this.state.bufferBitMask[cur])
                {
                    checkedMap[cur] = true;
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
                else if(pixelColor && !checkedMap[cur] && this.state.bufferBitMask[cur]) {
                    checkedMap[cur] = true;
                    this.updatesStack.get(this.updatesStack.length()-1).push(
                        new Pair(cur, new RGB(pixelColor.red(), pixelColor.green(), pixelColor.blue(), pixelColor.alpha())));

                    pixelColor.copy(this.state.color);
                }
            }
            this.screenBufUnlocked = true;
        }
    }
    
    rotateSelectedPixelGroup(theta:number, centerPoint:number[]):void
    {
        if(this.dragData === null)
            return;
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
        const rotate = (data:number[], index:number) => {
            vec[0] = data[index];
                    vec[1] = data[index+1];
                    vec[2] = 1;
                    let transformed:number[] = matByVec(finalTransformationMatrix, vec);
                    const point:number =  Math.floor(transformed[0]) + Math.floor(transformed[1]) * this.dimensions.first;
                    if(point < this.dragDataMinPoint && point >= 0)
                        this.dragDataMinPoint = point;
                    if(point > this.dragDataMaxPoint)
                        this.dragDataMaxPoint = point;

                    if(this.state.antiAliasRotation) {
                        data[index] = (transformed[0]);
                        data[index + 1] = (transformed[1]);
                    }
                    else {
                        data[index] = (Math.round(transformed[0]));
                        data[index + 1] = (Math.round(transformed[1]));
                    }
        };
        for(let i = 0, j = 0; i < this.dragData.topLeftPoints.length; i += 2, j++)
        {
            rotate(this.dragData.topLeftPoints, i);
            rotate(this.dragData.topRightPoints, i);
            rotate(this.dragData.bottomLeftPoints, i);
            rotate(this.dragData.bottomRightPoints, i);
            //data.push(this.dragData.second[i+8]);
        }
        //this.dragData.second = data;
    }
    drawRect(start:Array<number>, end:Array<number>, drawPoint:(x:number, y:number, screen:DrawingScreen) => void = (x,y,screen) => screen.handleTap(x, y)):void
    {
        this.drawLine(start, [start[0], end[1]], drawPoint);
        this.drawLine(start, [end[0], start[1]], drawPoint);
        this.drawLine([start[0], end[1]], end, drawPoint);
        this.drawLine([end[0], start[1]], end, drawPoint);
    }
    drawLine(start:Array<number>, end:Array<number>, drawPoint:(x:number, y:number, screen:DrawingScreen) => void = (x,y,screen) => screen.handleTap(x, y)):void
    {
        this.handleDraw(start[0], end[0], start[1], end[1], drawPoint);
    }
    handleDraw(x1:number, x2:number, y1:number, y2:number, drawPoint:(x:number, y:number, screen:DrawingScreen) => void = (x,y,screen) => screen.handleTap(x, y)):void
    {
        //draw line from current touch pos to the touchpos minus the deltas
        //calc equation for line
        const deltaY = y2 - y1;
        const deltaX = x2 - x1;
        const m:number = deltaY/deltaX;
        const b:number = y2-m*x2;
        const delta:number = this.state.lineWidth <= 4? 1 :(this.state.drawCircular ? (this.state.lineWidth < 16? 2 : this.state.lineWidth / 16) : 1);
        if(Math.abs(deltaX) > Math.abs(deltaY))
        {
            const min:number = Math.min(x1, x2);
            const max:number = Math.max(x1, x2);
            let y:number = m*min + b;
            let error:number = 0;
            for(let x = min; x < max; x++)
            {
                if(error > 0.5)
                {
                    y++;
                    error--;
                }
                else if(error < -0.5)
                {
                    y--;
                    error++;
                }
                drawPoint(x, y, this);
                error += m;
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
    async undoLast(slow:boolean = false)
    {
        if(this.updatesStack.length() && this.screenBufUnlocked)
        {
            this.screenBufUnlocked = false;
            const data:Pair<number, RGB>[] = this.updatesStack.pop()!;
            try{
                const backedUpFrame:Pair<number, RGB>[] = [];
                const divisor:number =  60*10;
                const interval:number = Math.floor(data.length/divisor) === 0 ? 1 : Math.floor(data.length / divisor);
                let intervalCounter:number = 0;
                for(let i = 0; i < data.length; i++)
                {
                    intervalCounter++;
                    const el:Pair<number, RGB> = data[i];
                    if(this.screenBuffer[el.first])
                    {
                        backedUpFrame.push(el);
                        const color:number = (this.screenBuffer[el.first]).color;
                        this.screenBuffer[el.first].copy(el.second);
                        el.second.color = color;
                    }
                    
                    if(intervalCounter % interval === 0 && slow)
                    {
                        await sleep(1);
                        this.repaint = true;
                    }

                }
                this.undoneUpdatesStack.push(backedUpFrame);
                this.repaint = true;
                this.screenBufUnlocked = true;
            }
            catch(error:any)
            {
                this.repaint = true;
                this.screenBufUnlocked = true;
                console.log(error);
            }
        }
        else{
            console.log("Error, nothing to undo");
        }
            
    }
    async redoLast(slow:boolean = false)
    {
        if(this.undoneUpdatesStack.length() && this.screenBufUnlocked)
        {
            try {
                this.screenBufUnlocked = false;
                const data = this.undoneUpdatesStack.pop()!;
                const backedUpFrame:Pair<number, RGB>[] = [];
                const divisor:number =  60*10;
                const interval:number = Math.floor(data.length/divisor) === 0 ? 1 : Math.floor(data.length / divisor);
                let intervalCounter:number = 0;
                for(let i = 0; i < data.length; i++)
                {
                    intervalCounter++;
                    const el:Pair<number, RGB> = data[i];
                    if(this.screenBuffer[el.first])
                    {
                        backedUpFrame.push(el);
                        const color:number = this.screenBuffer[el.first].color;
                        this.screenBuffer[el.first].copy(el.second);
                        el.second.color = color;
                    }
                    
                    if(intervalCounter % interval === 0 && slow)
                    {
                        await sleep(1);
                        this.repaint = true;
                    }
                }
                this.repaint = true;
                this.updatesStack.push(backedUpFrame);
                this.screenBufUnlocked = true;

            }
            catch(error:any)
            {
                this.repaint = true;
                this.screenBufUnlocked = true;
                console.log(error);
            }
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
            {
                this.bounds.first = newDim[0];
                this.bounds.second = newDim[1];
            }
            
            const bounds:Array<number> = [this.bounds.first, this.bounds.second];
            if(this.screenBuffer.length != newDim[0]*newDim[1])
            {
                const canvas = document.createElement("canvas");
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.spriteScreenBuf.putPixels(this.ctx);
                this.screenBuffer = [];
                for(let i = 0; i < newDim[0] * newDim[1]; i++)
                    this.screenBuffer.push(new RGB(this.noColor.red(),this.noColor.green(),this.noColor.blue(),this.noColor.alpha()));
                const sprite:Sprite = new Sprite([], newDim[0], newDim[1], false);
                
                //buggy when resizing to a different aspect ratio
                if(this.state.resizeSprite)
                {
                    this.undoneUpdatesStack.empty();
                    this.updatesStack.empty();
                    canvas.width = newDim[0];
                    canvas.height = newDim[1];
                    const ctx = canvas.getContext("2d")!;
                    ctx.imageSmoothingEnabled = false;
                    ctx.drawImage(this.canvas, 0, 0, newDim[0], newDim[1]);
                    sprite.imageData = ctx.getImageData(0, 0, newDim[0], newDim[1]);
                    sprite.pixels = sprite.imageData.data;
                    sprite.copyToBuffer(this.screenBuffer, newDim[0], newDim[1]);
                }
                else
                {
                    canvas.width = this.dimensions.first;
                    canvas.height = this.dimensions.second;
                    const ctx = canvas.getContext("2d")!;
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
            this.ctx = this.canvas.getContext("2d")!;
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
    loadSprite(sprite:Sprite):void {
        const preUpdate = [];
        for(let i = 0; i < this.screenBuffer.length; i++)
        {
            const color:RGB = this.screenBuffer[i];
            preUpdate.push(new Pair(i, new RGB(color.red(), color.green(), color.blue(), color.alpha())));
        }
        this.updatesStack.push(preUpdate);
        this.updateLabelUndoRedoCount();
        sprite.copyToBuffer(this.screenBuffer, this.dimensions.first, this.dimensions.second);
        
         
                console.log("Loaded to screen:");
        
        this.repaint = true;
    }
    setPixel(index:number, color:RGB)
    {
        index <<= 2;
        this.spriteScreenBuf.pixels[index++] = color.red();
        this.spriteScreenBuf.pixels[index++] = color.green();
        this.spriteScreenBuf.pixels[index++] = color.blue();
        this.spriteScreenBuf.pixels[index++] = color.alpha();
    }
    saveDragDataToScreen():void
    {
        if(this.dragData)
        {
            let counter:number = 0;
            const color:RGB = new RGB(0,0,0,0);
            const dragDataColors:number[] = this.dragData.colors;
            const topLeftPoints:number[] = this.dragData.topLeftPoints;
            for(let i = 0, j = 0; i < topLeftPoints.length; i += 2, j++)
            {
                counter++;
                const x:number = Math.floor(topLeftPoints[i] + this.dragData.x);
                const y:number = Math.floor(topLeftPoints[i + 1] + this.dragData.y);
                const key:number = (x + y * this.dimensions.first);
                if(this.inBufferBounds(x, y) && (this.state.allowDropOutsideSelection || this.state.bufferBitMask[key]))
                {
                    color.color = dragDataColors[j];
                    this.updatesStack.get(this.updatesStack.length()-1).push(new Pair(key, new RGB(this.screenBuffer[key].red(), this.screenBuffer[key].green(), this.screenBuffer[key].blue(), this.screenBuffer[key].alpha())));
                    if(color.alpha() !== 255 && this.state.blendAlphaOnPutSelectedPixels)
                        this.screenBuffer[key].blendAlphaCopy(color);
                    else
                        this.screenBuffer[key].color = color.color;
                }
                
            }
            this.dragData.resetState();
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
            const dragDataColors = this.dragData.colors;
            const map:Map<number, number[]> = new Map<number,number[]>();
            for(let i = 0, k = 0; i < this.dragData.topLeftPoints.length; i += 2, k++){
                counter++;
                if((counter & ((2<<16) - 1)) === 0)
                    await sleep(1);
                const x1:number = this.dragData.topLeftPoints[i] + Math.floor(this.dragData.x);
                const y1:number = this.dragData.topLeftPoints[i + 1] + Math.floor(this.dragData.y);
                const x2:number = this.dragData.topRightPoints[i] + Math.floor(this.dragData.x);
                const y2:number = this.dragData.topRightPoints[i + 1] + Math.floor(this.dragData.y);
                const x3:number = this.dragData.bottomRightPoints[i] + Math.floor(this.dragData.x);
                const y3:number = this.dragData.bottomRightPoints[i + 1] + Math.floor(this.dragData.y);
                const deltaX:number = Math.max(x1,x2) - Math.min(x1, x2);
                const deltaY:number = Math.max(y1,y2) - Math.min(y1, y2);
                const deltaX2:number = Math.max(x1,x3) - Math.min(x1, x3);
                const deltaY2:number = Math.max(y1,y3) - Math.min(y1, y3);

                    color0.color = this.dragData.colors[k];
                    const limit:number = 10;
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
                            let color:number[] | undefined = map.get((sub_x << 16) | sub_y);
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
                            map.set((sub_x << 16) | sub_y, color);
                        }
                    }
                
            }
            for(const [key, value] of map.entries())
            {
                color0.setRed(value[0]);
                color0.setGreen(value[1]);
                color0.setBlue(value[2]);
                color0.setAlpha(value[3]);
                const x:number = key >> 16;
                const y:number = key & (0x0000FFFF);
                const newKey:number = x + y * this.dimensions.first;
                if(this.inBufferBounds(x, y) && (this.state.allowDropOutsideSelection || this.state.bufferBitMask[newKey]))
                {
                    this.updatesStack.get(this.updatesStack.length()-1).push(new Pair(newKey, new RGB(this.screenBuffer[newKey].red(), this.screenBuffer[newKey].green(), this.screenBuffer[newKey].blue(), this.screenBuffer[newKey].alpha())));
                    this.screenBuffer[newKey].blendAlphaCopy(color0);
                }
            };
            this.dragData.resetState();
            this.repaint = true;
        }
    }
    getTouchPosX():number {
        return this.toolSelector.field.zoom.invZoomX(this.toolSelector.drawingScreenListener.touchPos[0]);
    }
    getTouchPosY():number {
        return this.toolSelector.field.zoom.invZoomY(this.toolSelector.drawingScreenListener.touchPos[1]);
    }
    renderToBuffer(spriteBuffer:Sprite):void
    {
        const view:Int32Array = new Int32Array(spriteBuffer.pixels.buffer);
        if(this.dimensions.first === this.canvas.width && this.dimensions.second === this.canvas.height)
        {//if drawing screen dimensions, and canvas dimensions are the same just update per pixel
            let index = 0
            const limit:number = view.length === this.screenBuffer.length ? view.length - 8 : this.screenBuffer.length - 8;
            for(; index < limit;)
            {
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
            for(; index < this.screenBuffer.length; )
            {
                view[index] = this.screenBuffer[index].color;
                index++; 
            }
        }
        else if(this.dimensions.first * 2 === this.canvas.width && this.dimensions.second * 2 === this.canvas.height)
        {
            let index = 0;
            let bufferIndex = 0;
            for(let y = 0; y < spriteBuffer.height; y += 2)
            {
                for(let x = 0; x < spriteBuffer.width; x += 2)
                {
                    const color:number = this.screenBuffer[index].color
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
        else if(this.dimensions.first * 4 === this.canvas.width && this.dimensions.second * 4 === this.canvas.height)
        {
            let index = 0;
            let bufferIndex = 0;
            for(let y = 0; y < spriteBuffer.height; y += 4)
            {
                for(let x = 0; x < spriteBuffer.width; x += 4)
                {
                    const color:number = this.screenBuffer[index].color
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
        else//use fill rect method to fill rectangle the size of pixels(more branch mispredicts, but more general)
        {
            const cellHeight:number = Math.floor(this.bounds.second / this.dimensions.second);
            const cellWidth:number = Math.floor(this.bounds.first / this.dimensions.first);
            let k:number = 0;
            for(let y = 0; y < this.dimensions.second * cellHeight; y += cellHeight, k++)
            {
                let j:number = k*this.dimensions.first;
                for(let x = 0; x < this.dimensions.first * cellWidth; x += cellWidth, j++)
                {
                    spriteBuffer.fillRect(this.screenBuffer[j], x, y, cellWidth, cellHeight, view);   
                }
            }
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
            const spriteScreenBuf:Sprite = this.spriteScreenBuf;
            const source:RGB = new RGB(0,0,0,0);
            const toCopy:RGB = new RGB(0,0,0,0);
            this.renderToBuffer(spriteScreenBuf);
            if(this.dragData)
            {
                const dragDataColors:number[] = this.dragData.colors;
                const dragDataPoints:number[] = this.dragData.topLeftPoints;
                const dragDataOffsetX:number = Math.floor(this.dragData.x);
                const dragDataOffsetY:number = Math.floor(this.dragData.y);
                const view:Int32Array = new Int32Array(spriteScreenBuf.pixels.buffer);
                for(let i:number = 0, j = 0; i < dragDataPoints.length; i += 2, j++){
                    const bx:number = Math.floor(dragDataPoints[i] + dragDataOffsetX);
                    const by:number = Math.floor(dragDataPoints[i+1] + dragDataOffsetY);
                    if(this.inBufferBounds(bx, by))
                    {
                        const key:number = bx + by * this.dimensions.first;
                        toCopy.color = dragDataColors[j];
                        source.color = this.screenBuffer[key].color;
                        source.blendAlphaCopy(toCopy);
                        view[key] = source.color;
                    }         
                };
    
            }
            if(this.toolSelector.drawingScreenListener && this.toolSelector.drawingScreenListener.registeredTouch && this.toolSelector.selectedToolName() === "paste")
            {
                const dest_x:number = Math.floor(((this.getTouchPosX() - this.clipBoard.sprite.width/2)-this.offset.first)/this.bounds.first*this.dimensions.first);
                const dest_y:number = Math.floor(((this.getTouchPosY() - this.clipBoard.sprite.height/2)-this.offset.second)/this.bounds.second*this.dimensions.second);
                const width:number = this.clipBoard.sprite.width;
                const initialIndex:number = dest_x + dest_y*this.dimensions.first;
                const clipboardView:Int32Array = new Int32Array(this.clipBoard.sprite.pixels.buffer);
                const spriteView:Int32Array = new Int32Array(spriteScreenBuf.pixels.buffer);
                for(let i = 0; i < clipboardView.length; i++)
                {
                    const copyAreaX:number = i%width;
                    const copyAreaY:number = Math.floor(i/width);
                    const destIndex:number = initialIndex + copyAreaX + copyAreaY*this.dimensions.first;
                    const x:number = destIndex % this.dimensions.first;
                    const y:number = Math.floor(destIndex/this.dimensions.first);
                    source.color = clipboardView[i];
                    if(this.inBufferBounds(dest_x + copyAreaX, dest_y + copyAreaY))
                    {
                        toCopy.color = this.screenBuffer[destIndex].color;
                        if(this.state.blendAlphaOnPaste){
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
    drawToContextAsSprite(ctx:CanvasRenderingContext2D, x:number, y:number, width:number = this.dimensions.first, height:number = this.dimensions.second):void
    {
        if(this.repaint)
        {
            this.renderToBuffer(this.spriteScreenBuf);
        }
        this.spriteScreenBuf.putPixels(this.ctx);
        const oldAlpha:number = ctx.globalAlpha;
        if(oldAlpha !== this.drawWithAlpha) {
            ctx.globalAlpha = this.drawWithAlpha;
            ctx.drawImage(this.canvas, x, y, width, height);
            ctx.globalAlpha = oldAlpha;
        }
        else
            ctx.drawImage(this.canvas, x, y, width, height);
    }
    drawToContext(ctx:CanvasRenderingContext2D, x:number, y:number, width:number = this.dimensions.first, height:number = this.dimensions.second):void
    {
        this.draw();
        const oldAlpha:number = ctx.globalAlpha;
        if(oldAlpha !== this.drawWithAlpha) {
            ctx.globalAlpha = this.drawWithAlpha;
            ctx.drawImage(this.canvas, x, y, width, height);
            ctx.globalAlpha = oldAlpha;
        }
        else
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
    miniMapRect:number[];

    constructor() {
        this.zoomX = 1;
        this.zoomY = 1;
        this.miniMapRect = [0, 0, 150, 150];
        this.zoomedX = 0;
        this.zoomedY = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }
    invZoomX(x:number)
    {
        return (1 / (this.zoomX)) * (x - this.zoomedX);
    }
    invZoomY(y:number)
    {
        return (1 / (this.zoomY )) * (y - this.zoomedY);
    }
    invJustZoomX(x:number)
    {
        return (1 / (this.zoomX)) * (x);
    }
    invJustZoomY(y:number)
    {
        return (1 / (this.zoomY)) * (y);
    }
};
interface MessageData {
    start:number;
    end:number;
    height:number;
    width:number;
    polygon:number[][];
    poolIndex:number;
};
class LayeredDrawingScreen {
    layers:DrawingScreen[];
    layersState:boolean[];
    state:DrawingScreenState;
    selected:number;
    clipBoard:ClipBoard;
    canvas:HTMLCanvasElement;
    canvasBackground:HTMLCanvasElement;
    backgroundState:number;
    static default_background:number = 0;
    static white_background:number = 1;
    static black_background:number = 2;
    canvasPixelGrid:HTMLCanvasElement;
    spriteTest:Sprite;
    dim:number[];
    renderDim:number[];
    ctx:CanvasRenderingContext2D;
    redraw:boolean;
    keyboardHandler:KeyboardHandler;
    pallette:Pallette;
    toolSelector:ToolSelector;
    selectionCanvas:HTMLCanvasElement;
    offscreenCanvas:HTMLCanvasElement;
    zoom:ZoomState;
    maskWorkers:Worker[];
    maskWorkerExecutionCount:number;
    scheduledMaskOperation:MessageData[];
    miniMapAlpha:number;
    constructor(keyboardHandler:KeyboardHandler, pallette:Pallette) {
        this.state = new DrawingScreenState(3);
        this.backgroundState = LayeredDrawingScreen.default_background;
        this.miniMapAlpha = 1;
        this.toolSelector = <any> null;
        this.redraw = false;
        this.maskWorkerExecutionCount = 0;
        this.scheduledMaskOperation = [];
        this.canvas = document.createElement("canvas");
        this.offscreenCanvas = document.createElement("canvas");
        this.canvasBackground = document.createElement("canvas");
        this.canvasPixelGrid = document.createElement("canvas");
        this.selectionCanvas = document.createElement("canvas");
        this.maskWorkers = [];
        const poolSize:number = window.navigator.hardwareConcurrency < 4 ? 4 : window.navigator.hardwareConcurrency;
        for(let i = 0; i < poolSize; i++) {
            const worker:Worker = new Worker("polygonalSelectionWorker.js");
            this.maskWorkers.push(worker);
            worker.addEventListener("message", (event) => {
                let j:number = 0;
                this.maskWorkerExecutionCount--;
                let i = event.data.start;
                for(; i < event.data.end - 16;)
                {
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
                for(; i < event.data.end;)
                {
                    this.state.bufferBitMask[i++] = event.data.result[j++];
                }
            });
        }
        this.dim = [128, 128];
        this.renderDim = [this.dim[0], this.dim[1]];
        this.canvas.width = this.dim[0];
        this.canvas.height = this.dim[1];
        this.spriteTest = new Sprite([], this.dim[0], this.dim[1], false);
        this.ctx = this.canvas.getContext("2d")!;
        this.ctx.fillStyle = "#FFFFFF";
        this.selected = 0;
        this.layers = [];
        this.layersState = [];
        this.keyboardHandler = keyboardHandler;
        this.pallette = pallette;
        this.setDimOnCurrent(this.dim);
        this.zoom = new ZoomState();
        this.clipBoard = new ClipBoard(<HTMLCanvasElement> document.getElementById("clipboard_canvas"), keyboardHandler, 128, 128);
    }
    
    update():void {
        if(this.maskWorkerExecutionCount === 0 && this.scheduledMaskOperation.length)
        {
            for(let i = 0; i < this.scheduledMaskOperation.length; i++)
            {
                this.maskWorkers[i].postMessage(this.scheduledMaskOperation[i]);
                this.maskWorkerExecutionCount++;
            }
            this.scheduledMaskOperation = [];
        }
    }
    scheduleUpdateMaskPolygon(shape:number[][])
    {
        if(shape.length > 2)
        {
            const lenPerWorker:number = Math.floor(this.state.bufferBitMask.length / this.maskWorkers.length);
            const remainder:number = this.state.bufferBitMask.length - Math.floor(this.state.bufferBitMask.length / lenPerWorker) * lenPerWorker;
            let i = 0;

            this.scheduledMaskOperation = [];
            for(; i < this.maskWorkers.length - 1; i++)
            {
                const message:MessageData = {
                    start: i * lenPerWorker,
                    end: (i + 1) * lenPerWorker,
                    height: this.height(),
                    width: this.layer().dimensions.first,
                    polygon: shape,
                    poolIndex: i
                };
                this.scheduledMaskOperation.push(message);
            }
            const message:MessageData = {
                start: i * lenPerWorker,
                end: (i + 1) * lenPerWorker + remainder,
                height: this.height(),
                width: this.layer().dimensions.first,
                polygon: shape,
                poolIndex: i
            };
            this.scheduledMaskOperation.push(message);
        }
        else
        {
            for(let i = 0; i < this.state.bufferBitMask.length; i++)
                this.state.bufferBitMask[i] = true;
        }
    }
    updateBitMaskRectangle(rect:number[]):void //[x, y, width, height]
    {
        if(rect.length === 4)
        {
            //converts values in screenspace to canvas space
            const convertX = (x:number) =>  Math.floor(x / this.width() * this.layer().dimensions.first);
            const convertY = (y:number) =>  Math.floor(y / this.height() * this.height());
            this.clearBitMask();
            for(let y = 0; y < this.height(); ++y)
            {
                for(let x = 0; x < this.layer().dimensions.first; ++x)
                {
                    const key:number = x + y * this.layer().dimensions.first
                    this.state.bufferBitMask[key] = x >= convertX(rect[0]) && x <= convertX(rect[0] + rect[2]) && y >= convertY(rect[1]) && y <= convertY(rect[1] + rect[3]);
                }
            }
        }
        else
        {
            console.log("Error, invalid rectangle for bitmask");
        }
    }
    clearBitMask():void 
    {
        let i = 0;
        for(; i < this.state.bufferBitMask.length - 16; ++i)
        {
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
        for(; i < this.state.bufferBitMask.length; ++i)
        {
            this.state.bufferBitMask[i] = true;
        }
    }
    repaint():boolean {
        let repaint:boolean = this.redraw;
        for(let i = 0; !repaint && i < this.layers.length; i++)
        {
            repaint = this.layers[i].repaint;
        }
        return repaint;
    }
    swapColors(c1:RGB, c2:RGB): void
    {
        this.layers.forEach((layer:DrawingScreen) => {layer.swapColorsOnScreen(c1, c2); layer.repaint = true;});
    }
    zoomToScreen():void
    {
        if(this.zoom){
            const whRatio:number = (this.zoom.zoomX / this.zoom.zoomY);
            this.zoom.offsetX = 0;
            this.zoom.offsetY = 0;
            this.zoom.zoomY = this.renderDim[1] / this.height();
            this.zoom.zoomX = this.zoom.zoomY * whRatio;
        }
    }
    setDimOnCurrent(dim:number[]):void {
        if(this.toolSelector && this.toolSelector.settingsTool)
            this.toolSelector.settingsTool.setDim(dim);
            this.layers.forEach(layer => {
                const zoom:Pair<number> = layer.setDim(dim);
            });
            this.zoomToScreen();
            if(this.state.bufferBitMask.length !== dim[0] * dim[1])
            {
                this.state.bufferBitMask = [];
                for(let i = 0; i < dim[0]*dim[1]; ++i)
                    this.state.bufferBitMask.push(true);
            }
           
        if(this.layers[0])
        {
            const bounds:number[] = [this.layers[0].bounds.first, this.layers[0].bounds.second];
            this.dim = [bounds[0], bounds[1]];
            this.canvas.width = bounds[0];
            this.canvas.height = bounds[1];
            this.selectionCanvas.width = bounds[0];
            this.selectionCanvas.height = bounds[1];
            this.ctx = this.canvas.getContext("2d")!;
            this.resizeBackgroundCanvas(bounds, 8);
            this.resizePixelGridCanvas(bounds, 1);
        }
    }
    
    resizePixelGridCanvas(bounds:number[], dim:number):void
    {
        if((this.canvasPixelGrid.width !== bounds[0] || this.canvasPixelGrid.height !== bounds[1]))
        {
            this.canvasPixelGrid.width = bounds[0];
            this.canvasPixelGrid.height = bounds[1];
        }
            const ctx:CanvasRenderingContext2D = this.canvasPixelGrid.getContext("2d")!;
            ctx.fillStyle = "#DCDCFF";
            ctx.globalAlpha = 0.4;
            ctx.clearRect(0, 0, bounds[0], bounds[1]);
            ctx.fillRect(0, 0, bounds[0], bounds[1]);
            let i = 0;
            const squareSize:number = dim;
            for(let y = 0; y < bounds[1] + 100; y += squareSize)
            {
                let offset = +(i % 2 === 0);
                for(let x = offset*squareSize ; x < bounds[0] + 200; x += squareSize*2)
                {
                    ctx.clearRect(x,  y, squareSize, squareSize);
                }
                i++;
            }
    }
    refreshBackgroundCanvas(): void
    {
        this.resizeBackgroundCanvas(this.dim, 8);
        this.redraw = true;
    }
    resizeBackgroundCanvas(bounds:number[], dim:number):void
    {
        if((this.canvasBackground.width !== bounds[0] || this.canvasBackground.height !== bounds[1]))
        {
            this.canvasBackground.width = bounds[0];
            this.canvasBackground.height = bounds[1];
        }
            const ctx:CanvasRenderingContext2D = this.canvasBackground.getContext("2d")!;
            switch(this.backgroundState)
            {
                case(LayeredDrawingScreen.default_background):
                ctx.fillStyle = "#DCDCDF";
                ctx.globalAlpha = 0.7;
                ctx.clearRect(0, 0, bounds[0], bounds[1]);
                ctx.fillRect(0, 0, bounds[0], bounds[1]);
                let i = 0;
                const squareSize:number = dim;
                for(let y = 0; y < bounds[1] + 100; y += squareSize)
                {
                    let offset = +(i % 2 === 0);
                    for(let x = offset*squareSize ; x < bounds[0] + 200; x += squareSize*2)
                    {
                        ctx.clearRect(x,  y, squareSize, squareSize);
                    }
                    i++;
                }
                break;

                case(LayeredDrawingScreen.white_background):
                ctx.fillStyle = "#FFFFFF";
                ctx.globalAlpha = 1;
                ctx.fillRect(0, 0, bounds[0], bounds[1]);
                break;

                case(LayeredDrawingScreen.black_background):
                ctx.fillStyle = "#000000";
                ctx.globalAlpha = 1;
                ctx.fillRect(0, 0, bounds[0], bounds[1]);
                break;
            }
    }
    swapLayers(x1:number, x2:number):void
    {
        if(x1 >= 0 && x1 < this.layers.length && x2 < this.layers.length && x2 >= 0)
        {
            const temp:DrawingScreen = this.layers[x1];
            const temp2:boolean = this.layersState[x1];
            this.layers[x1] = this.layers[x2];
            this.layers[x2] = temp;
            this.layersState[x1] = this.layersState[x2];
            this.layersState[x2] = temp2;
            this.redraw = true;
        }
    }
    layer():DrawingScreen {
        return this.layers[this.selected];
    }
    deleteLayer(index:number): void
    {
        if(this.layers.length > 1 && this.layers.length > index && index >= 0)
        {
            this.layers.splice(index, 1);
            this.layersState.splice(index, 1);
            if(this.selected && this.selected >= this.layers.length)
                this.selected = this.layers.length - 1;
            this.redraw = true;
        }
    }
    loadImageToLayer(image:HTMLImageElement):void
    {
        const bounds:number[] = [image.width, image.height];
        this.offscreenCanvas.width = bounds[0];
        this.offscreenCanvas.height = bounds[1];
        const sprite:Sprite = new Sprite([], bounds[0], bounds[1], false);
        this.setDimOnCurrent([bounds[0], bounds[1]]);
        const ctx:CanvasRenderingContext2D = this.offscreenCanvas.getContext("2d")!;
        ctx.clearRect(0, 0, bounds[0], bounds[1]);
        ctx.drawImage(image, 0, 0);
        sprite.imageData = ctx.getImageData(0, 0, bounds[0], bounds[1]);
        sprite.pixels = sprite.imageData.data;
        const layer:DrawingScreen = this.layers[this.layers.length - 1];
        this.selected = this.layers.length - 1;
        sprite.width = bounds[0];
        sprite.height = bounds[1];
        sprite.copyToBuffer(layer.screenBuffer, bounds[0], bounds[1]);
    }

    addBlankLayer():DrawingScreen
    {
        let finalDim:number[] | null = null;
        if(this.toolSelector.settingsTool)
        {
            finalDim = this.toolSelector.settingsTool.dim;
        }
        const dim:number[] = this.layers[0] ? [this.layers[0].dimensions.first, this.layers[0].dimensions.second] : this.dim;
        const layer:DrawingScreen = new DrawingScreen(
            document.createElement("canvas"), this.keyboardHandler, this.pallette, [0, 0], [128, 128], this.toolSelector, this.state, this.clipBoard);
        layer.setDim(dim);
        
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
            if(blob)
            {
                a.href = window.URL.createObjectURL(blob);
                a.download = fileName;
                a.click();
            }
        });
    }
    selectionToSprite(x:number, y:number, width:number, height:number)
    {
        //set offscreen canvas state, and get ctx for rescale

        const widthCanvasSpace:number = Math.floor((width-this.layer()!.offset.first)/this.layer()!.bounds.first*this.layer()!.dimensions.first);
        const heightCanvasSpace:number = Math.floor((height-this.layer()!.offset.second)/this.layer()!.bounds.second*this.layer()!.dimensions.second);
        this.offscreenCanvas.width = widthCanvasSpace;
        this.offscreenCanvas.height = heightCanvasSpace;
        const ctx:CanvasRenderingContext2D = this.offscreenCanvas.getContext("2d")!;
        for(let i = 0; i < this.layers.length; i++)
        {
            if(this.layersState[i] && this.layers[i].drawWithAlpha)
            {
                const sprite:Sprite = this.layers[i].selectionToSprite([x, y, width, height]);
                const oldAlpha:number = ctx.globalAlpha;
                if(oldAlpha !== this.layers[i].drawWithAlpha) {
                    ctx.globalAlpha = this.layers[i].drawWithAlpha;
                    ctx.drawImage(sprite.image, 0, 0);
                    ctx.globalAlpha = oldAlpha;
                }
                else
                    ctx.drawImage(sprite.image, 0, 0);
            }
            
        }
        const result:Sprite = new Sprite([], widthCanvasSpace, heightCanvasSpace, false);
        result.imageData = ctx.getImageData(0, 0, widthCanvasSpace, heightCanvasSpace);
        result.pixels = result.imageData.data;
        result.refreshImage();
        return result;
    }
    toSprite():Sprite
    {
        //set offscreen canvas state, and get ctx for rescale
        this.offscreenCanvas.width = this.layer().dimensions.first;
        this.offscreenCanvas.height = this.height();
        const ctx:CanvasRenderingContext2D = this.offscreenCanvas.getContext("2d")!;
        //rescale main canvas with offscreen canvas

        for(let i = 0; i < this.layers.length; i++)
        {
            if(this.layersState[i] && this.layers[i].drawWithAlpha)
            {
                const layer:DrawingScreen = this.layers[i];
                layer.drawToContextAsSprite(ctx, 0, 0, this.layer().dimensions.first, this.layer().dimensions.second);
            }
        }
        //save rescaled offscreen canvas to sprite
        const sprite:Sprite = new Sprite([], this.layer().dimensions.first, this.layer().dimensions.second, false);
        sprite.imageData = ctx.getImageData(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
        sprite.pixels = sprite.imageData.data;
        sprite.refreshImage();

        return sprite;
    }
    renderMiniMap(canvas:HTMLCanvasElement, ctx:CanvasRenderingContext2D, x:number, y:number, width:number, height:number): void
    {
        if(this.miniMapAlpha !== 0)
        {
            const zoomedWidth:number = this.width() * this.zoom.zoomX;
            const zoomedHeight:number = this.height() * this.zoom.zoomY;
            if(this.offscreenCanvas.width !== width || this.offscreenCanvas.height !== height)
            {
                this.offscreenCanvas.width = width;
                this.offscreenCanvas.height = height
            }
            const renderingCtx:CanvasRenderingContext2D = this.offscreenCanvas.getContext("2d")!;
            const fullCanvas:number[] = [0, 0, width, height];
            renderingCtx.clearRect(0, 0, width, height);
            renderingCtx.lineWidth = 3;
            renderingCtx.fillStyle = `rgba(125, 125, 125, ${this.miniMapAlpha})`;
            renderingCtx.globalAlpha = this.miniMapAlpha;
            renderingCtx.fillRect(0, 0, width, height);
            renderingCtx.lineWidth = 1;
            let projectionRect:number[] = [0, 0, 0, 0];
            if((this.height() / this.width()) <= 1)
                projectionRect = [fullCanvas[0], fullCanvas[1], fullCanvas[2],(this.height() / this.width()) * fullCanvas[3]];
            else //if((this.width() / this.height()) < 1)
                projectionRect = [fullCanvas[0], fullCanvas[1], (this.width() / this.height()) * fullCanvas[2], fullCanvas[3]];
            projectionRect[0] += width / 2 - projectionRect[2] / 2;
            projectionRect[1] += height / 2 - projectionRect[3] / 2;
            
            const view:number[] = [(-this.zoom.zoomedX / zoomedWidth) * projectionRect[2] + projectionRect[0], (-this.zoom.zoomedY / zoomedHeight) * projectionRect[3] + projectionRect[1], canvas.width / zoomedWidth * projectionRect[2], canvas.height / zoomedHeight * projectionRect[3]];
            
            renderingCtx.drawImage(this.canvas, projectionRect[0], projectionRect[1], projectionRect[2], projectionRect[3]);
            renderingCtx.strokeRect(1, 1, width-2, height-2);

            if(this.height() / this.width() !== 1)
            {
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
    draw(canvas:HTMLCanvasElement, ctx:CanvasRenderingContext2D, x:number, y:number, width:number, height:number):void 
    {
        this.renderDim[0] = width;
        this.renderDim[1] = height;
        ctx.clearRect(0, 0, width, height);
        const zoomedWidth:number = this.width() * this.zoom.zoomX;
        const zoomedHeight:number = this.height() * this.zoom.zoomY;
            this.zoom.zoomedX = x  - this.zoom.offsetX + (width - zoomedWidth) / 2;
            this.zoom.zoomedY = y  - this.zoom.offsetY + (height - zoomedHeight) / 2;
        if(this.repaint())
        {
            this.redraw = false;
            this.ctx.imageSmoothingEnabled = false;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.canvasBackground, 0, 0);
            if(this.toolSelector.settingsTool.checkboxPixelGrid.checked)
                this.ctx.drawImage(this.canvasPixelGrid, 0, 0, this.canvas.width, this.canvas.height);
            for(let i = 0; i < this.layers.length; i++)
            {
                if(this.layersState[i])
                {
                    const layer:DrawingScreen = this.layers[i];
                    layer.drawToContext(this.ctx, 0, 0, this.width(), this.height());
                }
            }
        }
        {
            if(this.backgroundState === LayeredDrawingScreen.black_background)
            {
                ctx.fillStyle = "#FFFFFF";
            }
            else
            {
                ctx.fillStyle = "#000000";
            }
            ctx.fillRect(0,0,this.zoom.zoomedX, height);
            ctx.fillRect(0,0,width, this.zoom.zoomedY);
            ctx.fillRect(this.zoom.zoomedX + zoomedWidth, 0, width, height);
            ctx.fillRect(0, this.zoom.zoomedY + zoomedHeight, width, height);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(this.canvas, this.zoom.zoomedX, this.zoom.zoomedY, zoomedWidth, zoomedHeight);
            if(this.toolSelector.selectionTool.checkboxComplexPolygon.checked && this.toolSelector.polygon.length)
            {
                const cellWidth = this.zoom.zoomX * this.width() / this.width();
                const cellHeight = this.zoom.zoomY * this.height() / this.height();
                let start = this.toolSelector.polygon.length - 1;
                ctx.lineWidth = cellWidth;
                ctx.beginPath();
                ctx.strokeStyle = "#FF4040";
                for(let i = 0; i < this.toolSelector.polygon.length; i++)
                {
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
                if(!this.toolSelector.drawingScreenListener.registeredTouch)
                {
                    ctx.fillStyle = "#0000FF";
                    ctx.moveTo(this.toolSelector.polygon[lastIndex][0] * cellWidth + this.zoom.zoomedX, this.toolSelector.polygon[lastIndex][1] * cellHeight + this.zoom.zoomedY);
                    ctx.ellipse(this.toolSelector.polygon[lastIndex][0] * cellWidth + this.zoom.zoomedX, this.toolSelector.polygon[lastIndex][1] * cellHeight + this.zoom.zoomedY, 5, 5, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.fillStyle = "#000000";
                ctx.strokeStyle = "#000000";
            }
            else if(this.state.selectionSelectionRect[3] !== 0 && this.state.selectionSelectionRect[4] !== 0)
            {
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#FF0000";
                ctx.strokeRect(this.state.selectionSelectionRect[0] * this.zoom.zoomX + this.zoom.zoomedX, this.state.selectionSelectionRect[1] * this.zoom.zoomY + this.zoom.zoomedY, this.state.selectionSelectionRect[2] * this.zoom.zoomX, this.state.selectionSelectionRect[3] * this.zoom.zoomY);

                ctx.strokeStyle = "#000000";
            }
            
            ctx.strokeRect(this.zoom.zoomedX, this.zoom.zoomedY, zoomedWidth, zoomedHeight);
            if((zoomedHeight > canvas.height || zoomedWidth > canvas.width) || this.toolSelector.settingsTool.checkboxAlwaysShowMiniMap.checked)
            {
                this.zoom.miniMapRect[0] = canvas.width - this.zoom.miniMapRect[2];
                this.zoom.miniMapRect[1] = canvas.height - this.zoom.miniMapRect[3];
                this.renderMiniMap(canvas, ctx, this.zoom.miniMapRect[0], this.zoom.miniMapRect[1], this.zoom.miniMapRect[2], this.zoom.miniMapRect[3]);
            }

            
        }
    }
};
class Pallette {
    highLightedCell:number;
    selectedPixelColor:RGB;
    selectedBackColor:RGB;
    colors:Array<RGB>;
    canvas:any;
    listeners:SingleTouchListener;
    keyboardHandler:KeyboardHandler;
    ctx:any;
    repaint:boolean;
    renderedSpace:number[];
    constructor(canvas:any, keyboardHandler:KeyboardHandler, colorCount:number = 10, colors:Array<RGB> | null = null)
    {
        this.repaint = true;
        this.canvas = canvas;
        this.renderedSpace = [0, 0];
        this.keyboardHandler = keyboardHandler;
        this.ctx = canvas.getContext("2d")!;
        this.highLightedCell = 0;
        this.listeners = new SingleTouchListener(canvas, true, true, true);
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
        this.selectedPixelColor = new RGB(0,0,0);
        this.selectedBackColor = new RGB(0,0,0);
        this.selectedPixelColor.color = this.colors[0].color;
        this.selectedBackColor.color = this.colors[1].color;
        this.listeners.registerCallBack("touchstart", (e:any) => true, (e:any) => {
            (<any>document.activeElement).blur();
            this.handleClick(e);
            this.repaint = true;
        });
        this.listeners.registerCallBack("touchmove", (e:any) => true, (e:any) => {
            (<any>document.activeElement).blur();
            this.handleClick(e);
            this.repaint = true;
        });
        this.keyboardHandler.registerCallBack("keydown", (e:any) => true, (e:any) => {
            this.repaint = true;
        });
        this.keyboardHandler.registerCallBack("keyup", (e:any) => true, (e:any) => this.repaint = true);

    }
    changeSize(newSize:number):void {
        if(newSize !== 0)
        {
            if(newSize > this.colors.length)
            {
                const diff:number = newSize - this.colors.length;
                for(let i = 0; i < diff; i++)
                {
                    this.colors.push(new RGB(0, 0, 0, 0));
                }
            }
            else
            {
                const deleteCount:number = this.colors.length - newSize;
                this.colors.splice(newSize, deleteCount);
            }
        }
    }
    calcColor(i:number):RGB
    {
        const color = new RGB(this.colors[i].red(), this.colors[i].green(), this.colors[i].blue(), this.colors[i].alpha());
        return color;
    }
    handleClick(event:any):void
    {
        const clicked:number = Math.floor((event.touchPos[0] / this.canvas.width) * (this.colors.length+2));
        if(clicked > -1)
        {
            if(!event.button)
            {
                this.selectedPixelColor.color = this.colors[clicked - 2].color;
            }
            else
            {
                this.selectedBackColor.color = this.colors[clicked - 2].color;
            }
            this.highLightedCell = clicked - 2;
        }
    }
    setSelectedColor(color:string)
    {
        this.colors[this.highLightedCell].loadString(color);
        this.selectedPixelColor.loadString(color);
    }
    cloneColor(color:RGB):RGB
    {
        const newc = new RGB(0,0,0,0);
        newc.copy(color);
        return newc;
    }
    draw():void
    {
        if(this.repaint)
        {
            const ctx = this.ctx;
            const width:number = (this.canvas.width/(this.colors.length+2));
            const height:number = this.canvas.height;
            ctx.clearRect(0, 0, width * (this.colors.length + 2), height);
            
            let j = 2;
            for(let i = 0; i < this.colors.length; i++, j++)
            {
                ctx.fillStyle = this.calcColor(i).htmlRBGA();
                ctx.fillRect(j * width, 0, width, height);
                ctx.strokeRect(j * width, 0, width, height);
    
                if(this.highLightedCell == i)
                for(let j = 0; j < height && j < width; j += 5)
                    if(width - j * 2 > 0){
                        ctx.strokeRect((this.highLightedCell + 2) * width + j, j, width - j * 2, height - j*2);
                    }
                if(i < 10)
                {
                    this.ctx.font = '18px Calibri';
                    const visibleColor:RGB = (this.calcColor(i));
                    this.ctx.strokeStyle = "#FFFFFF";
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeText((i+1)%10,j * width+width*0.5 - 3, height/2 + 4);
                    visibleColor.setBlue(Math.floor(visibleColor.blue()/2));
                    visibleColor.setRed(Math.floor(visibleColor.red()/2));
                    visibleColor.setGreen(Math.floor(visibleColor.green()/2));
                    visibleColor.setAlpha(255);
                    this.ctx.fillStyle = visibleColor.htmlRBGA();
                    this.ctx.fillText((i+1)%10, j*width+width*0.5 - 3, height/2 + 4);
                    this.ctx.strokeStyle = "#000000";
                    this.ctx.lineWidth = 1;
                }
            }
            {
                ctx.fillStyle = this.selectedPixelColor.htmlRBGA();
                ctx.fillRect(0, 0, width, height);
                ctx.fillStyle = this.selectedBackColor.htmlRBGA();
                ctx.fillRect(width, 0, width, height);
                for(let j = 0; j < height * 1/5; j += 2)
                {
                    this.ctx.strokeStyle = "#000000";
                    ctx.strokeRect(j, j, width - j*2, height - j*2);
                    ctx.strokeRect(width + j, j, width - j*2, height - j*2);
                    this.ctx.strokeStyle = "#FF0000";
                    ctx.strokeRect(j, j, width - j*2, height - j*2);
                    this.ctx.strokeStyle = "#0000FF";
                    ctx.strokeRect(width + j, j, width - j*2, height - j*2);
                }
            }
        }
    }
};
function buildSpriteAnimationFromBuffer(buffer:Int32Array, index:number):Pair<SpriteAnimation, number>
{
    const size:number = buffer[index++];
    const type:number = buffer[index++];
    const width:number = buffer[index + 2] >> 16;
    const height:number = buffer[index + 2] & ((1 << 16) - 1);
    if(type !== 2)
        throw new Error("Corrupted project file animation type should be: 2, but is: " + type.toString());
    let i:number = 2;
    const animation:SpriteAnimation = new SpriteAnimation(0, 0, width, height);

    for(; i < size - 2;)
    {
        const result:Pair<Sprite, number> = buildSpriteFromBuffer(buffer, index);
        index += result.second;
        i += result.second;
        animation.pushSprite(result.first);
    }
    let spriteMemory:number = 0;
    animation.sprites.forEach((sprite:Sprite) => spriteMemory += (sprite.pixels.length >> 2) + 3);
    if(spriteMemory !== size - 2)
        throw new Error("Error invalid group size: " + size.toString() + " should be: " + size.toString());
    return new Pair(animation, size);
}
function buildAnimationGroupFromBuffer(buffer:Int32Array, index:number, groupsSelector:AnimationGroupsSelector): number
{
    const size:number = buffer[index++];
    const type:number = buffer[index++];
    if(type !== 1)
        throw new Error("Corrupted project file animation group type should be: 1, but is: " + type.toString());
    
    const group:AnimationGroup = groupsSelector.createEmptyAnimationGroup();
    let i = 0;
    while(i < size - 2)
    {
        const result:Pair<SpriteAnimation, number> = buildSpriteAnimationFromBuffer(buffer, index);
        i += result.second;
        index += result.second;
        group.pushAnimationOnly(result.first);
    }
    return size;
}
function buildGroupsFromBuffer(buffer:Int32Array, groupsSelector:AnimationGroupsSelector):number
{
    let index:number = 0;
    groupsSelector.animationGroups = [];
    groupsSelector.selectedAnimationGroup = 0;
    const size:number = buffer[index++];
    const type:number = buffer[index++];
    if(type !== 0)
        throw new Error("Corrupted project file group of animation groups type should be: 0, but is: " + type.toString());
    if(size !== buffer.length)
        throw Error("Corrupted file, sie does not match header value of: "+size.toString()+" instead it is: " + buffer.length);
    let i:number = 0;
    while(i < size - 2)
    {
        const result:number = buildAnimationGroupFromBuffer(buffer, index, groupsSelector);
        i += result;
        index += result;
    }
    return size;
}

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
    dragSprite:Sprite | null;
    dragSpriteLocation:Array<number>;
    constructor(canvas:HTMLCanvasElement, listener:SingleTouchListener, drawingField:LayeredDrawingScreen, animationGroup:AnimationGroup, keyboardHandler:KeyboardHandler, spritesPerRow:number, width:number, height:number)
    {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d")!;
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
        this.listener = listener;
        this.spritesCount = this.sprites()?this.sprites()!.length:0;
       
    }
    handleTouchEvents(type:string, e:any):void
    {
        const clickedSprite:number = Math.floor(e.touchPos[0]/this.canvas.width*this.spritesPerRow) + this.spritesPerRow*Math.floor(e.touchPos[1] / this.spriteHeight);
        switch(type) {
            case("touchstart"):
            (<any>document.activeElement).blur();
            break;
            case("touchmove"):
            if(e.moveCount === 3 && this.sprites() && this.sprites()![clickedSprite] && this.sprites()!.length > 1)
            {
                if(this.keyboardHandler.keysHeld["AltLeft"] || this.keyboardHandler.keysHeld["AltRight"])
                {
                    const dragSprite = new Sprite([],1,1);
                    dragSprite.copySprite(this.sprites()![clickedSprite]);
                    dragSprite.refreshImage();
                    this.dragSprite = dragSprite;

                }
                else
                    this.dragSprite = this.sprites()!.splice(clickedSprite, 1)[0];
                this.dragSpriteLocation[0] = e.touchPos[0];
                this.dragSpriteLocation[1] = e.touchPos[1];
            }
            else if(e.moveCount > 3)
            {
                this.dragSpriteLocation[0] += e.deltaX;
                this.dragSpriteLocation[1] += e.deltaY;
            }
        
        break;
        case("touchend"):
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            if(this.sprites() && clickedSprite >= 0 && this.dragSprite !== null)
            {
                this.sprites()!.splice(clickedSprite, 0, this.dragSprite);
                this.spritesCount = this.sprites()!.length;
                this.dragSprite = null;
            }
            if(this.sprites() && this.sprites()![clickedSprite])
            {
                this.selectedSprite = clickedSprite;

                const sprite:Sprite = this.sprites()![clickedSprite];
                if(sprite.width !== this.drawingField.layer().spriteScreenBuf.width || sprite.height !== this.drawingField.layer().spriteScreenBuf.height)
                {
                    this.drawingField.setDimOnCurrent([sprite.width, sprite.height]);
                }
                this.drawingField.layer().loadSprite(sprite);
            }
            else if(this.sprites() && this.sprites()!.length > 1)
                this.selectedSprite = this.sprites()!.length - 1;
            else
                this.selectedSprite = 0;
        break;
        }
    }
    update()
    {
        if(this.sprites())
        {
            if((1+Math.floor(this.sprites()!.length / this.spritesPerRow) * this.spriteHeight) > this.canvas.height)
            {
                this.canvas.height = (1+Math.floor(this.sprites()!.length / this.spritesPerRow)) * this.spriteHeight;
            }
            if(this.spritesCount !== this.sprites()!.length)
            {
                this.spritesCount = this.sprites()?this.sprites()!.length:0;
                this.selectedSprite = this.spritesCount - 1;
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
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                const touchX:number = Math.floor(this.listener.touchPos[0] / this.canvas.width * this.spritesPerRow);
                const touchY:number = Math.floor(this.listener.touchPos[1] / this.canvas.height * Math.floor(this.canvas.height / this.spriteHeight));
                let setOffForDragSprite:number = 0;
                for(let i = 0; i < this.sprites()!.length; i++)
            {
                if(this.dragSprite && i === touchX + touchY * this.spritesPerRow)
                    setOffForDragSprite++;
                const x:number = (setOffForDragSprite % this.spritesPerRow) * this.spriteWidth;
                const y:number = Math.floor(setOffForDragSprite / this.spritesPerRow) * this.spriteHeight;
                this.sprites()![i].draw(this.ctx, x, y, this.spriteHeight, this.spriteWidth);
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
        if(this.sprites() && this.sprites()!.length > 1)
            this.sprites()!.splice(this.selectedSprite--, 1);
    }
    pushSelectedToCanvas()
    {
        const spriteWidth:number = this.drawingField.width();
        const spriteHeight:number = this.drawingField.layer().dimensions.second;
        if(this.selectedSpriteVal())
        {
            this.selectedSpriteVal()!.copySprite(this.drawingField.toSprite());
            this.selectedSpriteVal()!.refreshImage();
        }
    }
    selectedSpriteVal():Sprite | null
    {
        if(this.sprites())
            return this.sprites()![this.selectedSprite];
        return null;
    }
    sprites():Array<Sprite> | null
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
    dragSprite:SpriteAnimation | null;
    dragSpritePos:number[];
    listener:SingleTouchListener;
    spriteSelectorListener:SingleTouchListener;
    constructor(listener:SingleTouchListener, spriteSelectorListener:SingleTouchListener, drawingField:LayeredDrawingScreen, keyboardHandler:KeyboardHandler, animiationsID:string, animationsSpritesID:string, spritesPerRow:number = 10, spriteWidth:number = 64, spriteHeight:number = 64, animationWidth:number = 128, animationHeight:number = 128, animationsPerRow:number = 5)
    {
        this.drawingField = drawingField;
        this.keyboardHandler = keyboardHandler;
        this.spriteSelectorListener = spriteSelectorListener;
        this.animationDiv = document.getElementById(animiationsID);
        this.animations = new Array<SpriteAnimation>();
        this.animationCanvas = <HTMLCanvasElement> document.getElementById(animiationsID);
        this.selectedAnimation = 0;
        this.animationsPerRow = animationsPerRow;
        this.animationWidth = animationWidth;
        this.animationHeight = animationHeight;
        this.listener = listener;
        this.dragSpritePos = [0, 0];
        this.spriteSelector = new SpriteSelector(<HTMLCanvasElement> document.getElementById(animationsSpritesID)!, spriteSelectorListener, this.drawingField, this, keyboardHandler, spritesPerRow, spriteWidth, spriteHeight);
        this.dragSprite = null;
        this.autoResizeCanvas();
    }
    handleTouchEvents(type:string, e:any): void
    {
        switch(type)
        {
            case("touchstart"):
            (<any>document.activeElement).blur();
            break;
            case("touchmove"):
            if(e.moveCount === 1 && this.animations.length > 1)
            { 
                const clickedSprite:number = Math.floor(e.touchPos[0] / this.spriteSelector.spriteWidth) + Math.floor(e.touchPos[1] / this.spriteSelector.spriteHeight) * this.animationsPerRow;
    
                this.dragSprite = this.animations.splice(clickedSprite, 1)[0];
                this.dragSpritePos[0] = e.touchPos[0] - this.animationWidth / 2;
                this.dragSpritePos[1] = e.touchPos[1] - this.animationWidth / 2;
            }
            else if(e.moveCount > 1)
            {
                this.dragSpritePos[0] += e.deltaX;
                this.dragSpritePos[1] += e.deltaY;
            }
            break;
            case("touchend"):
            let clickedSprite:number = Math.floor(e.touchPos[0] / this.animationWidth) + Math.floor(e.touchPos[1] / this.animationHeight) * this.animationsPerRow;

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
                if(this.spriteSelector.sprites()!.length)
                {
                    const sprite:Sprite = this.spriteSelector.sprites()![0];
                    if(sprite.width !== this.drawingField.layer().spriteScreenBuf.width || sprite.height !== this.drawingField.layer().spriteScreenBuf.height)
                    {
                        this.drawingField.setDimOnCurrent([sprite.width, sprite.height]);
                    }
                    sprite.copyToBuffer(this.drawingField.layer().screenBuffer, this.drawingField.layer().dimensions.first, this.drawingField.layer().dimensions.second);
                }
            }

        }
    }
    pushAnimationOnly(animation:SpriteAnimation):void {
        
        this.animations.push(animation);
        //resize canvas if necessary
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
    cloneAnimation(index:number):SpriteAnimation | null
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
        const sprite:Sprite = new Sprite([], 0,0);
        sprite.copySprite(this.drawingField.toSprite());
        sprite.refreshImage();
        sprites.push(sprite);
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
            const sprite:Sprite = new Sprite([], 0,0);
            sprite.copySprite(this.drawingField.toSprite());
            sprite.refreshImage();
            sprites.push(sprite);
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
    buildFromBinary(binary:Int32Array):AnimationGroup[]
    {
        let i = 1;
        const groupSize:number = binary[i];
        const color:RGB = new RGB(0, 0, 0, 0);
        const groups:AnimationGroup[] = [];
        let j:number = 0;
        //while(j < binary.length)
        {
            if(j != 0)
                throw new Error("Corrupted File, animation group project header corrupted");
            const animationSize:number = binary[i+1];
            groups.push(new AnimationGroup(this.listener, this.spriteSelectorListener, this.drawingField, this.keyboardHandler, "animations", "sprites_canvas", this.spriteSelector.spritesPerRow, this.spriteSelector.spriteWidth, this.spriteSelector.spriteHeight)
                );
            if(binary[i + 2] != 1)
                throw new Error("Corrupted File, animation header corrupted value is:" + binary[(i+2)] + " should be 1");
            for(;j < groupSize; j += animationSize)
            {
                const animationSize:number = binary[i + j + 2];
                groups[groups.length - 1].animations.push(new SpriteAnimation(0, 0, this.spriteSelector.spriteWidth, this.spriteSelector.spriteHeight));
                const animations:SpriteAnimation[] = groups[groups.length - 1].animations;
                const sprites:Sprite[] = animations[animations.length - 1].sprites;
                let k = 0;
                const spriteSize:number = binary[i + j + 5];
                if(binary[i + j + 6] != 2)
                    throw new Error("Corrupted sprite header file value is: " + binary[i + j + 6] + ", and should be 2");
                for(; k < animationSize; k += spriteSize)
                {
                    const spriteSize:number = binary[i + j + k + 5];
                    const type:number = binary[i + j + k + 6];
                    const spriteWidth:number = binary[i + j + k + 7] & ((1<<16)-1);
                    const spriteHeight:number = binary[i + j + k + 7] >> 16;
                    let binaryPixelIndex:number = i + j + k + 8;
                    let l:number = 0;
                    const sprite:Sprite = new Sprite([], spriteWidth, spriteHeight);
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
            i += groupSize;
        }
        return groups;
    }
    toBinary(buffer:Int32Array, index:number):number
    {
        const size:number = this.binaryFileSize();
        buffer[index++] = size;
        buffer[index++] = 1;
        this.animations.forEach(animation => index = animation.saveToUint32Buffer(buffer, index));
        return index;
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
        let ctx1:CanvasRenderingContext2D | null;
        if((ctx1 = this.animationCanvas.getContext("2d")) && position.top < window.innerHeight && position.bottom >= 0) 
        {
            const ctx:CanvasRenderingContext2D = ctx1;
            ctx.clearRect(0, 0, this.animationCanvas.width, this.animationCanvas.height);
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
    dragAnimationGroup:Pair<AnimationGroup, Pair<number> > | null;
    dragAnimationGroupPos:number[];
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    keyboardHandler:KeyboardHandler;
    listener:SingleTouchListener;
    listenerAnimationsSelector:SingleTouchListener;
    listenerSpritesSelector:SingleTouchListener;
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
        this.selectedAnimationGroup = 0;
        this.field = field;
        this.dragAnimationGroup = null;
        this.dragAnimationGroupPos = [0, 0];
        this.spritesPerRow = spritesPerRow;
        this.renderWidth = renderWidth;
        this.renderHeight = renderHeight;
        this.canvas = <HTMLCanvasElement> document.getElementById(animationGroupSelectorId);
        this.canvas.height = renderHeight;
        this.canvas.width = renderWidth * spritesPerRow;
        this.ctx = this.canvas.getContext("2d")!;
        this.animationsCanvasId = animationsCanvasId;
        this.spritesCanvasId = spritesCanvasId;
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.keyboardHandler = keyboardHandler;
        this.listener = new SingleTouchListener(this.canvas, true, true);
        this.listener.registerCallBack("touchstart", (e:any) => true, (e:any) => {
            (<any>document.activeElement).blur();
        });
        this.listener.registerCallBack("touchmove", (e:any) => true, (e:any) => {
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
        this.listener.registerCallBack("touchend", (e:any) => true, (e:any) => {
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

        this.listenerAnimationsSelector = new SingleTouchListener(document.getElementById(animationsCanvasId), false, true);
        this.listenerAnimationsSelector.registerCallBack("touchstart", (e:any) => true, (e:any) => {
            const group:AnimationGroup | null = this.animationGroup();
            if(group)
            {
                group.handleTouchEvents("touchstart", e);
            }
        });
        this.listenerAnimationsSelector.registerCallBack("touchmove", (e:any) => true, (e:any) => {
            const group:AnimationGroup | null = this.animationGroup();
            if(group)
            {
                group.handleTouchEvents("touchmove", e);
            }
        });
        this.listenerAnimationsSelector.registerCallBack("touchend", (e:any) => true, (e:any) => {
            const group:AnimationGroup | null = this.animationGroup();
            if(group)
            {
                group.handleTouchEvents("touchend", e);
            }
        });
        this.listenerSpritesSelector = new SingleTouchListener(document.getElementById(spritesCanvasId), false, true);
        this.listenerSpritesSelector.registerCallBack("touchstart", (e:any) => true, (e:any) => {
            const group:AnimationGroup | null = this.animationGroup();
            if(group && group.spriteSelector)
            {
                group.spriteSelector.handleTouchEvents("touchstart", e);
            }
        });
        this.listenerSpritesSelector.registerCallBack("touchmove", (e:any) => true, (e:any) => {
            const group:AnimationGroup | null = this.animationGroup();
            if(group && group.spriteSelector)
            {
                group.spriteSelector.handleTouchEvents("touchmove", e);
            }
        });
        this.listenerSpritesSelector.registerCallBack("touchend", (e:any) => true, (e:any) => {
            const group:AnimationGroup | null = this.animationGroup();
            if(group && group.spriteSelector)
            {
                group.spriteSelector.handleTouchEvents("touchend", e);
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
    buildFromBinary(binary:Int32Array):void
    {
        /*const groups:AnimationGroup[] = this.animationGroup().buildFromBinary(binary);
        this.animationGroups = [];
        this.selectedAnimationGroup = 0;
        groups.forEach(el => {
            this.animationGroups.push(new Pair(el, new Pair(0,0)));
        })*/
        buildGroupsFromBuffer(rleDecode(binary), this);
    }
    toBinary():Int32Array {
        const size:number = this.binaryFileSize();
        const data:Int32Array = new Int32Array(size);
        let index = 0;
        data[index++] = size;
        data[index++] = 0;
        this.animationGroups.forEach(group => {
            index = group.first.toBinary(data, index);
        });
        return data;
    }
    saveAs(name:string):void {
        saveBlob(new Blob([rleEncode(this.toBinary())],{type: "application/octet-stream"}), name);
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
    createEmptyAnimationGroup():AnimationGroup {
        this.animationGroups.push(new Pair(new AnimationGroup(this.listenerAnimationsSelector, this.listenerSpritesSelector, this.field, this.keyboardHandler, this.animationsCanvasId, this.spritesCanvasId, 5, this.spriteWidth, this.spriteHeight), new Pair(0,0)));
        this.autoResizeCanvas();
        return this.animationGroups[this.animationGroups.length-1].first;
    }
    createAnimationGroup():AnimationGroup
    {
        this.animationGroups.push(new Pair(new AnimationGroup(this.listenerAnimationsSelector, this.listenerSpritesSelector, this.field, this.keyboardHandler, this.animationsCanvasId, this.spritesCanvasId, 5, this.spriteWidth, this.spriteHeight), new Pair(0,0)));
        this.animationGroups[this.animationGroups.length-1].first.pushAnimation(new SpriteAnimation(0, 0, dim[0], dim[1]));
        this.autoResizeCanvas();
        return this.animationGroups[this.animationGroups.length-1].first;
    }
    animationGroup():AnimationGroup | null
    {
        if(this.selectedAnimationGroup >= 0 && this.selectedAnimationGroup < this.animationGroups.length)
        {
            return this.animationGroups[this.selectedAnimationGroup].first;
        }
        return null;
    }
    pushAnimationToSelected(animation:SpriteAnimation):void
    {
        const group:AnimationGroup | null = this.animationGroup();
        if(group)
            group.pushAnimation(animation);
    }
    inSelectedAnimationBounds(animationIndex:number):boolean
    {
        const group:AnimationGroup | null = this.animationGroup();
        if(group)
            return (animationIndex >= 0 && animationIndex < group.animations.length)
        return false;
    }
    cloneAnimationFromSelected(animationIndex:number):void
    {
        const group:AnimationGroup | null = this.animationGroup();
        if(group)
            group.cloneAnimation(animationIndex);
    }
    cloneSelectedAnimationGroup():void
    {
        this.animationGroups.push(new Pair(new AnimationGroup(this.listenerAnimationsSelector, this.listenerSpritesSelector, this.field, this.keyboardHandler, this.animationsCanvasId, this.spritesCanvasId, 5, this.spriteWidth, this.spriteHeight), new Pair(0,0)));
        const animationGroup:AnimationGroup = this.animationGroups[this.animationGroups.length - 1].first;
        
        const group:AnimationGroup | null = this.animationGroup();
        if(group)
            group.animations.forEach(animation => {
            animationGroup.pushAnimation(animation.cloneAnimation());
        });
        this.autoResizeCanvas();
    }
    deleteAnimationFromSelected(animationIndex:number):void
    {
        const group:AnimationGroup | null = this.animationGroup();
        if(group)
            group.deleteAnimation(animationIndex);
    }
    pushSpriteToSelected():void
    {
        const group:AnimationGroup | null = this.animationGroup();
        if(group)
            group.pushSprite();
    }
    pushSelectedSpriteToCanvas():void
    {
        const group:AnimationGroup | null = this.animationGroup();
        if(group)
            group.spriteSelector.pushSelectedToCanvas();
    }
    deleteSelectedSprite():void
    {
        const group:AnimationGroup | null = this.animationGroup();
        if(group)
            group.spriteSelector.deleteSelectedSprite();
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
    selectedAnimation():SpriteAnimation | null
    {
        const group:AnimationGroup | null = this.animationGroup();
        if(group)
            return group.animations[group.selectedAnimation];
        return null;
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
        let group:AnimationGroup | null;
        if(group = this.animationGroup())
        {
            group.draw();
        }
        const position:DOMRect = this.canvas.getBoundingClientRect();
        if(position.top < window.innerHeight && position.bottom >= 0) 
        {
            const ctx:CanvasRenderingContext2D = this.ctx;
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
function saveBlob(blob:Blob, fileName:string){
    const a:HTMLAnchorElement = document.createElement("a");
    if(blob)
    {
        a.href = window.URL.createObjectURL(blob);
        a.download = fileName;
        a.click();
    }
}

  
async function main()
{
    const canvas:HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("screen");
    let maybectx:CanvasRenderingContext2D | null = canvas.getContext("2d");
    if(!maybectx)
        return;
    const ctx:CanvasRenderingContext2D = maybectx;
    let field:LayeredDrawingScreen;
    const multiTouchHandler:MultiTouchListener =  new MultiTouchListener(canvas, false, true, false);
    multiTouchHandler.registerCallBack("pinch", (e:any) => {
        {
            let delta:number = 0;
            if(field.zoom.zoomX < 1.05)
            {
                delta = 0.01;
            }
            else if(field.zoom.zoomX < 3)
            {
                delta = 0.05;
            }
            else if(field.zoom.zoomX < 8)
                delta = 0.1;
            else if(field.zoom.zoomX < 25)
                delta = 0.2;
            else if(field.zoom.zoomX < 50)
                delta = 0.4;
    
                field.zoom.zoomY -= e.delta * delta * (field.zoom.zoomY / field.zoom.zoomX) / 5;
                field.zoom.zoomX -= e.delta * delta / 5;
            
            toolSelector.transformTool.setZoom(field.zoom.zoomX);
            const touchPos:number[] = [field.zoom.invZoomX(toolSelector.drawingScreenListener.touchPos[0]), 
                field.zoom.invZoomY(toolSelector.drawingScreenListener.touchPos[1])];
            const centerX:number = (field.width() / 2);
            const centerY:number = (field.height() / 2);
            const deltaX:number = delta*(touchPos[0] - centerX) ;
            const deltaY:number = delta*(touchPos[1]  - centerY);            
            
            field.zoom.offsetX -= deltaX * e.delta;
            field.zoom.offsetY -= deltaY * e.delta;
            
        }
    });
    const keyboardHandler:KeyboardHandler = new KeyboardHandler();
    const pallette:Pallette = new Pallette(document.getElementById("pallette_screen"), keyboardHandler);
    const canvasListener:SingleTouchListener = new SingleTouchListener(canvas, true, true, true);
    const toolSelector:ToolSelector = new ToolSelector(pallette, keyboardHandler, canvasListener, 64, 64);
    field = toolSelector.field;
    field.toolSelector = toolSelector;
    field.setDimOnCurrent([128, 128]);
    toolSelector.penTool.tbSize.setText(field.layer()!.suggestedLineWidth().toString());
    toolSelector.penTool.lineWidth = field.layer().suggestedLineWidth();
    
    keyboardHandler.registerCallBack("keydown", (e:any) => true, (e:any) => {
        if(!e.defaultPrevented && (document.getElementById('body') === document.activeElement || document.getElementById('screen') === document.activeElement)){
            if(e.code.substring(0,"Digit".length) === "Digit")
            {
                const numTyped:string = e.code.substring("Digit".length, e.code.length);
                pallette.highLightedCell = (parseInt(numTyped) + 9) % 10;
                pallette.selectedPixelColor.color = pallette.calcColor(pallette.highLightedCell).color;
            }
        }
    });
    const animationGroupSelector:AnimationGroupsSelector = new AnimationGroupsSelector(field, keyboardHandler, "animation_group_selector", "animations", "sprites_canvas", dim[0], dim[1], 128, 128);
    animationGroupSelector.createAnimationGroup();
    animationGroupSelector.selectedAnimationGroup = 0;
    toolSelector.animationsGroupsSelector = animationGroupSelector;
    const add_animationGroup_button = document.getElementById("add_animationGroup");
    const add_animationGroup_buttonListener:SingleTouchListener = new SingleTouchListener(add_animationGroup_button, false, true);
    add_animationGroup_buttonListener.registerCallBack("touchstart", (e:any) => true, (e:any) => {
        animationGroupSelector.createAnimationGroup();
    });
    const delete_animationGroup_button = document.getElementById("delete_animationGroup");
    const delete_animationGroup_buttonListener:SingleTouchListener = new SingleTouchListener(delete_animationGroup_button, false, true);
    delete_animationGroup_buttonListener.registerCallBack("touchstart", (e:any) => true, (e:any) => {
        animationGroupSelector.deleteSelectedAnimationGroup();
    });
    const clone_animationGroup_button = document.getElementById("clone_animationGroup");
    const clone_animationGroup_buttonListener:SingleTouchListener = new SingleTouchListener(clone_animationGroup_button, false, true);
    clone_animationGroup_buttonListener.registerCallBack("touchstart", (e:any) => true, (e:any) => {
        animationGroupSelector.cloneSelectedAnimationGroup();
    });

    pallette.canvas.addEventListener("mouseup", (e:any) => { 
        if(!e.button) 
        {
            field.layer().state.color = pallette.selectedPixelColor; 
            field.layer().toolSelector.colorPickerTool.tbColor.setText(pallette.selectedPixelColor.htmlRBGA()); 
            field.layer()!.toolSelector.colorPickerTool!.btUpdate.callback();
        }
        else
        {
            field.layer().state.color = pallette.selectedBackColor; 
            field.layer().toolSelector.colorPickerTool.tbColor.setText(pallette.selectedBackColor.htmlRBGA()); 
        }
    });
    pallette.listeners.registerCallBack("touchend", (e:any) => true,  (e:any) => { 
        if(!e.button) 
        {
            field.layer().state.color = pallette.selectedPixelColor; 
            field.layer().toolSelector.colorPickerTool.tbColor.setText(pallette.selectedPixelColor.htmlRBGA()); 
        }
        else
        {
            field.layer().state.color = (pallette.selectedBackColor); 
            field.layer().toolSelector.colorPickerTool.tbColor.setText(pallette.selectedBackColor.htmlRBGA()); 
        }
    });
    
    const add_animationButton = document.getElementById("add_animation");
    const add_animationTouchListener:SingleTouchListener = new SingleTouchListener(add_animationButton, false, true);
    add_animationTouchListener.registerCallBack("touchstart", (e:any) => true, (e:any) => {
        let group:AnimationGroup | null;
        if(group = animationGroupSelector.animationGroup())
        {
            const defGroup:AnimationGroup = group;
            defGroup.pushAnimation(new SpriteAnimation(0, 0, dim[0], dim[1]));
        }
    });
    const clone_animationButton = document.getElementById("clone_animation");
    const clone_animationTouchListener:SingleTouchListener = new SingleTouchListener(clone_animationButton, false, true);
    clone_animationTouchListener.registerCallBack("touchstart", (e:any) => true, (e:any) => {
        let group:AnimationGroup | null;
        if(group = animationGroupSelector.animationGroup())
        {
            const defGroup:AnimationGroup = group;
            const animation:SpriteAnimation | null = defGroup.cloneAnimation(defGroup.selectedAnimation);
            if(animation)
                defGroup.pushAnimation(animation);
        }
    });
    const delete_animationButton = document.getElementById("delete_animation");
    const delete_animationTouchListener:SingleTouchListener = new SingleTouchListener(delete_animationButton, false, true);
    delete_animationTouchListener.registerCallBack("touchstart", (e:any) => true, (e:any) => {
        let group:AnimationGroup | null;
        if(group = animationGroupSelector.animationGroup())
        {
            const defGroup:AnimationGroup = group;
            defGroup.deleteAnimation(defGroup.selectedAnimation);
        }
    });

    const add_spriteButton = document.getElementById("add_sprite");
    const add_spriteButtonTouchListener:SingleTouchListener = new SingleTouchListener(add_spriteButton, false, true);
    add_spriteButtonTouchListener.registerCallBack("touchstart", (e:any) => true, (e:any) => {
        let group:AnimationGroup | null;
        if(group = animationGroupSelector.animationGroup())
        {
            const defGroup:AnimationGroup = group;
            defGroup.pushSprite();
        }
    });

    const save_spriteButton = document.getElementById("save_sprite");
    const save_spriteButtonTouchListener:SingleTouchListener = new SingleTouchListener(save_spriteButton, false, true);
    save_spriteButtonTouchListener.registerCallBack("touchstart", (e:any) => true, (e:any) => {      
        let group:AnimationGroup | null;
        if(group = animationGroupSelector.animationGroup())
        {
            const defGroup:AnimationGroup = group;
            defGroup.spriteSelector.pushSelectedToCanvas();
        }
    });
    const delete_spriteButton = document.getElementById("delete_sprite");
    const delete_spriteButtonTouchListener:SingleTouchListener = new SingleTouchListener(delete_spriteButton, false, true);
    delete_spriteButtonTouchListener.registerCallBack("touchstart", (e:any) => true, (e:any) => {
        let group:AnimationGroup | null;
        if(group = animationGroupSelector.animationGroup())
        {
            const defGroup:AnimationGroup = group;
            defGroup.spriteSelector.deleteSelectedSprite();
        }
    });
    canvas.onmousemove = (event:MouseEvent) => {
        toolSelector.drawingScreenListener.touchPos[0] = event.offsetX;
        toolSelector.drawingScreenListener.touchPos[1] = event.offsetY;
    };
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
            else if(field.zoom.zoomX < 50)
            delta = 0.4;
            else if(field.zoom.zoomX >= 50 && e.deltaY < 0)
                delta = 0;
    
            if(e.deltaY < 0){
                field.zoom.zoomY += delta * (field.zoom.zoomY / field.zoom.zoomX);
                field.zoom.zoomX += delta;
            }
            else if(field.zoom.zoomX > 0.10){
                field.zoom.zoomY -= delta * (field.zoom.zoomY / field.zoom.zoomX);
                field.zoom.zoomX -= delta;
            }
            toolSelector.transformTool.setZoom(field.zoom.zoomX);
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

    //setup rendering canvas, and view
    canvas.width = getWidth() - toolSelector.width() - 30;
    canvas.height = screen.height * 0.65;
    field.draw(canvas, ctx, 0, 0, canvas.width, canvas.height);
    field.zoomToScreen();

    canvas.style.cursor = "pointer";
    const fps = 60;
    const goalSleep = 1000/fps;
    let counter = 0;
    const touchScreen:boolean = isTouchSupported();
    const toolCanvas:HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("tool_selector_screen");
    let toolCtx:CanvasRenderingContext2D = toolCanvas.getContext("2d")!;
    let start:number = Date.now();
    const drawLoop = async () => 
    {
        if(canvas.width != getWidth() - (toolCanvas.width + 30) || toolCanvas.width !== Math.floor(toolSelector.width() / toolSelector.height() * toolCanvas.height))
        {
            if(!touchScreen){
                canvas.height = window.screen.height * 0.65;
                toolCanvas.height = pallette.canvas.height + canvas.height;
            }
            else {
                canvas.height = window.screen.height;
                toolCanvas.height = pallette.canvas.height + canvas.height * (canvas.height / canvas.width > 1? (canvas.height / canvas.width > 0.5?6 / 8:1/2):1);
            }
            toolCanvas.width = Math.floor(toolSelector.width() / toolSelector.height() * toolCanvas.height);
            toolSelector.repaint = true;
            canvas.width = getWidth() - toolCanvas.width - 30;
            counter = 0;
            field.redraw = true;
        }
        if(pallette.canvas.width !== canvas.width)
            pallette.canvas.width = canvas.width;
    
        if(toolSelector.touchListener.mouseOverElement)
            toolSelector.repaint = true;
        
        toolSelector.draw();
        field.update();
        field.draw(canvas, ctx, 0, 0, canvas.width, canvas.height);
        if(toolSelector.drawingScreenListener.mouseOverElement || touchScreen)
            await toolSelector.renderDrawingScreenPreview();
        if(animationGroupSelector.animationGroup())
            animationGroupSelector.draw();
        if(counter++ % 3 === 0)
            pallette.draw();
        
        const adjustment:number = Date.now() - start < 30 ? Date.now() - start : 30;
        //await sleep(goalSleep - adjustment);
        /*if(1000/(Date.now() - start) < fps - 5){
            console.log("avgfps:",Math.floor(1000/(Date.now() - start)))
            if(1000/(Date.now() - start) < 1)
                console.log("frame time:",(Date.now() - start) / 1000);
        }*/
        requestAnimationFrame(drawLoop);
        start = Date.now();
    }
    drawLoop();

}
main();