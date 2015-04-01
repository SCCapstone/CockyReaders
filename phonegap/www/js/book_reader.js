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

var currentPage;
function GET_Stats() {
    $.ajax('http://www.cockyreaders-test.appspot.com/stats', {
        type: 'GET',
        data: {
            user: getCookie("user"),
            isbn: getCookie("isbn")
        },
        success: function(data){
           console.log("Stats fetched from server");
           currentPage = data.bookmark;
           openToPage(currentPage);
        },
        error: function() {
            console.log('Error at server:');
        } 
    });
}

function POST_Stats() {
    $.ajax('http://www.cockyreaders-test.appspot.com/stats', {
        type: 'POST',
        dataType: 'text',
        data: {
            "user": getCookie("user"),
            "isbn": getCookie("isbn"),
            "bookmark": currentPage,
            "pagesRead": currentPage
        },
        success: function(data){
           console.log(currentPage);
           console.log("Stats updated at server");
        },
        error: function() {
            console.log('Error at server:');
        }
    });
}

function openToPage(currentPage) {
    setTimeout(function() {
        console.log("Page to page " + currentPage);
        for(i = 1; i < currentPage; i++) {
            reader.book.nextPage();
        }
    }, 1000);
}

function updateCurrentPage(addition) {
    currentPage = currentPage + addition;
    POST_Stats();
}

var reader;
var user;
var bookURL;
var flag = false;
document.onreadystatechange = function () {  
    
    if (flag == false) {
    if (document.readyState == "complete") {
        flag = true;
        EPUBJS.filePath = "js/libs/";
        EPUBJS.cssPath = "css/";

        bookURL = getCookie("bookURL");
        reader = ePubReader(bookURL, { width: 1024, height: 768, restore: false });
        user = getCookie("user");
        GET_Stats();
    } 
    }
};