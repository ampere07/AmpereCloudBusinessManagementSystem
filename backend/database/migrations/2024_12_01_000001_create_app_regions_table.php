<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Create the table if it doesn't exist
        if (!Schema::hasTable('app_regions')) {
            Schema::create('app_regions', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->timestamps();
            });
        }
        
        // Check if NCR region exists, if not insert it
        $ncrExists = DB::table('app_regions')->where('id', 1)->exists();
        if (!$ncrExists) {
            DB::table('app_regions')->insert([
                'id' => 1,
                'name' => 'National Capital Region (NCR)',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        
        // Also ensure the app_cities table has the region_id properly set
        if (Schema::hasTable('app_cities')) {
            // Update Manila city to have region_id = 1 if it doesn't already
            DB::table('app_cities')
                ->where('id', 1)
                ->where('name', 'Manila')
                ->update(['region_id' => 1]);
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('app_regions');
    }
};
