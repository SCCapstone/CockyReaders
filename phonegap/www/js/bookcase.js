function updateView() {
	console.log("Updating the view!");
	updateBookcase();
}

function updateBookcase() {

	bookshelfDiv = document.getElementById("bookshelf");
		
	var theBook;
	var i = 0;
    
	while (i < bookList.length) {
		
		theBook = bookList[i];
		
        var span = document.createElement("span");
		span.style.padding = "8px 0px 36px 100px";
		span.style.height = "150px";
		span.style.display = "block";
			
		var div1 = document.createElement("div");
		div1.style.float = "left";
			
		var a = document.createElement("a");
		a.href = "#";
			
		var div2 = document.createElement("div");
		div2.class = "caption-wrapper";
		div2.style.overflow = "hidden";
		div2.style.padding = "0px";
		div2.style.width = "111px";
		div2.style.height = "150px";
		div2.style.margin = "5px";
		div2.style.border = "0px none rgb(0, 147, 204)";
			
		var image = document.createElement("img");
		image.onclick = function callAnotherPage() {
                window.location = "reader.html";
             };
		image.src = theBook.cover;
		image.rel = "book_thumb_8";
		image.class = " captify book_thumb";
		image.style.border = "0px none";
		image.style.margin = "0px";
        
        var a2 = document.createElement("a");
        a2.href = "#"
        a2.class = "thumblink"
        a2.style.margin = "0px"
        	
		div2.appendChild(image);
        div2.appendChild(a2);
        
		a.appendChild(div2);
		div1.appendChild(a);
		span.appendChild(div1);	
		i++;	
        bookshelfDiv.appendChild(span);	
	}
}

function getTheBooks() {
	outAJAX++;
	$.ajax('http://localhost:9080/book', {
		type: 'GET',
		data: {
			fmt: 'json'
		},
		success: function(data){			
			bookList = data;
			console.log('Books loaded:');
		},
		error: function() {
			console.log('Error at server:');
		},
		complete: checkAJAX
	});
}

function checkAJAX() {
	//console.log("Ajax request complete.")
	outAJAX = outAJAX - 1;
	if (outAJAX == 0) updateView();
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

var bookList;
var outAJAX = 0;

$(document).ready(function() {
	console.log("ready");
	getTheBooks();
});