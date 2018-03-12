<?php
phpinfo();exit;

require(__DIR__ . '/../init.php');

ini_set('display_errors', 1);
ini_set('error_reporting', E_ALL);

var_export(db()->select('select * from uik'));