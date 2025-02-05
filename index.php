<?php
    $loadPage = isset($_COOKIE["has-token"]) ? "test" : "token";
    $styles = array("global", $loadPage);
?>
<!DOCTYPE html>
<html>
    <head>
        <?php
            foreach ($styles as $style) {
                echo '<link rel="stylesheet" href="stylesheets/' . $style . '.css">';
            }
        ?>
        <title>IkWHW</title>
    </head>
    <body>
        <?php
            include "subpages/" . $loadPage . ".html";
        ?>
    </body>
</html>
