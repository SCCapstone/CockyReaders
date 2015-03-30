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

function POST_Stats() {
    outAJAX++;
    $.ajax('http://www.cockyreaders-test.appspot.com/stats', {
        type: 'POST',
        data: {
            User: getCookie("user"),
            isbn: getCookie("isbn"),
            bookmark: null,
            pagesRead: currentPage
        },
        success: function(data){
           console.log("Stats updated at server");
        },
        error: function() {
            console.log('Error at server:');
        },
        complete: checkAJAX
    });
}

var currentPage;
function GET_Stats() {
    outAJAX++;
    $.ajax('http://www.cockyreaders-test.appspot.com/stats', {
        type: 'GET',
        data: {
            User: getCookie("user"),
            isbn: getCookie("isbn")
        },
        success: function(data){
           console.log("Stats fetched from server");
           currentPage = data.bookmark;
        },
        error: function() {
            console.log('Error at server:');
        },
        complete: checkAJAX
    });
}

function openToPage(currentPage) {
    for(i = 0; i < currentPage; i++) {
        reader.book.nextPage();   
    }
}

function updateCurrentPage(addition) {
    currentPage = currentPage + addition;
    POST_Stats();
}

var reader;
var user;
var bookURL;
document.onreadystatechange = function () {  
    //GET_Stats();
    
    if (document.readyState == "complete") {
        EPUBJS.filePath = "js/libs/";
        EPUBJS.cssPath = "css/";

        bookURL = getCookie("bookURL");
        reader = ePubReader(bookURL, { width: 1024, height: 768, restore: true });
        user = getCookie("user");
    }  
    
    openToPage(currentPage);
};