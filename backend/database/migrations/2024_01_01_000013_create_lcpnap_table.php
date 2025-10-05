<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lcpnap', function (Blueprint $table) {
            $table->id();
            $table->string('LCPNAP_ID', 255)->unique();
            $table->unsignedBigInteger('lcp_id');
            $table->unsignedBigInteger('nap_id');
            $table->integer('port_total')->default(8);
            $table->string('street', 255)->nullable();
            $table->string('barangay', 255)->nullable();
            $table->string('city', 255)->nullable();
            $table->string('region', 255)->nullable();
            $table->text('coordinates')->nullable();
            $table->string('Combined_Location', 500)->nullable();
            $table->string('image', 255)->nullable();
            $table->string('image2', 255)->nullable();
            $table->string('reading_image', 255)->nullable();
            $table->string('modified_by', 255)->nullable();
            $table->timestamp('modified_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lcpnap');
    }
};
