<?php
function getRemoteIp() {
    return $_SERVER['REMOTE_ADDR'];
}

function isIpAllowed() {
    return in_array(getRemoteIp(), explode(',', getenv('IP_WHITE_LIST')));
}