<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Reconnection_Logs', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('Account_No')->nullable();
            $table->string('Splynx_ID')->nullable();
            $table->string('Mikrotik_ID')->nullable();
            $table->string('Provider')->nullable();
            $table->string('Username')->nullable();
            $table->datetime('Date')->nullable();
            $table->string('Plan')->nullable();
            $table->string('Group')->nullable();
            $table->decimal('Reconnection_Fee', 10, 2)->nullable();
            $table->text('Remarks')->nullable();
            $table->string('User_Email')->nullable();
            $table->string('Name')->nullable();
            $table->integer('Barangay')->nullable();
            $table->string('City')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Reconnection_Logs');
    }
};
