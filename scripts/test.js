function getCookie(cookieName) {
    let name = cookieName + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let cookieArray = decodedCookie.split(";");
    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i];
        while (cookie.charAt(0) == " ") {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) == 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }
    return "";
}

{
    let textElement = document.getElementById("api-key");
    if (getCookie("has-token") == "session") {
        var newText = document.createTextNode(sessionStorage.getItem("token"));
    } else if (getCookie("has-token") == "local") {
        var newText = document.createTextNode(localStorage.getItem("token"));
    }
    
    textElement.appendChild(newText);
}