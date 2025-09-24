<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Employee_Email', function (Blueprint $table) {
            $table->string('Email')->primary();
            $table->string('Name')->nullable();
            $table->datetime('Modified_Date')->nullable();
            $table->string('Modified_By')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Employee_Email');
    }
};
