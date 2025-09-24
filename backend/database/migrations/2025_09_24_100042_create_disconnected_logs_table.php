<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Disconnected_Logs', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('Account_No')->nullable();
            $table->string('Splynx_ID')->nullable();
            $table->string('Mikrotik_ID')->nullable();
            $table->string('Provider')->nullable();
            $table->string('Username')->nullable();
            $table->datetime('Date')->nullable();
            $table->text('Remarks')->nullable();
            $table->string('User_Email')->nullable();
            $table->string('Name')->nullable();
            $table->integer('Barangay')->nullable();
            $table->string('City')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Disconnected_Logs');
    }
};
