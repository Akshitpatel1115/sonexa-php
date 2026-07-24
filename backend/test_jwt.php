<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$token = JWT::encode(['id' => '123', 'role' => 'user'], env('JWT_SECRET'), 'HS256');
echo "Token: " . $token . "\n";

try {
    $decoded = JWT::decode($token, new Key(env('JWT_SECRET'), 'HS256'));
    echo "Decoded: " . json_encode($decoded) . "\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
