function updateView() {
    console.log("Updating the view!");
    var header = document.getElementById("bookshelfName");
    header.innerHTML = getCookie("user") + "'s Bookshelf";
    updateBookcase();
}

function updateBookcase() {

    bookshelfDiv = document.getElementById("bookshelf");

    var theBook;
    var i = 0;

    console.log(bookList)
    
    while (i < bookList.length) {

        theBook = bookList[i];
        console.log(theBook);
        console.log(theBook.link);

        var span = document.createElement("span");
        span.style.float = "left"
        span.style.padding = "8px 0px 36px 135px";
        span.style.height = "150px";
        span.style.display = "block";

        var div1 = document.createElement("div");
        div1.style.float = "left";

        var a = document.createElement("a");
        a.href = "#";

        var div2 = document.createElement("div");
        div2.className = "caption-wrapper";
        div2.style.fontSize = ".1px"
        div2.style.overflow = "hidden";
        div2.style.padding = "0px";
        //div2.style.width = "111px";
        div2.style.height = "150px";
        div2.style.margin = "5px";
        div2.style.border = "0px none rgb(0, 147, 204)";

        var image = document.createElement("img");
        // SET BOOK URL VIA COOKIE HERE\        
        image.id = i;
        image.onclick = function() {test(this.id);};

        image.src = theBook.cover;
        image.rel = "book_thumb_8";
        image.className = " captify book_thumb";
        image.style.border = "0px none";
        image.style.margin = "0px";

        var a2 = document.createElement("a");
        a2.href = "#"
        a2.className = "thumblink"
        a2.style.margin = "0px"

        div3 = document.createElement("div")
        div3.className = "caption-bottom"
        div3.style.margin="0px"
        div3.style.zIndex="1"
        div3.style.position = "relative"
        div3.style.opacity = "0.7"
        div3.style.width = "116px"
        div3.style.height = "38.40625px"

        div4 = document.createElement("div");
        div4.style.margin = "-52px 0px 0px"
        div4.className = "caption-bottom"
        div4.style.paddingTop = "9x"
        div4.style.position = "relative"
        div4.style.zIndex = "2"
        div4.style.backgroundImage = "none"
        div4.style.border = "0px none"
        div4.style.opacity = "1"
        div4.style.width = "100%"
        div4.style.backgroundPosition = "initial initial"
        div4.style.backgroundRepeat = "initial initial"
        
        div2.appendChild(image);
        div2.appendChild(div3);

        div4.appendChild(a2)
        div2.appendChild(div4);

        a.appendChild(div2);
        div1.appendChild(a);
        span.appendChild(div1);	
        i++;	
        bookshelfDiv.appendChild(span);
    }
}

function test(index) {
    console.log("Clear book URL");
    setCookie("bookURL", "", 1);
    console.log("Clear isbn");
    setCookie("isbn", "", 1);
    console.log("Reset Book URL"); 
    setCookie("bookURL", bookList[index].link, 1);
    console.log("Reset isbn");
    setCookie("isbn", bookList[index].isbn, 1);
    window.location = "reader.html";  
}

// Function to get the username from a cookie
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

// Function to set a cookie with name 'cname', value 'cvalue', and expiration time 'exdays'
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires + "; path=/;";
}

function GET_Books() {
    outAJAX++;
    $.ajax('http://www.cockyreaders-test.appspot.com/book', {
        type: 'GET',
        data: {
            user: getCookie("user"),
            fmt: 'json',
        },
        success: function(data){
            bookList = data;
            updateView();
            console.log('Books loaded.');
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
    GET_Books();
});