<?php
require(__DIR__ . '/../init.php');

$uiks = json_decode('[
  {
    "id": 1,
    "vote_address": "193230, Город Санкт-Петербург, Невский район, муниципальное образование муниципальный округ N54, Тельмана улица, дом 34",
    "protocol": "УИК №1450",
    "rank": 3,
    "region_code": 78,
    "url": "http://www.st-petersburg.vybory.izbirkom.ru/region/st-petersburg?action=ik&amp;vrn=4784011156474",
    "vote_coord_lat": 59.892333,
    "vote_coord_long": 30.472912,
    "watchers_count": 0
  },
  {
    "id": 2,
    "protocol": "УИК №306",
    "rank": 8,
    "region_code": 47,
    "url": "http://www.leningrad-reg.vybory.izbirkom.ru/region/leningrad-reg?action=ik&amp;vrn=4474005231860",
    "vote_address": "&quot;188903, Ленинградская область, Выборгский район, пос.Барышево, -, -, МБУК &quot;&quot;Гончаровский КИЦ &quot;&quot;Гармония&quot;&quot; Дом культуры пос.Барышево, танцевальный зал, 1 этаж&quot;",
    "vote_coord_lat": 60.691433,
    "vote_coord_long": 29.589961,
    "watchers_count": 0
  },
  {
    "id": 3,
    "protocol": "УИК №10000",
    "rank": 3,
    "region_code": 47,
    "url": "http://www.leningrad-reg.vybory.izbirkom.ru/region/leningrad-reg?action=ik&amp;vrn=4474005231860",
    "vote_address": "&quot;188903, Ленинградская область, Выборгский район, пос.Барышево, -, -, МБУК &quot;&quot;Гончаровский КИЦ &quot;&quot;Гармония&quot;&quot; Дом культуры пос.Барышево, танцевальный зал, 1 этаж&quot;",
    "vote_coord_lat": 60.071349,
    "vote_coord_long": 30.333933,
    "watchers_count": 0
  }
]', true);
var_export($uiks);
foreach ($uiks as $uik) {
    $matches = [];
    if (preg_match('/\d+/', $uik['protocol'], $matches) === 1) {
        $uik_no = $matches[0];
    } else {
        continue;
    }

    db()->insert('insert into uik (uik_id, uik_no, region_code, longitude, latitude, rank, address, url, watchers_count)
            values (?,?,?,?,?,?,?,?,?)',
        [$uik['id'], $uik_no, $uik['region_code'], $uik['vote_coord_long'], $uik['vote_coord_lat'], $uik['rank'], $uik['vote_address'], $uik['url'], $uik['watchers_count']]
    );
}