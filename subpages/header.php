<?php
    $page = basename(strtok($_SERVER['REQUEST_URI'], "?"));
?>
<div class="header" aria-label="Navigation bar">
    <a href="." title="IkWilHierWeg" class="logo <?php echo $page == "IkWHW" || $page == "" ? "active" : ""?>">
        <img aria-hidden="true" src="./content/icon.svg">
        IkWHW
    </a>
    <a href="how-to" title="How to" class="<?php echo $page == "how-to" ? "active" : ""?>">
        How to
    </a>
    <a href="license" title="License" class="<?php echo $page == "license" ? "active" : ""?>">
        License
    </a>
    <a title="Github" class="right github-logo-link" target="_blank"  href="https://github.com/GewoonLeonYT/IkWHW">
        <img aria-hidden="true" class="github-logo" src="./content/github-mark.svg">
    </a>
</div>