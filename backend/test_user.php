<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
$u = User::first();
echo "First User ID: " . $u->_id . "\n";
$found = User::find((string)$u->_id);
echo "Found User: " . ($found ? "Yes" : "No") . "\n";
