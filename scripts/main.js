const urlAPI = "https://gateway.apiportal.ns.nl";
const stationsAPI = "nsapp-stations/v3";
const pricesAPI = "reisinformatie-api/api/v3/price";
const tripsAPI = "reisinformatie-api/api/v3/trips"
const bareFare = 112;
const farePerFareUnit = 19; // This is delibrately an underestimation.
let distanceUnitElement = document.createElement("abbr");
distanceUnitElement.setAttribute("title", "kilometers");
distanceUnitElement.appendChild(document.createTextNode("km"));
const timeFormatterNL = new Intl.DateTimeFormat(
    "nl-NL",
    {
        timeZone: "Europe/Amsterdam",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
    }
);
const timeFormatterUTC = new Intl.DateTimeFormat(
    "nl-NL",
    {
        timeZone: "UTC",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
    }
)
const spaceText = document.createTextNode(" ");
const rightArrowText = document.createTextNode("→")
let stationsPayload;

let token = getCookie("has-token") == "session" ?
sessionStorage.getItem("token") : localStorage.getItem("token");

async function callAPI(apiSubPage, requestParameters, cache = "") {
    let fullURL = `${urlAPI}/${apiSubPage}?${requestParameters}`;
    let init = {
        method: "GET",
        headers: {
            'Ocp-Apim-Subscription-Key': token,
        },
    }
    if (cache !== "") {
        init.cache = cache;
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
    
    let loadingTextElement = document.createElement("span");
    loadingTextElement.innerHTML = "Loading...";
    let loadingDiv = document.getElementById("loading");
    let resultsDiv = document.getElementById("results");
    let loadingSpinner = document.createElement("div");
    loadingSpinner.classList.add("loading-spinner", "center-aligned");
    
    loadingDiv.innerHTML = "";
    resultsDiv.innerHTML = "";
    
    loadingDiv.appendChild(loadingTextElement);
    loadingDiv.appendChild(loadingSpinner);
    loadingDiv.classList.remove("hidden");

    resultsDiv.classList.add("hidden");


    let form = e.target;

    let formData = new FormData(form);
    let stationCode = formData.get("station");
    let budgetInCents = Number(formData.get("budget")).toFixed(2)*100;

    let station = stationsPayload.find(station => station.id.code ==
        stationCode);
    let stationNameLong = station.names.long;

    let foundFurthestStation = false;

    let distances = await getData(`./data/distances/${stationCode}.json`);
    let fare_units = await getData(`./data/fare_units/${stationCode}.json`);

    let trips;
    let cheapestTrips;

    for (let toStationCode in distances) {
        /* For NS, starting at 119 fare units - because it can't ever be simple -
        the price only goes up by 10; this compensates for that */
        let estimatedPrice = bareFare + (farePerFareUnit * Math.min(119, fare_units[toStationCode])) + ((farePerFareUnit / 2) * Math.max(0, fare_units[toStationCode] - 119));
        let actualPrice;
        let trip;
        if (estimatedPrice > budgetInCents || toStationCode == stationCode) continue;
        
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

        loadingTextElement.innerHTML = `Retrieving price for ${stationNameLong} → ${toStationNameLong} (${distance.toFixed(2)} ${distanceUnitElement.outerHTML})`;

        /* NS API returns status code 500 if there are multiple routes with different prices.
        This calls the trips API, and gets the lowest price with that API. 
        */
        if (priceResponse.status == 200) {
            actualPrice = priceFull.payload.prices[0].totalPriceInCents;
            trips = undefined;
        } else if (priceResponse.status == 500 
        && priceFull.errors[0].message == 
        "Multiple routes are possible with different prices." ) {
            let tripsResponse = await callAPI(tripsAPI, tripsRequestParameters, "no-store");
            let tripsFull = await tripsResponse.json();
            trips = tripsFull.trips;
            
            for (trip of trips) {
                if (trip.productFare === undefined) continue;
                let tripPrice = trip.productFare.priceInCents;
                if (actualPrice === undefined || tripPrice < actualPrice) {
                    actualPrice = tripPrice;
                }
            }
        }
        if (actualPrice <= budgetInCents) {
            if (trips == undefined) {
                tripsResponse = await callAPI(tripsAPI, tripsRequestParameters, "no-store");
                tripsFull = await tripsResponse.json();
                trips = tripsFull.trips;
            }
            
            cheapestTrips = trips.filter(trip => {
                if (trip.productFare === undefined) return false;
                let tripPrice = trip.productFare.priceInCents;
                return tripPrice === actualPrice;
            });
            
            loadingDiv.innerHTML = "";
            loadingDiv.classList.add("hidden");
            
            let tripText = document.createTextNode(`The furthest station is ${toStationNameLong}, which is ${distance.toFixed(2)} km away and costs ${(actualPrice / 100).toLocaleString({}, {style: "currency",
            currency:"EUR"})}`);
            
            resultsDiv.classList.remove("hidden");
            
            for (trip of cheapestTrips) {
                let tableDiv = document.createElement("div");
                let shareLink = trip.shareUrl.uri;
                let shareLinkElement = document.createElement("a")
                shareLinkElement.setAttribute("href", shareLink);
                shareLinkElement.setAttribute("target", "_blank");
                shareLinkElement.setAttribute("title", "View travel advice on NS website")
                let table = document.createElement("table");
                let tableBody = document.createElement("tbody");
                let tableRow1 = document.createElement("tr")
                let tableRow2 = document.createElement("tr")
                let journeyPrice = (trip.productFare.priceInCents / 100).toLocaleString({}, {style: "currency", currency:"EUR"});
                let tripLegs = trip.legs;
                let plannedJourneyLength = trip.plannedDurationInMinutes;
                let actualJourneyLength = trip.actualDurationInMinutes;
                let plannedDepartureTime = new Date(tripLegs[0].origin.plannedDateTime);
                let actualDepartureTime = new Date(tripLegs[0].origin.actualDateTime ? tripLegs[0].origin.actualDateTime : tripLegs[0].origin.plannedDateTime);
                let plannedArrivalTime = new Date(tripLegs[tripLegs.length - 1].destination.plannedDateTime);
                let actualArrivalTime = new Date(actualDepartureTime.getTime() + actualJourneyLength*60*1000);
                let differenceJourneyLength = actualJourneyLength - plannedJourneyLength;
                let differenceDepartureTimes = (actualDepartureTime - plannedDepartureTime)/(1000*60);
                let differenceArrivalTimes = (actualArrivalTime - plannedArrivalTime)/(1000*60);

                let tableRow1Column1 = document.createElement("td");
                
                tableRow1Column1.innerHTML = `${toStationNameLong} (${distance.toFixed(2)} ${distanceUnitElement.outerHTML})`;
                
                tableRow1.appendChild(tableRow1Column1);

                let tableRow1Column2 = document.createElement("td");
                let journeyPriceText = document.createTextNode(journeyPrice);
                tableRow1Column2.appendChild(journeyPriceText);
                tableRow1.appendChild(tableRow1Column2);

                let tableRow2Column1 = document.createElement("td");
                let plannedDepartureTimeString = timeFormatterNL.format(plannedDepartureTime); 
                let plannedDepartureTimeText = document.createTextNode(plannedDepartureTimeString);
                let plannedDepartureTimeElement;
                
                let actualDepartureTimeString = timeFormatterNL.format(actualDepartureTime);
                let actualDepartureTimeText = document.createTextNode(actualDepartureTimeString);
                let actualDepartureTimeElement;

                let plannedArrivalTimeString = timeFormatterNL.format(actualArrivalTime);
                let plannedArrivalTimeText = document.createTextNode(plannedArrivalTimeString);
                let plannedArrivalTimeElement;

                let actualArrivalTimeString = timeFormatterNL.format(actualArrivalTime);
                let actualArrivalTimeText = document.createTextNode(actualArrivalTimeString);
                let actualArrivalTimeElement;

                if (differenceDepartureTimes) {
                    plannedDepartureTimeElement = document.createElement("del");
                    actualDepartureTimeElement = document.createElement("ins");
                } else {
                    plannedDepartureTimeElement = document.createElement("time")
                }
                plannedDepartureTimeElement.setAttribute("aria-label", `Planned departure time: ${plannedDepartureTimeString}`);
                plannedDepartureTimeElement.appendChild(plannedDepartureTimeText);
                actualDepartureTimeElement?.setAttribute("aria-label", `Actual departure time: ${actualDepartureTimeString}`)
                actualDepartureTimeElement?.appendChild(actualDepartureTimeText);

                if (differenceArrivalTimes) {
                    plannedArrivalTimeElement = document.createElement("del");
                    actualArrivalTimeElement = document.createElement("ins");
                } else {
                    plannedArrivalTimeElement = document.createElement("time");
                }
                plannedArrivalTimeElement.setAttribute("aria-label", `Planned arrival time: ${plannedArrivalTimeString}`);
                plannedArrivalTimeElement.appendChild(plannedArrivalTimeText);
                actualArrivalTimeElement?.setAttribute("aria-label", `Actual arrival time: ${actualArrivalTimeString}`);
                actualArrivalTimeElement?.appendChild(actualArrivalTimeText);

                tableRow2Column1.appendChild(plannedDepartureTimeElement);
                if (actualDepartureTimeElement) {
                    tableRow2Column1.appendChild(spaceText.cloneNode());
                    tableRow2Column1.appendChild(actualDepartureTimeElement);
                }
                tableRow2Column1.appendChild(spaceText.cloneNode());
                tableRow2Column1.appendChild(rightArrowText.cloneNode());
                tableRow2Column1.appendChild(spaceText.cloneNode());

                tableRow2Column1.appendChild(plannedArrivalTimeElement);
                if (actualArrivalTimeElement) {
                    tableRow2Column1.appendChild(spaceText.cloneNode());
                    tableRow2Column1.appendChild(actualArrivalTimeElement);
                }
                tableRow2.appendChild(tableRow2Column1);

                let tableRow2Column2 = document.createElement("td");
                let plannedDuration = new Date(0);
                plannedDuration.setMinutes(plannedJourneyLength);
                let actualDuration = new Date(0);
                actualDuration.setMinutes(actualJourneyLength);
                let plannedDurationString = timeFormatterUTC.format(plannedDuration);
                let actualDurationString = timeFormatterUTC.format(actualDuration);
                let plannedDurationText = document.createTextNode(plannedDurationString);
                let actualDurationText = document.createTextNode(actualDurationString);
                let plannedDurationElement;
                let actualDurationElement;

                if (differenceJourneyLength) {
                    plannedDurationElement = document.createElement("del");
                    actualDurationElement = document.createElement("ins");
                } else {
                    plannedDurationElement = document.createElement("time")
                }
                plannedDurationElement.setAttribute("aria-label", `Planned journey length: ${plannedDurationString}`);
                plannedDurationElement.appendChild(plannedDurationText);
                actualDurationElement?.setAttribute("aria-label", `Actual journey length: ${actualDurationString}`)
                actualDurationElement?.appendChild(actualDurationText);
                if (actualDurationElement) {
                    tableRow2Column2.appendChild(actualDurationElement);
                    tableRow2Column2.appendChild(spaceText.cloneNode());
                }
                tableRow2Column2.appendChild(plannedDurationElement);
                tableRow2.appendChild(tableRow2Column2);

                tableBody.appendChild(tableRow1);
                tableBody.appendChild(tableRow2);
                table.appendChild(tableBody);
                shareLinkElement.appendChild(table);
                tableDiv.appendChild(shareLinkElement);
                resultsDiv.appendChild(tableDiv);
            }

            foundFurthestStation = true;
            break;
        }
    }
    if (!foundFurthestStation) {
        alert("You cannot travel to any station :c");
    }    
})
