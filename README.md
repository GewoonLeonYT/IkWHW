# IkWilHierWeg
Programma om weg te komen van de sleur.

# License
All files in this repo are licensed under the GNU Affero General Public License
version 3 or (at your option) any later version, unless otherwise specified.

# Instructions
To use this program, you must place the root of this repo on a HTTP web server
with PHP support. You may exclude the `source_data` and `helper` subfolders from
being accessible from the HTTP server.

> [!IMPORTANT]
> This website requires an NS API key with access to the `NS-APP Stations` and
`Reisinformatie` APIs. This can be acquired via the
[NS API Portal](https://apiportal.ns.nl).

The API key should be put into a file called `apiKey` on the root of the repo.
After which the `generate_data.py` Python script in the `helper` subdirectory
should be run from the root of the repo.  

Example instructions (where `$APIKEY` is your API key):
```bash
git clone https://github.com/GewoonLeonYT/IkWHW --depth 1
cd IkWHW
echo $APIKEY > apiKey
python3 -m venv .venv
./.venv/bin/pip3 install -r ./helper/requirements.txt
./.venv/bin/python3 ./helper/generate_data.py
```
