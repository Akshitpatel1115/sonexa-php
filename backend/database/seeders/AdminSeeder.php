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
        $adminEmail = 'admin@sonexa.com';

        if (Admin::where('email', $adminEmail)->exists()) {
            $this->command->info('Master admin already exists!');
            return;
        }

        Admin::create([
            'name' => 'Super Admin',
            'email' => $adminEmail,
            'password' => Hash::make('Admin@123'),
            'permissions' => ['*'], // Master wildcard permission
            'is_active' => true,
        ]);

        $this->command->info("Master admin created! Email: {$adminEmail}, Password: Admin@123");
    }
}
