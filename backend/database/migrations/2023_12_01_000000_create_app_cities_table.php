<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAppCitiesTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Only create if it doesn't exist already
        if (!Schema::hasTable('app_cities')) {
            Schema::create('app_cities', function (Blueprint $table) {
                $table->id();
                $table->foreignId('region_id')->nullable()->constrained('app_regions')->onDelete('cascade');
                $table->string('name');
                $table->string('code')->nullable();
                $table->text('description')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                // Add index for faster lookups
                $table->index('name');
            });
            
            // Insert some initial cities
            DB::table('app_cities')->insert([
                ['region_id' => 1, 'name' => 'Binangonan', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
                ['region_id' => 1, 'name' => 'Tagpos', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
                ['region_id' => 1, 'name' => 'Tatala', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
                ['region_id' => 1, 'name' => 'Pantok', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
                ['region_id' => 1, 'name' => 'Manila', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
                ['region_id' => 1, 'name' => 'Quezon City', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
                ['region_id' => 1, 'name' => 'Makati', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
                ['region_id' => 1, 'name' => 'Pasig', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
                ['region_id' => 1, 'name' => 'Taguig', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
                ['region_id' => 1, 'name' => 'Pasay', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_cities');
    }
}
