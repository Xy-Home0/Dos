<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin Xyro',
            'email' => 'xyro@admin.com',
            'password' => Hash::make('xyro@123'),
            'contact_number' => '1234567890',
            'role' => 'admin'
        ]);
    }
}
