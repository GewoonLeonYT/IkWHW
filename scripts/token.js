function makeCookie(cookieName, cookieValue, expirationDuration) {
    const date = new Date();
    date.setTime(date.getTime() + (expirationDuration*24*60*60*1000));
    // console.log(date.toString());
    let expirationDate = date.toUTCString();
    document.cookie = cookieName + "=" + cookieValue + ";" + "expires=" + expirationDate + ";path=/"
}

function makeTempCookie(cookieName, cookieValue) {
    document.cookie = cookieName + "=" + cookieValue + ";path=/";
}



document.getElementById("token-block-form").addEventListener("submit", e => {
    e.preventDefault();
    var form = e.target;
    
    var formData = new FormData(form);
    var token = formData.get("token");
    var remember = formData.get("remember-token");

    if (remember) {
        localStorage.setItem("token", token);
        makeCookie("has-token", "local", 365);
    } else {
        sessionStorage.setItem("token", token);
        makeTempCookie("has-token", "session");
    }

    location.reload();
});