<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->integer('user_id')->primary();
            $table->string('salutation', 10)->nullable();
            $table->string('full_name');
            $table->string('username')->unique();
            $table->string('email')->unique();
            $table->string('mobile_number', 20)->nullable();
            $table->string('password_hash');
            $table->integer('org_id')->nullable();
            $table->timestamps();
            
            $table->foreign('org_id')->references('org_id')->on('organizations')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
};
