<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class DatabaseIndexSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::connection('mongodb')->table('musics', function ($collection) {
            $collection->index('title');
            $collection->index('artist');
            $collection->index('created_at');
        });

        Schema::connection('mongodb')->table('albums', function ($collection) {
            $collection->index('title');
            $collection->index('artist');
            $collection->index('created_at');
        });



        $this->command->info('MongoDB Indexes created successfully!');
    }
}
