import pandas
import json

def main():
    data = pandas.read_csv("./source_data/tariff-distances-2022-01.csv", na_filter=False)
    stations: list[str] = list(data["Station"])
    fare_units_amounts = dict()


    for from_station in stations:
        for index, to_station in enumerate(stations):
            fare_units_amount: int = data.at[index, from_station]
            fare_units_amount = int(fare_units_amount) if fare_units_amount != "XXX" else 0
            print(f"{from_station}->{to_station}: {fare_units_amount}")

            fare_units_amounts[to_station] = fare_units_amount
        with open(f"./data/fare_units/{from_station}.json", "w", encoding="utf8") as f:
            f.write(json.dumps(fare_units_amounts, indent=4))
    
if __name__ == "__main__":
    main()
# print(stations)
