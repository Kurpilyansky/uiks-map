<?php
ini_set('display_errors', 1);
require_once(__DIR__ . '/../init.php');
?>
<html>
<head>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.3.1/dist/leaflet.css"
          integrity="sha512-Rksm5RenBEKSKFjgI3a41vrjkw4EVPlJ3+OiI65vTjIdo9brlAacEuKOiQ5OFh7cOI1bkDwLqdLw3Zg0cRJAAQ=="
          crossorigin=""/>
    <link rel="stylesheet" href="https://unpkg.com/leaflet-geosearch@2.6.0/dist/style.css"
          crossorigin=""/>
    <link rel="stylesheet" href="https://unpkg.com/leaflet-geosearch@2.6.0/assets/css/leaflet.css"
          crossorigin=""/>

    <!-- Make sure you put this AFTER Leaflet's CSS -->
    <script src="https://unpkg.com/leaflet@1.3.1/dist/leaflet.js"
            integrity="sha512-/Nsx9X4HebavoBvEBuyp3I7od5tA0UzAxs+j83KgC8PU0kgB4XiK4Lfe4y4cgBtaRJQEIFCW+oC506aPT2L1zw=="
            crossorigin=""></script>
    <script src="https://unpkg.com/leaflet-geosearch@2.6.0/dist/bundle.min.js"
            crossorigin=""></script>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>

    <style>
        #mapid {
            height: 100%;
            width: 80%;
        }

        #stats {
            position: absolute;
            bottom: 60px;
            left: 128px;
            z-index: 1000;
        }

        #stats div {
            float: left;
            padding: 10px;
            margin: 3px;
            border: 1px black solid;
            background-color: yellow;
        }

        #region_filters {
            position: absolute;
            bottom: 60px;
            left: 8px;
            z-index: 1000;
        }

        .region_filter {
            float: left;
            text-align: center;
            width: 54px;
            padding: 10px;
            margin: 3px;
            border: 1px black solid;
            background-color: #4af;
        }

        #rank_filters {
            position: absolute;
            height: 50px;
            bottom: 8px;
            left: 8px;
            z-index: 1000;
        }

        .rank_filter {
            float: left;
            text-align: center;
            width: 40px;
            padding: 10px;
            margin: 3px;
            border: 1px black solid;
        }

        .inactive {
            background-color: #ccc;
        }

        a.watcher-btn {
            font-size: larger;
            font-weight: bold;
            border: 1px solid black;
            padding: 0 4px;
            text-decoration: none;
            margin: 0 10px;
            border-radius: 3px;
            color: white !important;
            background: #444;
        }
    </style>
</head>
<body class="<?= (isIpAllowed() ? 'whitelisted' : 'not_whitelisted') ?>">
<div id="mapid"></div>

    <div id="region_filters"></div>
    <div id="rank_filters"></div>
    <!-- <div id="stats"><div><b id='uiks_count'>0</b> УИК</div></div> -->
    <!-- script src='uiks.data.js' charset='utf-8'></script -->
    <script src='map.js?v=<?=rand(10000, 999999) ?>.<?=time()?>' charset='utf-8'></script>
  </body>
</html>
