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
            $table->string('lcpnap_name', 255)->unique();
            $table->unsignedBigInteger('lcp_id')->nullable();
            $table->unsignedBigInteger('nap_id')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lcpnap');
    }
};
