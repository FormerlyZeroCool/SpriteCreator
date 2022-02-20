An animation creation tool that allows users to do pixel art, and make animations from that pixel art.
You can try it out: <a href="http://andrew-rubinstein.com/SpriteCreator/web">Here!</a><br>
Developed by Andrew Rubinstein, with default icon artwork done by @ThePixelSlime1 (see images/PixelSlime1Icons)
<br>
<h2>The Drawing Screen</h2>
This is where you create your sprites using the tools described below. To use the pixel color left click, and to use the background color right click.
<br>
<h2>Animation Groups</h2>
These are meant to organize animations, so that for instance if you wish to create the animations for a game you may organize the groups so each group is all the animations for one character in the game.
You can add new animation groups at any time by pressing the "Add Animation Group" button.<br>
You can delete an existing animation group by selecting the animation you want to delete by left clicking on it, and then pressing the "Delete Animation Group" button.<br>
You can clone, or copy an existing animation group by left clicking the animation you wish to clone to select it, and then clicking the "Clone Animation Group" button<br>
<h2>Animations</h2>
Animations are groups of sprites(small images, for more see below) that make up a single small flip book of sprites, or frames.<br>
You can add new animations at any time by pressing the "Add Animation" button, or when you haven't created one yet by pressing the "Add Sprite" button.<br>
You can delete an existing animation by selecting the animation you want to delete by left clicking on it, and then pressing the "Delete Animation" button.<br>
You can clone, or copy an existing animation by left clicking the animation you wish to clone to select it, and then clicking the "Clone Animation" button<br>
both will take the contents of the drawing screen, and save them to a new sprite, and save that sprite within a new animation.<br>
You can switch between animations by clicking on them, and the animation's sprites will show up in the sprite selector so you can update, or add to them.<br>
You can also drag and drop animations to rearrange the order they are dislayed<br>
<br>
<h2>Sprite Selector</h2>
The Sprite Selector is used to manage existing sprites, and save new ones to animations<br>
To add a new sprite press the "Add Sprite" button, which will create a new sprite with the image on the drawing screen, and add it to the currently selected animation<br>
To update an existing sprite simply press the "Save Sprite" button, and whatever is on the drawing screen will be saved to the currently selected sprite.<br>
To delete an existing sprite simply press the "Delete Sprite" button, and the currently selected sprite will be deleted from the animation(no undoing sprite deletion).<br>
Drag, and drop existing sprites to change their order in the animation. 
<br>
<h2>Color Palette</h2>
The Color Palette is a tool found above the main drawing screen to select the color used for drawing.<br>
The first two colors shown are the selected pixel, and background colors.<br>
Around the pixel color is a red border, and around the background color is a blue one.<br>
You can either click on the color you wish to use to select the color (right clicking will update the background color), or select by pressing one of the number keys 0-9.<br>
When you select a color you will notice it's red green blue, and transparency values popup in the text box in the color text box,
you can change on of these values and press Update, or the enter key to save the new color to the palette
<br>

<h2>Tools:</h2>
*You can switch tools by clicking on them, or by holding alt, and pressing the up and down arrow keys.

<h3>1.) Pen tool:</h3>
The Pen Tool is used to draw curved lines of the color selected in the color palette, like a pen on pixelated paper.<br>
To draw click, if the mouse is dragged while the left mouse button is held down it will act like dragging a pen across paper.<br>
<h4>Line Width</h4>
To set the width of the line the pen tool draws simply type a number into the textbox, and press enter when the desired value is reached, or press update<br>
<h4>Round Pen Tip</h4>
When this box is checked the pen tool will leave circular marks with a radius of the pen width, when it is not checked the tool will leave square shaped marks with a lenght, and width of the selected line with<br>
<h4>Spray Prob</h4>
This value dictates the density of the pixels drawn by the pen tool, 1 will draw a pixel everywhere, 0.1 will draw pixels 10% of the time, and so on.
<br>
<h3>2.) Fill Tool</h3>
The Fill Tool is used to change all adjacent pixels of one color to the color selected in the color palette.<br>
Click on a pixel, and all adjacent pixels of the same color will change to the selected color on the color palette.<br>
<h4>Ignore Alpha</h4>
Ignore differences in alpha values when checking color.
<br>
<h3>3.) Line Draw Tool</h3>
The Line Draw Tool is used to draw straight lines on the screen.<br>
Depress, and hold left mouse button as you drag you'll see a preview of the line that will be drawn, release the left mouse button when you are satisfied to draw.
<br>
See Pen Tool options descriptions
<br>
<h3>4.) Rectangle Tool</h3>
The Rectangle Tool is used to draw a rectangle of the color selected in the color palette.<br>
To draw press, and hold the mouse where you want one corner of the rectangle to begin, drag till the preview of the rectangle is the size you wish.<br>
Release the mouse to draw the rectangle previewed to the screen.<br>
See Pen Tool options descriptions
<br>
<h3>5.) Oval Tool</h3>
The Oval Tool is used to draw an oval of the color selected in the color palette.<br>
To use the Oval Tool press, and hold the mouse where you want the oval to begin, drag till the preview rectangle is the size you wish.<br>
Release the mouse to draw an oval within the rectangle previewed to the screen.<br>
See Pen Tool options descriptions<br>
<h3>6.) Copy Tool</h3>
The Copy Tool is used to copy all the pixels within a selection rectangle to the clipboard to paste later.<br>
To copy, press and hold the mouse where you want one corner of the rectangle to begin, drag till the preview of the rectangle completely surrounds the area you wish to copy while holding the left mouse button.<br>
Release the button to copy the area within rectangle to the clipboard.<br>
<h4>Preserve Transparency</h4>
When checked if the pasted image has any transparent or translucent pixels it will treat them as if putting a translucent sheet over the existing image.<br>
When not checked the pasted image will overwrite any color data on the drawing screen.
<h4>Copy From Selection</h4>
When checked instead of copying a rectangle created by dragging across the screen the data that will be copied is the pixel data within the selection made by the selection tool.
<br>
<h3>7.) Paste Tool</h3>
The Paste Tool is used to paste pixels saved in the clip board to the screen.<br>
To use simply click where you wish to paste on the screen. <br>
A rectangle will show exactly where the contents of the clipboard will be copied.<br>
By default the paste feature will blend colors pasted according to transparency, but if alt is held it will ignore transparency.
<br>
<h3>8.) Drag Tool</h3>
The Drag Tool is used to drag groups of pixels around the screen once they have already been drawn.<br>
To use the Drag Tool click on one of the pixels in the group you wish to drag, and simply drag it to a new location on the screen.<br>
<h4>Auto Select When Dragging</h4>
When checked All adjacent pixels to the one clicked on will be automatically selected to be dragged.  When not checked the selection made by the Selection Tool will be selected to be dragged<br>
<h4>Only Drag One Color</h4>
When this, and Auto Select When Dragging is too only pixels of the same color as the one clicked on will be dragged<br>
<h4>Blend Alpha When Dropping</h4>
When checked Drag data will respect the transparency of the dragged pixels, and blend them with the pixels they are dragged on top of<br>
<h4>Allow Dropping Outside Select</h4>
When checked this will allow the user to drop dragged pixels outside the selected area, otherwise they will only be dropped onto the selected area made in the selection tool
<br>
<h3>9.) Redo Tool</h3>
Simply click on the drawing screen to redo the last action you have undone.<br>
If slow mode is turned on then the undo operation will be animated.<br>
*You can also always (with any tool selected) press the r key on the keyboard to redo.
<br>
<h3>10.) Undo Tool</h3>
Simply click on the drawing screen to undo the last action you performed.<br>
If slow mode is turned on then the undo operation will be animated.<br>
*You can also always (with any tool selected) press the u key on the keyboard to undo.
<br>
<h3>11.) Color Picker Tool</h3>
Click on a pixel, and set the current drawing color.<br>
*Note pressing shift will reset color chosen, but pressing the "Update" button, or enter will save the selected color to the palette so it can be reselected, and pressing shift won't lose the picked color<br>
<h3>12.) Eraser Tool</h3>
The Eraser Tool operates much like the pen tool, just drag the cursor across the area to be erased while holding down the mouse button.<br>
<h3>13.) Rotation Tool</h3>
Click, and hold down the mouse button on a portion of the graphic, then drag your mouse to rotate.<br>
<h4>Auto Select</h4>
When checked pixels adjacent to the pixel clicked on will be automatically selected for rotation.
<h4>Only rotate adjacent pixels of the same color</h4>
When checked, and Auto Select is also checked only pixels of the same color will be automatically selected<br>
<h4>Anti-alias Rotation</h4>
When checked rotation tool will not anti-alias the rotations, and as such will only rotate in 90 degree increments
<h4>Allow Dropping Outside Select</h4>
When checked any pixels rotated outside of selection made with the Selection Tool will be put onto the screen, if not these pixels will be disregarded
<h3>14.) Auto Outline Tool</h3>
When clicking on a group of pixels this tool will automatically outline them with the selected color
<h3>15.) Layers Manager Tool</h3>
Used to create, delete, rearrange, and control transparency on entire layers of the drawing screen. Click on a layer in the list to select it for editing.<br>
Drag, and drop them to rearrange their order. The sliders control transparency used when rendering each layer, and the checkboxes control whether or not a layer will be rendered.
<h3>16.) Selection Tool</h3>
Use this tool to create a selection area which you may not draw outside of (also works with drag, copy, and rotation tools see them for instructions)
<h4>Polygonal Selector</h4>
When checked each time you click on the screen another point in a polygonal area will be added to the selection, anything within the polygonal area is selected, otherwise a dragged rectangular selection will be made
<h4>Reset Selection</h4>
Click this button to reset the selection made
<h4>Undo Last Point</h4>
Undo setting the last point added to the selection polygon when polygonal selection is checked
<h3>17.) Screen Transformation Tool</h3>
<h4>Zoom</h4>
Displays value of x zoom, y zoom is auto calculated to keep pixel aspect ratio 1:1
<h4>Set Zoom Button</h4>
Update zoom in text box, and press enter to set the x zoom manually
<h4>Auto Zoom Button</h4>
Automatically zooms screen to make the sprite's height the same as the screen height, auto calulate's x zoom to keep pixel aspect ratio 1:1
<h4>Center Screen Button</h4>
Automatically centers screen view to show middle of working sprite
<h3>18.) Save Tool</h3>
<h4>Save PNG</h4>
Saves what is currently rendered to the drawing screen as a png with the file name supplied in the textbox
<h4>Save Animation</h4>
Saves the currently selected animation as a gif with the file name supplied in the textbox
<h4>Save Project</h4>
Saves all data in project to one binary file that can be loaded by sprite creator at a later time using the "Choose project to load" button
<h3>19.) Settings Tool</h3>
<h4>Sprite Resolution</h4>
Set the width, and height of the current drawing space in pixels
<h4>Resize</h4>
When checked the current image data will be resied to fit the new resolution using anti-aliasing.  Otherwise the existing pixel data will remain in it's current state on the newly sized canvas.<br>
<h3>Notes on the clipboard viewer</h3>
1.) If you click on the clipboard its contents will rotate 90 degrees so no antialiasing will be applied.<br>
2.) Its contents will be filled by using the copy tool, and it shows a preview of what will be pasted with the paste tool<br>
<h2>To run your own instance locally</h2>
1.) cd to webserver directory<br>
2.) run npm install<br>
3.) run node app.js<br>
4.) navigate to 127.0.0.1:5000 to see running app
