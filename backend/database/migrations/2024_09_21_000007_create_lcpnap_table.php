<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('lcpnap', function (Blueprint $table) {
            $table->string('LCPNAP_ID')->primary();
            $table->string('Combined_Location')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('lcpnap');
    }
};
