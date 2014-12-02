function updateView() {
	console.log("Updating the view!");
	updatePinListView();
	updateBoardView();
	$('.addPin').on("click", handlePinAdd);
	$('.removePin').on("click", handlePinRemove);
}

function updatePinListView() {
	//console.log("Updating the view for the list of pins.");
	pinDiv.innerHTML = "";
	var tbl = document.createElement("table");
	var tblBody = document.createElement("tbody");
	var thePin;
	var i = 0;
	while (i < pinList.length) {
		var row = document.createElement("tr");
		for (var j = 0; j < 3; j++) {
			if (i >= pinList.length) {
				break;
			}

			thePin = pinList[i];

			if (contains(thePin.id, theBoard.pins) == false) {

				var cell = document.createElement("td");
				cell.style.padding="10px";

				var wrapper = document.createElement("a");
				wrapper.href = "/pin/" + thePin.id;

				var image = document.createElement("img");
				image.src = thePin.imgUrl;
				image.style.maxHeight = '75px';
				image.style.paddingBottom = '5px';
				wrapper.appendChild(image);

				cell.appendChild(wrapper);

				var caption = document.createElement("p");
				caption.innerText = thePin.caption;
				cell.appendChild(caption);

				var addButton = document.createElement("input");
				addButton.type = "submit";
				addButton.value = "Add";
				addButton.setAttribute("pinid", thePin.id)
				addButton.setAttribute("class", "addPin");
				cell.appendChild(addButton);

				cell.align = 'center';
				row.appendChild(cell);
			}
			else j--;
			i++;
		}
		tblBody.appendChild(row);
	}

	tbl.appendChild(tblBody);
	tbl.border = '5';
	pinDiv.appendChild(tbl); 
}

function updateBoardView() {
	//console.log("Updating the view for the board.");
	var theBoardView = document.getElementById("boardDiv");
	theBoardView.innerHTML = "";
	for (var i = 0; i < theBoard.pins.length; i++) {

		thePin = theBoard.pins[i];
		var pin = document.createElement("div");
		pin.setAttribute("class", "displaybox");

		var wrapper = document.createElement("a");
		wrapper.href = "/pin/" + thePin.id;

		var image = document.createElement("img");
		image.src = thePin.imgUrl;
		image.style.maxHeight = '75px';
		image.style.paddingBottom = '5px';
		wrapper.appendChild(image);

		pin.appendChild(wrapper)

		var caption = document.createElement("p");
		caption.innerText = thePin.caption;
		pin.appendChild(caption);

		var addButton = document.createElement("input");
		addButton.type = "submit";
		addButton.value = "Remove";
		addButton.setAttribute("pinid", thePin.id)
		addButton.setAttribute("class", "removePin");
		pin.appendChild(addButton);

		theBoardView.appendChild(pin);
		theBoardView.appendChild(document.createElement("br"));
	}	
}

function getTheBoard() {
	var board;
	outAJAX++;
	$.ajax('/board/' + boardID, {
		type: 'GET',
		data: {
			fmt: 'json'
		},
		success: function(data) {
			theBoard = data;
			//console.log('Board Loaded:');
			//console.log(theBoard);
		},
		error: function() {
			//console.log('Error at server:');
		},
		complete: checkAJAX
	});
}

function getThePins() {
	outAJAX++;
	$.ajax('/pin', {
		type: 'GET',
		data: {
			fmt: 'json'
		},
		success: function(data){			
			pinList = data;
			//console.log('Pins loaded:');
			//console.log(pinList);
		},
		error: function() {
			//console.log('Error at server:');
		},
		complete: checkAJAX
	});
}

function handleCheckClick(e) {
	$.ajax('/board/' + boardID, {
		type: 'POST',
		data: {
			privOpt: $(this).prop("checked")
		},
		success: function(data){			
			//console.log('Update posted.');
		},
		error: function() {
			console.log('Error at server.');
			var checkbox = $('#private');
			if (checkbox.prop("checked") == true) {
				checkbox.prop('checked', false);
			}
			else checkbox.prop('checked', true);
			alert("There was an error at the server, changes reverted!")
		}
	});
}

function checkAJAX() {
	//console.log("Ajax request complete.")
	outAJAX = outAJAX - 1;
	if (outAJAX == 0) updateView();
}

function handlePinAdd(e){
	console.log("Adding pin.")
	console.log("The board before:");
	console.log(theBoard);
	var pinID = this.getAttribute("pinid");
	addPin(pinID);
	console.log("The board after:");
	console.log(theBoard);
	updateView();
	$.ajax('/board/' + boardID, {
		type: 'POST',
		data: {
			aPin: pinID
		},
		success: function(data){			
			//console.log('Update posted.');
		},
		error: function() {
			console.log('Error at server:');
			removePin(pinID);
			updateView();
			alert("There was an error at the server, changes reverted!")
		}
	});
}

function addPin(pinID) {	
	var loopPin;
	for (var i = 0; i < pinList.length; i++) {
		loopPin = pinList[i];
		if (loopPin.id == pinID) {
			theBoard.pins.push(loopPin);
			return;
		}
	}
	return;
}

function removePin(pinID) {	
	var loopPin;
	for (var i = 0; i < theBoard.pins.length; i++) {
		loopPin = theBoard.pins[i];
		if (loopPin.id == pinID) {
			theBoard.pins.splice(i, 1);
			return;
		}
	}
	return;
}

function handlePinRemove(e){

	var pinID = this.getAttribute("pinid");
	console.log(theBoard);
	removePin(pinID);	
	console.log(theBoard);
	updateView();
	$.ajax('/board/' + boardID, {
		type: 'POST',
		data: {
			rPin: pinID
		},
		success: function(data){			
			//console.log('Update posted.');
		},
		error: function() {
			console.log('Error at server:');
			addPin(pinID);
			updateView();
			alert("There was an error at the server, changes reverted!")
		}
	});
}

function contains(pinID, array) {

	var temp;
	for (var i = 0; i < array.length; i++) {
		temp = array[i];
		//console.log("checking " + temp.id + " vs " + pinID);
		if (pinID == temp.id) {
			return true;
		}
	}
	return false;
}

function hoverOver(e) {

	$(this).addClass("hover");
}

function hoverOut(e) {

	$(this).removeClass("hover");
}

function handleSubmit(e) {
	var keypressed = event.keyCode || event.which;
	if (keypressed == 13) {

		noEdit = document.createElement("span");
		noEdit.id = this.id;
		noEdit.innerText = this.value;
		$(noEdit).addClass("editable");
		$(this).replaceWith(noEdit); 
		
		$('.editable').on("click", handleEditClick);	
		$('.editable').hover(hoverOver, hoverOut);
		
		$.ajax('/board/' + boardID, {
			type: 'POST',
			data: {
				title: this.value
			},
			success: function(){			
				console.log('Update posted.');
			},
			error: function() {
				alert("There was an error on the server.")
				document.getElementById("boardTitle").innerText = oldTitle;			
			}
		});
	}
}

function handleEditClick(e) {
	
	oldTitle = this.innerText;
	edit = document.createElement("input");
	edit.id = this.id;
	edit.type = "text";
	edit.value = this.innerText;
	$(this).replaceWith(edit);

	$('#' + edit.id).on("keydown", handleSubmit)
}

var pinList;
var boardID;
var theBoard;
var outAJAX = 0;
var oldTitle;

$(document).ready(function() {
	//console.log("ready");
	boardID = document.getElementById("boardID").value;
	$('#private').on("click", handleCheckClick);
	$('.editable').on("click", handleEditClick);	
	$('.editable').hover(hoverOver, hoverOut);
	getTheBoard();
	getThePins();
});