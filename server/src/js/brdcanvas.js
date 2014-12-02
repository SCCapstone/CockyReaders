var PIN_WIDTH = 200;
var PIN_HEIGHT = 200;
var CANVAS_HEIGHT = 480;
var CANVAS_WIDTH = 854;

var theCanvas;
var ctx;
var boardID;
var theBoard;
var dragPin;
var imageSelected = false;
var dragCorner;
var selectedCorners = new Array();
var thePinImages = new Array();

$(document).ready(function() {
	console.log("ready");
	theCanvas = document.getElementById("canvas");
	boardID = theCanvas.getAttribute("boardid");

	initialize();
});

function initialize() {
	$.ajax('/board/' + boardID, {
		type: 'GET',
		data: {
			fmt: 'json'
		},
		success: function(data) {
			theBoard = data;
			console.log('Board Loaded:');
			console.log(theBoard);
		},
		error: function() {
			console.log('Error at server:');
		},
		complete: setupCanvas
	});
}

function setupCanvas() {

	console.log("Setting up the canvas.")
	ctx = theCanvas.getContext('2d');
	theCanvas.addEventListener('mousedown', handleMouseDown);
	theCanvas.addEventListener('mouseup', handleMouseUp)

	var loopPin;

	if (theBoard.xValues.length == 0) {
		for (var i = 0; i < theBoard.pins.length; i++) {

			theBoard.pins[i].x = ((i * 200) + "")
			theBoard.pins[i].y = "0";

			loopPin = theBoard.pins[i];

			theBoard.xValues[i] = loopPin.x;
			theBoard.yValues[i] = loopPin.y;
			drawPin(loopPin);
		} 
	}

	else {
		for (var i = 0; i < theBoard.pins.length; i++) {

			theBoard.pins[i].x = theBoard.xValues[i];
			theBoard.pins[i].y = theBoard.yValues[i];
			theBoard.pins[i].width = theBoard.widths[i];
			theBoard.pins[i].height = theBoard.heights[i];

			loopPin = theBoard.pins[i];
			drawPin(loopPin);
		} 
	}
}

function drawPin(thePin) {

	var img = new Image();
	img.onload = function(){
		ctx.drawImage(img, eval(thePin.x), eval(thePin.y), thePin.width, thePin.height);
	};
	img.src = thePin.imgUrl;
	img.setAttribute("pinid", thePin.id);
	img.setAttribute("x", thePin.x);
	img.setAttribute("y", thePin.y);
	img.width = thePin.width;
	img.height = thePin.height;
	thePinImages.push(img);
}

function handleMouseDown(event) {

	console.log("Mouse down.");
		var click = new Vector(event.offsetX, event.offsetY);
		if (checkResizeCorners(click) == true) {
			if (dragPin != null) {
			console.log("Resize click");
			theCanvas.addEventListener('mousemove', resizeDrag);
			}
		}
		else if (validClick(event.offsetX, event.offsetY) == true) {
			theCanvas.addEventListener('mousemove', handleDrag);
		}
}

function checkResizeCorners(mouseClick) {
	
	var loopCorner;
	for (var i = 0; i < selectedCorners.length; i++) {
		loopCorner = selectedCorners[i];
		if (mouseClick.x > (loopCorner.x - 10) && mouseClick.x < (loopCorner.x + 10)) {
			if (mouseClick.y > (loopCorner.y - 10) && mouseClick.y < (loopCorner.y + 10)) {
				dragCorner = i;
				return true
			}
		}
	}
	return false;
}

function resizeDrag(event) {

	var dragCornerCoord = selectedCorners[dragCorner];
	var mouseCoord = new Vector(event.offsetX, event.offsetY);
	var calcVector;
	
	if (dragCorner == 0) {

		calcVector = selectedCorners[3].subtract(mouseCoord);
		dragPin.width = calcVector.x;
		dragPin.height = calcVector.y;
		dragPin.setAttribute("x", mouseCoord.x);
		dragPin.setAttribute("y", mouseCoord.y);
	}
	else if (dragCorner == 1) {
		
		dragPin.setAttribute("y", mouseCoord.y);
		calcVector = selectedCorners[2].subtract(mouseCoord);
		dragPin.height = calcVector.y;

		calcVector = mouseCoord.subtract(selectedCorners[2]);
		dragPin.width = calcVector.x;
	}
	else if (dragCorner == 2) {

		dragPin.setAttribute("x", mouseCoord.x);
		calcVector = selectedCorners[1].subtract(mouseCoord);
		dragPin.width = calcVector.x;

		calcVector = mouseCoord.subtract(selectedCorners[1]);
		dragPin.height = calcVector.y;
	}
	else if (dragCorner == 3) {
		
		calcVector = mouseCoord.subtract(selectedCorners[0]);
		dragPin.width = calcVector.x;
		dragPin.height = calcVector.y;
	}
	updateDragPin();
	updateCanvas();
}

function updateDragPin() {
	
	var loopImage;
	for (var i = 0; i < thePinImages.length; i++) {
		if (dragPin.getAttribute("pinid") == thePinImages[i].getAttribute("pinid")) {

			thePinImages[i].x = eval(dragPin.getAttribute("x"));
			thePinImages[i].y = eval(dragPin.getAttribute("y"));
			thePinImages[i].height = dragPin.height;
			thePinImages[i].width = dragPin.width;
			dragPin = thePinImages[i];
			return;
		}
	}
}

var dragOffset;
function validClick(mouseX, mouseY) {

	var loopPin;
	var loadCoord;

	for (var i = 0; i < thePinImages.length; i++) {

		loopPin = thePinImages[i];
		loadCoord = new Vector(eval(thePinImages[i].getAttribute('x')),eval(thePinImages[i].getAttribute('y')));

		if ((mouseX < ((loadCoord.x + loopPin.width))) && (mouseX > (loadCoord.x + 10))) {
			if ((mouseY > (loadCoord.y + 10)) && (mouseY < (loadCoord.y + loopPin.height))) {
				console.log("Valid click");

				dragOffset = new Vector(mouseX, mouseY);
				dragOffset = dragOffset.subtract(loadCoord);
				dragPin = loopPin;
				updateCanvas();
				return true;
			}
		}
	}
	dragPin = null;
	updateCanvas();
	return false;
}

//Where the image is  0******1
//					  2******3
function setupResize() {

	if (dragPin != null) {
		console.log("Finding pin corners.");
		var topLeft = new Vector(eval(dragPin.getAttribute('x')), eval(dragPin.getAttribute('y')));
		var topRight = topLeft.add(new Vector(dragPin.width, 0));
		var bottomLeft = topLeft.add(new Vector(0, dragPin.height));
		var bottomRight = topLeft.add(new Vector(dragPin.width, dragPin.height));

		selectedCorners = new Array();
		selectedCorners[0] = topLeft;
		selectedCorners[1] = topRight;
		selectedCorners[2] = bottomLeft;
		selectedCorners[3] = bottomRight;
		drawResizeSelectors();
	}
}

function handleDrag(event) {

	console.log("Dragging!");
	var mouseCoord = new Vector(event.offsetX, event.offsetY);
	var imageCoord = new Vector(0, 0);

	var loopImage;
	for (var i = 0; i < thePinImages.length; i++) {
		if (dragPin.getAttribute("pinid") == thePinImages[i].getAttribute("pinid")) {

			imageCoord = mouseCoord.subtract(dragOffset);
			thePinImages[i].setAttribute('x', imageCoord.x);
			thePinImages[i].setAttribute('y', imageCoord.y);
			dragPin = thePinImages[i];
		}
	}
	updateCanvas();
}

function handleMouseUp(event) {
	
	console.log("Mouse released.");
	if (dragPin != null) {
		for (var i = 0; i < theBoard.pins.length; i++) {

			if (dragPin.getAttribute("pinid") == theBoard.pins[i].id) {

				theBoard.xValues[i] = dragPin.getAttribute('x');
				theBoard.yValues[i] = dragPin.getAttribute('y');
				
				theBoard.widths[i] = dragPin.width;
				theBoard.heights[i] = dragPin.height;
			}
		}
		theCanvas.removeEventListener('mousemove', handleDrag);
		theCanvas.removeEventListener('mousemove', resizeDrag);
		updateDatastore();
	}
}

function updateCanvas() {
	console.log("Updating canvas.");
	ctx.clearRect(0,0, CANVAS_WIDTH, CANVAS_HEIGHT);

	var loopImage;
	for (var i = 0; i < thePinImages.length; i++) {
		loopImage = thePinImages[i];
		ctx.drawImage(loopImage, loopImage.getAttribute('x'), loopImage.getAttribute('y'), loopImage.width, loopImage.height);
	}
	
	if (selectedCorners != null) {
		setupResize();
	}
}

function drawResizeSelectors() {
	for (var i = 0; i < selectedCorners.length; i++) {
		ctx.beginPath();
		ctx.arc(selectedCorners[i].x, selectedCorners[i].y, 10, 0, 2 * Math.PI, false);
		ctx.fillStyle = 'grey';
		ctx.fill();
	}
}

function updateDatastore() {

	$.ajax('/board/' + boardID, {
		type: 'POST',
		data: {
			updateX: JSON.stringify(theBoard.xValues),
			updateY: JSON.stringify(theBoard.yValues),
			updateWidth: JSON.stringify(theBoard.widths),
			updateHeight: JSON.stringify(theBoard.heights)
		},
		success: function() {
			console.log("Updated board datastore.")
		},
		error: function() {
			console.log('Error at server:');
		},
	});
}