<?php
    $status = isset($_GET['code']) ? (int)$_GET['code'] : 500;
    $reasons = [
        403 => "Forbidden",
        404 => "Not Found",

        500 => "Internal Server Error",
        502 => "Bad Gateway",
        503 => "Service Unavailable",
        504 => "Gateway Timeout"
    ];
    $reason = $reasons[$status];
?>
<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" href="/stylesheets/global.css">
        <title>IkWHW</title>
        <link rel="icon" type="image/svg+xml" href="/content/favicon.svg">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
        <?php
            include "subpages/header.php";
        ?>
        <div class="centered rounded box shadow bordered">
            <span>
                <?php
                    echo $status, " ", $reason;
                ?>
            </span>
        </div>
    </body>
</html>