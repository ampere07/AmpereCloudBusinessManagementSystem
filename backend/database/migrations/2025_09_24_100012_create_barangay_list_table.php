<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Barangay_List', function (Blueprint $table) {
            $table->integer('id')->primary();
            $table->string('Name');
            $table->string('City');
        });
    }

    public function down()
    {
        Schema::dropIfExists('Barangay_List');
    }
};
