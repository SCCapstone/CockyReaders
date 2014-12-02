function handleFileSelect(evt) {
	evt.stopPropagation();
	evt.preventDefault();

	var files = evt.dataTransfer.files; // FileList object.

	var output = [];
	theFile = files[0];

	var reader = new FileReader();
	reader.readAsDataURL(theFile);

	reader.onload = function () {

		var xhr = new XMLHttpRequest();
		xhr.open('POST', '/pin/');
		xhr.onload = function() {
			location.reload();
		};
		xhr.onerror = function() {
			console.log("Oh no!");
		};

		// prepare FormData
		var formData = new FormData();
		formData.append('upFile', theFile);
		xhr.send(formData);
	}
}

function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

var theFile;
var dropZone;

$(document).ready(function() {
	console.log("ready");
	dropZone = document.getElementById('drop_zone');
	dropZone.addEventListener('dragover', handleDragOver, false);
	dropZone.addEventListener('drop', handleFileSelect, false);
	console.log("hello!?");
});