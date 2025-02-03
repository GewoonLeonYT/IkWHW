function makeCookie(cookieName, cookieValue, expirationDuration) {
    const date = new Date();
    date.setTime(date.getTime() + (expirationDuration*24*60*60*1000));
    // console.log(date.toString());
    let expirationDate = date.toUTCString();
    document.cookie = cookieName + "=" + cookieValue + ";" + "expires=" + expirationDate + ";path=/"
}

makeCookie("number", 10, 10);