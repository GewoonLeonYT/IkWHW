<?php
    $loadPage = isset($_COOKIE["has-token"]) ? "main" : "token";
    $styles = array("global", $loadPage);
?>
<!DOCTYPE html>
<html>
    <head>
        <?php
            foreach ($styles as $style) {
                echo '<link rel="stylesheet" href="./stylesheets/' . $style . '.css">';
            }
        ?>
        <title>IkWHW</title>
        <link rel="icon" type="image/svg+xml" href="./content/favicon.svg">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
    <div class="header">
        <a href="." class="active logo">    
            <img src="./content/icon.svg">
            IkWHW
        </a>
        <a href="./how-to">
            How to
        </a>
    </div>
        <?php
            include "./subpages/" . $loadPage . ".html";
        ?>
    </body>
</html>
