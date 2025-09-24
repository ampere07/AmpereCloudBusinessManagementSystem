<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Email_Logs', function (Blueprint $table) {
            $table->integer('id')->primary();
            $table->string('email_address')->nullable();
            $table->string('status')->nullable();
            $table->datetime('date_sent')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Email_Logs');
    }
};
