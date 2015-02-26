function GET_Login(theForm) {
    
     outAJAX++;
    $.ajax('http://localhost:8080/Login', {
        type: 'GET',
        data: {
            user:theForm.username;
            pass:theForm.password;
        },
        success: function(data){			
            console.log('Login successful!');
            setCookie("user", theForm.username, 1);
            //REDIRECT
        },
        error: function() {
            console.log('Login failed!');
            //ALERT: Please register
        },
        complete: checkAJAX
    });
}

// Function to set a cookie with name 'cname', value 'cvalue', and expiration time 'exdays'
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires + "; path=/;";
}

// Method to check if other outgoing ajax requests
function checkAJAX() {
    //console.log("Ajax request complete.")
    outAJAX = outAJAX - 1;
    if (outAJAX == 0) updateView();
}

var outAJAX = 0;
$(document).ready(function() {
    console.log("ready");
});