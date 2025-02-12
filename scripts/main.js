const urlAPI = "https://gateway.apiportal.ns.nl";
const stationsAPI = "nsapp-stations/v3";
const pricesAPI = "reisinformatie-api/api/v3/price";
const tripsAPI = "reisinformatie-api/api/v3/trips"
const bareFare = 112;
const farePerFareUnit = 20; // This is delibrately an underestimation.
let stationsPayload;

let token = getCookie("has-token") == "session" ?
sessionStorage.getItem("token") : localStorage.getItem("token");

async function callAPI(apiSubPage, requestParameters) {
    let fullURL = `${urlAPI}/${apiSubPage}?${requestParameters}`;
    let init = {
        method: "GET",
        headers: {
            'Ocp-Apim-Subscription-Key': token,
        },
    }

    const response = await fetch(fullURL, init);
    return response;
}

async function getData(dataPath) {
    const response = await fetch(dataPath);
    return response.json();
}

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
    date.setTime(date.getTime() + (expirationDuration * 24 * 60 * 60 * 1000));
    // console.log(date.toString());
    let expirationDate = date.toUTCString();
    document.cookie = cookieName + "=" + cookieValue + ";" + "expires="
    + expirationDate + ";path=/"
}

// function populateStations(stationsFull) {
    
//     return stationsPayload;
// }

document.addEventListener("DOMContentLoaded", async () => {
    let requestParameters = "includeNonPlannableStations=false";
    let stationsResponse = await callAPI(stationsAPI, requestParameters);
    let stationsFull = await stationsResponse.json();

    stationsPayload = stationsFull.payload;

    stationsPayload.sort((a, b) => a.names.long.localeCompare(b.names.long))

    let stationsForm = document.getElementById("station");

    for (station of stationsPayload) {
        if (station.country != "NL") continue;

        let stationNameLong = station.names.long;
        let stationCode = station.id.code;

        let option = document.createElement("option");
        option.setAttribute("value", stationCode);
        option.setAttribute("label", `${stationNameLong} (${stationCode})`);
        stationsForm.appendChild(option);
    }

    stationsForm.removeAttribute("disabled");
})

document.addEventListener("submit", async e => {
    e.preventDefault();
    let form = e.target;

    let formData = new FormData(form);
    let stationCode = formData.get("station");
    let budgetInCents = Number(formData.get("budget")).toFixed(2)*100;

    let station = stationsPayload.find(station => station.id.code ==
        stationCode);
    // let stationNameLong = station.names.long;

    let foundFurthestStation = false;

    let distances = await getData(`./data/distances/${stationCode}.json`);
    let fare_units = await getData(`./data/fare_units/${stationCode}.json`);

    for (let toStationCode in distances) {
        let estimatedPrice = bareFare + (farePerFareUnit * fare_units[toStationCode]);
        let actualPrice;
        let trip;
        if (estimatedPrice > budgetInCents || toStationCode == stationCode)  continue;
        let toStation = stationsPayload.find(station => station.id.code ==
            toStationCode);
        let toStationNameLong = toStation.names.long;
        let distance = distances[toStationCode];
        let priceRequestParameters = `fromStation=${stationCode}&toStation=`
        + `${toStationCode}&adults=1&children=0&travelClass=SECOND_CLASS`
        + `&travelType=single`;
        let tripsRequestParameters = `fromStation=${stationCode}&toStation=`
        + `${toStationCode}`
        let priceResponse = await callAPI(pricesAPI, priceRequestParameters);
        let priceFull = await priceResponse.json();

        if (priceResponse.status == 200) {
            actualPrice = priceFull.payload.prices[0].totalPriceInCents;
        } else if (priceResponse.status == 500
            && priceFull.errors[0].message == 
            "Multiple routes are possible with different prices." ) {
            let tripsResponse = await callAPI(tripsAPI, tripsRequestParameters);
            let tripsFull = await tripsResponse.json();
            let trips = tripsFull.trips;
            let shortestRouteId;
            
            for (trip of trips) {
                // console.log(trip);
                let tripPrice = trip.productFare.priceInCents;
                let routeId = trip.fareRoute.routeId;
                if (actualPrice === undefined || tripPrice < actualPrice) {
                    actualPrice = tripPrice;
                    shortestRouteId = routeId;
                }
            }
        }
        if (actualPrice <= budgetInCents) {
            alert(`The furthest station is ${toStationNameLong}, which is ${distance.toFixed(2)} km away and costs ${(actualPrice / 100).toLocaleString({}, {style: "currency",
            currency:"EUR"})}`);
            foundFurthestStation = true;
            break;
        }

    }
    if (!foundFurthestStation) {
        alert("You cannot travel to any station :c");
    }    
})
