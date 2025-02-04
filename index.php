<?php
    $pages = array("token", "test");
?>
<!DOCTYPE html>
<html>
    <head>
        <?php
            foreach ($pages as $page) {
                echo '<link rel="stylesheet" href="stylesheets/' . $page . '.css">';
            }
        ?>
    </head>
    <body>
        <?php
            
            if (isset($_COOKIE["has-token"])) {
                include "subpages/test.html";
            } else {
                include "subpages/token.html";
            }
        ?>
    </body>
</html>
