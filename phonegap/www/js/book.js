function POST_Stats() {
    outAJAX++;
    $.ajax('http://www.cockyreaders-test.appspot.com/book', {
        type: 'POST',
        data: {
            User: getCookie("user"),
            isbn: getCookie("isbn"),
            bookmark:,
            pagesRead:
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