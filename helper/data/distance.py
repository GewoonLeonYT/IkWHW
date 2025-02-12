#!/usr/bin/env python3
import requests
import math
import json

def main():
    with open("./apiKey", "r", encoding="utf8") as f:
        token: str = f.readline()
    
    api_url: str = "https://gateway.apiportal.ns.nl/nsapp-stations/v3"
    timeout: int = 5

    params: dict = {
        "includeNonPlannableStations": False,
    }

    headers: dict = {
        "Ocp-Apim-Subscription-Key": token
    }

    stations: list[dict] = requests.api.get(api_url, params, timeout=timeout, headers=headers).json()["payload"]
    stations = [station for station in stations if station["country"] == "NL"]


    for station_from in stations:
        station_from_code = station_from["id"]["code"]
        station_from_location: dict[str, float] = station_from["location"]
        station_from_latitude = station_from_location["lat"]
        station_from_longitude = station_from_location["lng"]
        distances: dict = dict()
        for station_to in stations:
            station_to_code = station_to["id"]["code"]
            station_to_location: dict[str, float] = station_to["location"]
            station_to_latitude = station_to_location["lat"]
            station_to_longitude = station_to_location["lng"]

            middle_latitude = (station_from_latitude + station_to_latitude)/2

            kpd_lat = 111.13209 - 0.56605*math.cos(math.radians(2*middle_latitude)) + 0.00120*math.cos(math.radians(4*middle_latitude))
            kpd_long = 111.41513*math.cos(math.radians(middle_latitude)) - 0.09455*math.cos(math.radians(3*middle_latitude)) + 0.00012*math.cos(math.radians(5*middle_latitude))

            distance_north_south = kpd_lat*(station_from_latitude - station_to_latitude)
            distance_east_west = kpd_long*(station_from_longitude - station_to_longitude)

            distance = math.sqrt(distance_north_south**2 + distance_east_west**2)

            distances[station_to_code] = distance

        distances = {station_code: distance for station_code, distance in sorted(distances.items(), key=lambda item: item[1], reverse=True)}
        with open(f"./data/distances/{station_from_code}.json", "w", encoding="utf8") as f:
            f.write(json.dumps(distances, indent=4))

if __name__ == "__main__":
    main() 