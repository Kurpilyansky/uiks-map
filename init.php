<?php
date_default_timezone_set('UTC');

ini_set('display_errors', 1);

require_once(__DIR__ . '/vendor/autoload.php');

$dotenv = new Dotenv\Dotenv(__DIR__);
$dotenv->load();

require_once(__DIR__ . '/utils.php');

require_once(__DIR__ . '/init_db.php');

function getGet($get_key, $default = null) {
    return $_GET[$get_key] ?? $default;
}

function getPost($post_key, $default = null) {
    return $_POST[$post_key] ?? $default;
}

function isAccessGranted() {
    if (
        !(isIpAllowed() || getPost('token', '') === getenv('TOKEN'))
    ) {
        return false;
    }

    return true;
}
