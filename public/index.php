<?php
ini_set('error_reporting', E_ALL);
require_once(__DIR__ . '/../init.php');

switch (getPost('action')) {
    case 'getUiks':
        echo json_encode(getUiks());
        break;
    case 'incWatcher':
        echo json_encode(updateWatcher(getPost('uik_id', 0), 1));
        break;
    case 'decWatcher':
        echo json_encode(updateWatcher(getPost('uik_id', 0), -1));
        break;
    case 'getUpdated':
        echo json_encode(getUpdated(getPost('updated', 0)));
        break;
    default:
        echo json_encode([]);
}

function getUiks()
{
    return db()->select("
      SELECT uik_id as id,
            CONCAT('УИК №', uik_no) as protocol,
            rank, region_code, longitude as vote_coord_long,
            latitude as vote_coord_lat, url, address as vote_address,
            watchers_count, updated
       FROM uik.uik
       ORDER BY latitude, longitude"
    );
}

function updateWatcher($uik_id, $increment) {
    $now = time();
    $sql = "UPDATE uik SET watchers_count=watchers_count + ?, updated = $now 
            WHERE uik_id=? AND NOT (watchers_count=0 AND ? < 0)";

    db()->update($sql, [$increment, $uik_id, $increment]);

    $row = db()->selectOne("SELECT watchers_count, updated FROM uik WHERE uik_id=?", [$uik_id]);
//    $row = (array)$row;
    return $row;
}

function getUpdated($since) {
    $since = intval($since);
    $now = time();
    $sql = "SELECT uik_id as id, watchers_count FROM uik WHERE updated > $since";
    return ['updated'=>$now, 'rows' => db()->select($sql)];
}