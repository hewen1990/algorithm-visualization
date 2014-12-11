// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY David Galles ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco



function JosephRing(am, w, h)
{
	this.init(am, w, h);
}

JosephRing.prototype = new Algorithm();
JosephRing.prototype.constructor = JosephRing;
JosephRing.superclass = Algorithm.prototype;


JosephRing.ELEMENT_RADIUS = 20;
JosephRing.CENTER_X = 400;
JosephRing.CENTER_Y = 300;
JosephRing.SCALE = 40;
JosephRing.FOREGROUND_COLOR = "#000055"
JosephRing.BACKGROUND_COLOR = "#AAAAFF"


JosephRing.prototype.init = function(am, w, h)
{
	// Call the unit function of our "superclass", which adds a couple of
	// listeners, and sets up the undo stack
	JosephRing.superclass.init.call(this, am, w, h);

	this.addControls();

	// Useful for memory management
	this.nextIndex = 0;
	this.bitMap = [];
    this.remainCount = 0;
    this.allCount = 0;
    this.gapCount = 0
}

JosephRing.prototype.addControls =  function() {
	this.controls = [];
    addLabelToAlgorithmBar("总的人数");
    this.allField = addControlToAlgorithmBar("Text", "");
    addLabelToAlgorithmBar("间隔人数");
    this.gapField = addControlToAlgorithmBar("Text", "");

    this.allField.onkeydown = this.returnSubmit(this.allField,
                                               this.genCallback.bind(this), // callback to make when return is pressed
                                               2,                           // integer, max number of characters allowed in field
                                               true);                      // boolean, true of only digits can be entered.
    this.gapField.onkeydown = this.returnSubmit(this.gapField,
                                               this.genCallback.bind(this), // callback to make when return is pressed
                                               2,                           // integer, max number of characters allowed in field
                                               true);                      // boolean, true of only digits can be entered.
	this.controls.push(this.allField);
    this.controls.push(this.gapField);

	this.genButton = addControlToAlgorithmBar("Button", "Gen");
	this.genButton.onclick = this.genCallback.bind(this);
	this.controls.push(this.genButton);

	this.nextButton = addControlToAlgorithmBar("Button", "Next one");
	this.nextButton.onclick = this.nextCallback.bind(this);
	this.controls.push(this.nextButton);

	this.autoButton = addControlToAlgorithmBar("Button", "Automatic");
	this.autoButton.onclick = this.autoCallback.bind(this);
	this.controls.push(this.autoButton);
}

JosephRing.prototype.reset = function()
{
	// Reset the (very simple) memory manager.
	//  NOTE:  If we had added a number of objects to the scene *before* any user
	//         input, then we would want to set this to the appropriate value based
	//         on objects added to the scene before the first user input
	this.nextIndex = 0;

	// Reset our data structure.  (Simple in this case)
	this.bitMap = [];

	this.remainCount = 0;
}



JosephRing.prototype.genCallback = function()
{
	var allValue = this.allField.value;
    var gapValue = this.gapField.value;


	if (allValue != "" && gapValue != "")
	{
		//this.allField.value = "";
        //this.gapField.value = "";
		this.implementAction(this.gen.bind(this), allValue+";"+gapValue);
	}

}

JosephRing.prototype.nextCallback = function()
{
	this.implementAction(this.next.bind(this), "");
}

JosephRing.prototype.autoCallback = function()
{
	this.implementAction(this.auto.bind(this), "");
}

function calCircleXY(totalCount,num,isX,scale){

    var angle = 2*Math.PI/totalCount;
    var R = JosephRing.ELEMENT_RADIUS/Math.sin(angle/2)+scale;
    var result;
    if (isX){
        result = JosephRing.CENTER_X + R * Math.cos(angle*num);
    }else{
        result = JosephRing.CENTER_Y + R * Math.sin(angle*num);
    }
    return result;
}

JosephRing.prototype.gen = function(input)
{
	this.commands = [];
    var inputs = input.split(";");
    var allValue = parseInt(inputs[0]);
    var gapValue = parseInt(inputs[1]);

    this.remainCount = this.allCount = allValue;
    this.gapCount = gapValue
    this.nextIndex = 0
    for (var i = 0; i < this.remainCount; i++){
        this.bitMap.push(true);
        var circleX = calCircleXY(this.remainCount,i,true,0);
        var circleY = calCircleXY(this.remainCount,i,false,0);
        this.cmd("CreateCircle", i, String(i+1),  circleX, circleY);
    }
	this.cmd("Step"); // Not necessary, but not harmful either
	return this.commands;
}

JosephRing.prototype.next = function(unused)
{
    this.commands = []
	if (this.remainCount > 1)
	{
        var numOfGap = 0;
        var lastNum;
        while (numOfGap<this.gapCount){
            if (this.bitMap[this.nextIndex]){
                this.cmd("SetHighlight",this.nextIndex, 1);
                this.cmd("Step");
                this.cmd("SetHighlight",this.nextIndex, 0);
                this.cmd("Step");
                numOfGap++;
                if (numOfGap >= this.gapCount)
                    lastNum = this.nextIndex;
            }
            this.nextIndex++;
            this.nextIndex%=this.allCount;
        }
        this.bitMap[lastNum] = false;
        this.remainCount--;

        var circleX = calCircleXY(this.allCount,lastNum,true,JosephRing.SCALE);
        var circleY = calCircleXY(this.allCount,lastNum,false,JosephRing.SCALE);

        this.cmd("Move",lastNum,circleX,circleY);
        this.cmd("Step");

        var remainIndex = 0;
        if (this.remainCount > 1)
            for (var i = 0; i < this.allCount; i++ ){
                if (this.bitMap[i]){
                    circleX = calCircleXY(this.remainCount,remainIndex,true,0);
                    circleY = calCircleXY(this.remainCount,remainIndex,false,0);
                    this.cmd("Move",i,circleX,circleY);
                    this.cmd("Step");
                    remainIndex++;
                }
            }
        else
            for (var i = 0; i < this.allCount; i++ ){
                if (this.bitMap[i]){
                    this.cmd("SetHighlight",i, 1);
                    this.cmd("Step");
                }
            }
	}
	return this.commands;
}



JosephRing.prototype.auto = function(unused)
{
    this.commands = []
	while (this.remainCount > 1)
	{
        var numOfGap = 0;
        var lastNum;
        while (numOfGap<this.gapCount){
            if (this.bitMap[this.nextIndex]){
                this.cmd("SetHighlight",this.nextIndex, 1);
                this.cmd("Step");
                this.cmd("SetHighlight",this.nextIndex, 0);
                this.cmd("Step");
                numOfGap++;
                if (numOfGap >= this.gapCount)
                    lastNum = this.nextIndex;
            }
            this.nextIndex++;
            this.nextIndex%=this.allCount;
        }
        this.bitMap[lastNum] = false;
        this.remainCount--;

        var circleX = calCircleXY(this.allCount,lastNum,true,JosephRing.SCALE);
        var circleY = calCircleXY(this.allCount,lastNum,false,JosephRing.SCALE);

        this.cmd("Move",lastNum,circleX,circleY);
        this.cmd("Step");

        var remainIndex = 0;
        if (this.remainCount > 1)
            for (var i = 0; i < this.allCount; i++ ){
                if (this.bitMap[i]){
                    circleX = calCircleXY(this.remainCount,remainIndex,true,0);
                    circleY = calCircleXY(this.remainCount,remainIndex,false,0);
                    this.cmd("Move",i,circleX,circleY);
                    this.cmd("Step");
                    remainIndex++;
                }
            }
        else
            for (var i = 0; i < this.allCount; i++ ){
                if (this.bitMap[i]){
                    this.cmd("SetHighlight",i, 1);
                    this.cmd("Step");
                }
            }
	}
	return this.commands;
}




// Called by our superclass when we get an animation started event -- need to wait for the
// event to finish before we start doing anything
JosephRing.prototype.disableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = true;
	}
}

// Called by our superclass when we get an animation completed event -- we can
/// now interact again.
JosephRing.prototype.enableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = false;
	}
}

////////////////////////////////////////////////////////////
// Script to start up your function, called from the webapge:
////////////////////////////////////////////////////////////

var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new JosephRing(animManag, canvas.width, canvas.height);
}
