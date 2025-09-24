<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Support_Concern', function (Blueprint $table) {
            $table->string('Concern_Name')->primary();
            $table->string('Modified_By')->nullable();
            $table->datetime('Modified_Date')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Support_Concern');
    }
};
