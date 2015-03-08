function GET_Login(theForm) {
    
    
    outAJAX++;
    var theForm = document.getElementById("loginForm");
    
    data = {"user": theForm.user.value,
            "password": theForm.password.value} 
    
    console.log("Hello")
   $.ajax('http://www.cockyreaders-test.appspot.com/login', {
        type: 'GET',
        data: data,
        dataType: 'json',
        success: function(data){			
            console.log('Login successful!');
            setCookie("user", data, 1);
            location.href = "bookshelf.html"
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log('Login failed!');
            alert("Login failed! Please try again!")
            console.log(errorThrown);
        },
        complete: checkAJAX
    });
    return false;
}

function POST_Login() {
    outAJAX++;

    var theForm = document.getElementById("registerForm");
    
    data = {"user": theForm.user.value,
            "password": theForm.password.value, 
            "firstName": theForm.firstName.value,
            "lastName": theForm.lastName.value,
            "teacher": theForm.teacher.value,
            "grade": theForm.grade.value,
            "pinNumber": theForm.pinNumber.value}
    
   $.ajax('http://www.cockyreaders-test.appspot.com/login', {
        type: 'POST',
        data: data,
        dataType: 'text',
        success: function(){			
            console.log('Registration successful!');
            location.href = "index.html";
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log('Registration failed!');
        },
        complete: checkAJAX
    });
    return false;
}

// Function to set a cookie with name 'cname', value 'cvalue', and expiration time 'exdays'
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ", " + expires + ", path=/;";
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

// Method to check if other outgoing ajax requests
function checkAJAX() {
    //console.log("Ajax request complete.")
    outAJAX = outAJAX - 1;
}

var outAJAX = 0;

$(document).ready(function() {
    console.log("ready");
});