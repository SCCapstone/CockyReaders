/* 
 * Author: Connor P. Bain
 * HW 6
 * First hw with bmlet.
 * Last modified October 7, 2012
 */
imgTags = document.getElementsByTagName("img");

var body = document.getElementsByTagName("body")[0];

var header = document.createElement("h1");
header.innerText = "Pinboard";
header.style.marginLeft = "10px";

var intro = document.createElement("p");
intro.innerText = "Please choose the image you'd like to pin:";
intro.style.marginLeft = "10px";
	
var tbl = document.createElement("table");
var tblBody = document.createElement("tbody");

for (var i = 0; i < imgTags.length; i++) {
	var row = document.createElement("tr");

    for (var j = 0; j < 3; j++) {
    
    	if (i >= imgTags.length) {
    		break;
    	}
        	
       if (imgTags[i].height > 100 && imgTags[i].width > 100) { 

        	var cell = document.createElement("td");
        	cell.style.padding="10px";
        	var image = document.createElement("img");
        	image.src = imgTags[i].src;
        	image.style.maxWidth = '250px';
            cell.appendChild(image);
            
            var spacer = document.createElement("br");
            cell.appendChild(spacer);
            
            var size = document.createElement("i");
            size.innerText = image.width + " x " + image.height;
            cell.appendChild(size);
  
            var form = document.createElement("form");
            form.method='post';
            //NOTE: For right now I manually switch the action for appspot
            form.action='http://localhost:8080/pin/';
            //form.action='http://pinboard-bainco.appspot.com/pin/'
            form.innerHTML = "<input type='hidden' name='imgUrl' value='" + image.src + "'>" +
            	"Caption:<input type='text' name='caption'/><br>" +
            	"Private:<input type='checkbox' name='privOpt'>" +
     	 		"<input type='submit' value='Submit'>";

            cell.appendChild(form);
            cell.align = 'center';
            row.appendChild(cell);
        }
       else {
    	   j--;
       }
       i++;
    }
        tblBody.appendChild(row);
}

    tbl.appendChild(tblBody);
    tbl.border = '5';
    tbl.style.marginLeft = '40px';
    
    //reset page
    document.body.innerHTML = "";
    for (i = 0; i < document.styleSheets.length; i++) {
    	
    	document.styleSheets[0].disabled = true;
    }
    
    body.appendChild(header);
    body.appendChild(intro);
    body.appendChild(tbl);