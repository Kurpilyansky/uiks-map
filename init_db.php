<?php
/**
 * @return \Illuminate\Database\Connection
 */
function db()
{
    static $connection;

    if ($connection === null) {
        $capsule = new Illuminate\Database\Capsule\Manager();
        $capsule->addConnection([
            'driver' => getenv('DB_DRIVER'),
            'host' => getenv('DB_HOST'),
            'database' => getenv('DB_DATABASE'),
            'username' => getenv('DB_USERNAME'),
            'password' => getenv('DB_PASSWORD'),
            'charset' => 'utf8',
            'collation' => 'utf8_unicode_ci',
            'prefix' => '',
        ]);

        $connection = $capsule->getConnection();
    }

    return $connection;
}