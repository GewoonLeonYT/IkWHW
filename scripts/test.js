var apiURL = "https://gateway.apiportal.ns.nl" 
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
                                           
function makeCookie(cookieName, cookieValue, expirationDuration) {
    const date = new Date();
    date.setTime(date.getTime() + (expirationDuration*24*60*60*1000));
    // console.log(date.toString());
    let expirationDate = date.toUTCString();
    document.cookie = cookieName + "=" + cookieValue + ";" + "expires=" + expirationDate + ";path=/"
}

async function retrieveStations() {
    const date = new Date();
    let requestParameters = "?includeNonPlannableStations=false";
    let init = {
        method: "GET",
        headers: {
            'Ocp-Apim-Subscription-Key': token,
        },
    }
 
    fetch(apiURL + "/nsapp-stations/v3" + requestParameters, init)
    .then(response => {
        return response.text();
    })
    .then(data => sessionStorage.setItem("stations", data))
    .catch(err => console.error(err));
}

let token = getCookie("has-token")  == "session" ? sessionStorage.getItem("token") : localStorage.getItem("token");
retrieveStations().then(() => {
    let stationsFull = JSON.parse(sessionStorage.getItem("stations"));
    let stationsPayload = stationsFull.payload;
    
    let stationsForm = document.getElementsByName("station")[0];
    
    for (station of stationsPayload) {
        if (station.country != "NL") continue;
    
        let stationName = station.names.long;
        let stationCode = station.id.code;
    
        let option = document.createElement("option");
        option.setAttribute("value", stationCode);
        let text = document.createTextNode(`${stationName} (${stationCode})`);
        option.appendChild(text);
        
        stationsForm.appendChild(option);
    }
    
    stationsForm.removeAttribute("disabled");
})