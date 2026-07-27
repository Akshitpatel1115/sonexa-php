<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminEmail = env('ADMIN_EMAIL', 'admin@example.com');
        $adminPassword = env('ADMIN_PASSWORD', 'secret123');

        Admin::updateOrCreate(
            ['email' => $adminEmail],
            [
                'name' => 'Super Admin',
                'email' => $adminEmail,
                'password' => Hash::make($adminPassword),
                'permissions' => ['*'], // Master wildcard permission
                'is_active' => true,
            ]
        );

        $this->command->info("Master admin seeded securely from environment variables!");
    }
}
