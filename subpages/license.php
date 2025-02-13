<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" href="./stylesheets/global.css">
        <title>IkWHW</title>
        <link rel="icon" type="image/svg+xml" href="./content/favicon.svg">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
    <div class="header">
        <a href="." class="logo">    
            <img src="./content/icon.svg">
            IkWHW
        </a>
        <a href="how-to">
            How to
        </a>
        <a href="license" class="active">
            License
        </a>
    </div>
    <div class="centered rounded box shadow bordered">
        <p>
            All files on this website are licensed under the GNU Affero General Public License
            version 3 or (at your option) any later version, unless otherwise specified.<br>
            <?php
                include "../content/COPYING.html";
            ?>
            <li>
                All files contained in the <code>data</code> sub-directory.
            </li>
        </ul>
        </p>

    </div>
    </body>
</html>
