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
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
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

JosephRing.prototype = new Recursive();
JosephRing.prototype.constructor = JosephRing;
JosephRing.superclass = Recursive.prototype;

JosephRing.ACTIVATION_FIELDS = ["helper ", "subProblem ", "subSolution ", "solution "];

JosephRing.CODE = [
                ["def ","whoIsWinner(n, m):"],
                ["      return ","helper(n, m) + 1"],
                [" "],
                ["def ","helper(n, m)",":"],
				["      if ","n == 1: "],
				["          return 0"],
				["      subProblem = n - 1"],
				["      subSolution = ", "helper(subProblem, m)"],
				["      solution = ", "(subSolution + m) % n"],
				["      return ", "solution"]
                ];


JosephRing.RECURSIVE_DELTA_Y = JosephRing.ACTIVATION_FIELDS.length * Recursive.ACTIVATION_RECORD_HEIGHT;
JosephRing.ACTIVATION_RECORT_START_X = 375;
JosephRing.ACTIVATION_RECORT_START_Y = 20;



JosephRing.prototype.init = function(am, w, h)
{
	JosephRing.superclass.init.call(this, am, w, h);
	this.nextIndex = 0;
	this.addControls();
	this.code = JosephRing.CODE;


	this.addCodeToCanvas(this.code);

	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	this.initialIndex = this.nextIndex;
	this.oldIDs = [];
	this.commands = [];
}


JosephRing.prototype.addControls =  function()
{
	this.controls = [];

    addLabelToAlgorithmBar("总的人数");
    this.allField = addControlToAlgorithmBar("Text", "");
    addLabelToAlgorithmBar("间隔人数");
    this.gapField = addControlToAlgorithmBar("Text", "");

    this.allField.onkeydown = this.returnSubmit(this.allField,
                                               this.startCallback.bind(this), // callback to make when return is pressed
                                               2,                           // integer, max number of characters allowed in field
                                               true);                      // boolean, true of only digits can be entered.
    this.gapField.onkeydown = this.returnSubmit(this.gapField,
                                               this.startCallback.bind(this), // callback to make when return is pressed
                                               2,                           // integer, max number of characters allowed in field
                                               true);                      // boolean, true of only digits can be entered.
	this.controls.push(this.allField);
    this.controls.push(this.gapField);

	this.startButton = addControlToAlgorithmBar("Button", "who is winner");
	this.startButton.onclick = this.startCallback.bind(this);
	this.controls.push(this.startButton);

}




JosephRing.prototype.startCallback = function(event)
{
	if (this.allField.value != "" && this.gapField.value != "")
	{
		var value =this.allField.value+";"+this.gapField.value;
		this.implementAction(this.doJosephRing.bind(this),value);
	}
}


JosephRing.prototype.doJosephRing = function(value)
{
	this.commands = [];

	this.clearOldIDs();

	this.currentY = JosephRing.ACTIVATION_RECORT_START_Y;
	this.currentX = JosephRing.ACTIVATION_RECORT_START_X;


	this.cmd("SetForegroundColor", this.codeID[0][1], Recursive.CODE_HIGHLIGHT_COLOR);
	this.cmd("Step");
	this.cmd("SetForegroundColor", this.codeID[0][1], Recursive.CODE_STANDARD_COLOR);
	this.cmd("SetForegroundColor", this.codeID[1][1], Recursive.CODE_HIGHLIGHT_COLOR);
	this.cmd("Step");
	this.cmd("SetForegroundColor", this.codeID[1][1], Recursive.CODE_STANDARD_COLOR);

	var final = this.helper(value);
	var resultID = this.nextIndex++;
	this.oldIDs.push(resultID);

    var values = value.split(";");
    var allValue = parseInt(values[0]);
    var gapValue = parseInt(values[1]);
	this.cmd("CreateLabel", resultID, "helper(" + allValue+", "+gapValue + ") = " + String(final),
			 Recursive.CODE_START_X, Recursive.CODE_START_Y + (this.code.length + 1) * Recursive.CODE_LINE_HEIGHT, 0);

    this.cmd("Step");
	resultID = this.nextIndex++;
    this.oldIDs.push(resultID);
	this.cmd("CreateLabel", resultID, "whoIsWinner(" + allValue+", "+gapValue + ") = " + String(final+1),
			 Recursive.CODE_START_X, Recursive.CODE_START_Y + (this.code.length + 2) * Recursive.CODE_LINE_HEIGHT, 0);

	this.cmd("SetForegroundColor",resultID, Recursive.CODE_HIGHLIGHT_COLOR);
	return this.commands;
}


JosephRing.prototype.helper = function(value)
{

    var shift = 3;
    var values = value.split(";");
    var allValue = parseInt(values[0]);
    var gapValue = parseInt(values[1]);

	var activationRec = this.createActivation("helper      ", JosephRing.ACTIVATION_FIELDS, this.currentX, this.currentY);
	this.cmd("SetText", activationRec.fieldIDs[0], "("+ allValue+", "+gapValue+")");
//	this.cmd("CreateLabel", ID, "", 10, this.currentY, 0);
	var oldX  = this.currentX;
	var oldY = this.currentY;
	this.currentY += JosephRing.RECURSIVE_DELTA_Y;
	if (this.currentY + Recursive.RECURSIVE_DELTA_Y > this.canvasHeight)
	{
		this.currentY =  JosephRing.ACTIVATION_RECORT_START_Y;
		this.currentX += Recursive.ACTIVATION_RECORD_SPACING;
	}
	this.cmd("SetForegroundColor", this.codeID[0+shift][1], Recursive.CODE_HIGHLIGHT_COLOR);
	this.cmd("Step");
	this.cmd("SetForegroundColor", this.codeID[0+shift][1], Recursive.CODE_STANDARD_COLOR);
	this.cmd("SetForegroundColor", this.codeID[1+shift][1], Recursive.CODE_HIGHLIGHT_COLOR);
	this.cmd("Step");
	this.cmd("SetForegroundColor", this.codeID[1+shift][1], Recursive.CODE_STANDARD_COLOR);

	if (allValue  != 1)
	{
		this.cmd("SetForegroundColor", this.codeID[3+shift][0], Recursive.CODE_HIGHLIGHT_COLOR);
        var subProblem = allValue - 1
		this.cmd("SetText", activationRec.fieldIDs[1],"("+subProblem+","+gapValue+")");
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[3+shift][0], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[4+shift][1], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[4+shift][1], Recursive.CODE_STANDARD_COLOR);

		var subSolution = this.helper(subProblem+";"+gapValue);

		this.cmd("SetForegroundColor", this.codeID[4+shift][0], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetForegroundColor", this.codeID[4+shift][1], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetText", activationRec.fieldIDs[2], String(subSolution));
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[4+shift][0], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[4+shift][1], Recursive.CODE_STANDARD_COLOR);

		this.cmd("SetForegroundColor", this.codeID[5+shift][0], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetForegroundColor", this.codeID[5+shift][1], Recursive.CODE_HIGHLIGHT_COLOR);
		var solution = (subSolution + gapValue)%allValue;
		this.cmd("SetText", activationRec.fieldIDs[3], String(solution));
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[5+shift][0], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[5+shift][1], Recursive.CODE_STANDARD_COLOR);

		this.cmd("SetForegroundColor", this.codeID[6+shift][0], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetForegroundColor", this.codeID[6+shift][1], Recursive.CODE_HIGHLIGHT_COLOR);

		this.cmd("Step");
		this.deleteActivation(activationRec);
		this.currentY = oldY;
		this.currentX = oldX;
		this.cmd("CreateLabel", this.nextIndex, "Return Value = \"" + String(solution) + "\"", oldX, oldY);
		this.cmd("SetForegroundColor", this.nextIndex, Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[6+shift][0], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[6+shift][1], Recursive.CODE_STANDARD_COLOR);
		this.cmd("Delete",this.nextIndex);



//		this.cmd("SetForegroundColor", this.codeID[4][3], Recursive.CODE_HIGHLIGHT_COLOR);
//		this.cmd("Step");

		return solution;
	}
	else
	{
		this.cmd("SetForegroundColor", this.codeID[2][0], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[2][0], Recursive.CODE_STANDARD_COLOR);


		this.currentY = oldY;
		this.currentX = oldX;
		this.deleteActivation(activationRec);
		this.cmd("CreateLabel", this.nextIndex, "Return Value = 0", oldX, oldY);
		this.cmd("SetForegroundColor", this.nextIndex, Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("Delete",this.nextIndex);
		return 0;
	}



}
var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new JosephRing(animManag, canvas.width, canvas.height);
}



