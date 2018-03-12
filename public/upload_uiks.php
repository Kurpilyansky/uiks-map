<?php
ini_set('upload_max_filesize', '25M');
ini_set('display_errors', 1);
ini_set('error_reporting', E_ALL);
?><!DOCTYPE html>
<html>
<head>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <title>Загрузка УИК</title>
</head>
<body><?php
$msg = '';
$error = '';

if (isset($_FILES['uiks'])) {
    if ($_FILES['uiks']['error'] == 0) {
        processFile($error, $msg);
    } else {
        $error = 'File upload error ' . $_FILES['uiks']['error'];
    }
}

function processFile(&$error, &$msg) {
    require_once(__DIR__ . '/../init.php');
    $uiks = json_decode(file_get_contents($_FILES['uiks']['tmp_name']), true);

    if (!isAccessGranted()) {
        $error = 'Что-то пошло не так';
    } elseif ($uiks === null) {
        $error = 'Загруженный файл содержит недействительный JSON';
    } else {
        ?><div id="progress"><span id="progress_count">0</span> записей обработано</div><?php
        $sql = "
            INSERT INTO uik.uik (uik_no, region_code, longitude, latitude, rank, address, url, watchers_count, protocol, updated) 
            VALUES (:uik_no, :region_code, :longitude, :latitude, :rank, :address, :url, :watchers_count, :protocol, :curr_time)
            ON DUPLICATE KEY UPDATE watchers_count = :watchers_count_2
        ";

        $db = db();
        $statement = $db->getPdo()->prepare($sql);
        $statement->bindParam(':uik_no', $uik_no);
        $statement->bindParam(':region_code', $region_code);
        $statement->bindParam(':longitude', $longitude);
        $statement->bindParam(':latitude', $latitude);
        $statement->bindParam(':rank', $rank);
        $statement->bindParam(':url', $url);
        $statement->bindParam(':address', $address);
        $statement->bindParam(':watchers_count', $watchers_count);
        $statement->bindParam(':watchers_count_2', $watchers_count);
        $statement->bindParam(':protocol', $protocol);
        $statement->bindParam(':curr_time', $curr_time);

        $i = 0;
        foreach ($uiks as $uik) {
            $uik_no = $uik['uik_number'];
            $region_code = $uik['region_code'];
            $longitude = $uik['vote_coord_long'] ?? 0;
            $latitude = $uik['vote_coord_lat'] ?? 0;
            $rank = $uik['rank'] ?? 0;
            $url = $uik['url'] ?? '';
            $address = $uik['address'] ?? '';
            $watchers_count = max(intval($uik['observers_count'] ?? 0), 0);
            $protocol = $uik['protocol'] ?? '';
            $curr_time = time();

            if (!(is_numeric($latitude) && is_numeric($longitude))) {
                continue;
            }

            $rank = intval($rank);
            $rank = min($rank, 15);
            $rank = max($rank, 3);

            $statement->execute();

            if (++$i % 100 == 0) {
                ?><script>document.getElementById('progress_count').innerText = <?= $i ?></script><?php
                flush();
                ob_flush();
            }
        }
        ?><script>document.getElementById('progress_count').innerText = <?= $i ?></script><?php
        $msg = count($uiks) . ' записей обновлены';
    }
}
?>
<div style="color: red; font-weight: bold"><?= $error ?></div>
<div style="color: green; font-weight: bold"><?= $msg ?></div>
<form enctype="multipart/form-data" method="POST" id="upload_form">
    <fieldset>
        <input type="password" name="token" placeholder="Введите секретный код"><br>
        <label for="uiks">Выберите файл со списом УИК </label><input type="file" name="uiks" id="uiks"><br><br>
        <input type="submit" value="Отправить" id="submit_btn">
    </fieldset>
</form>
<script type="text/javascript">
    $('#upload_form').submit(function (e){
        if ($(this).is('disabled')) {
        	e.preventDefault();
        	return;
        }

        $(this).addClass('disabled');
	})
</script>
</body>
</html>
