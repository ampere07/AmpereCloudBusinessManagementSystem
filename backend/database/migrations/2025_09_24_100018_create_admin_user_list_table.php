<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Admin_User_List', function (Blueprint $table) {
            $table->string('Email')->primary();
            $table->string('Name')->nullable();
            $table->datetime('Modified_Date')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Admin_User_List');
    }
};
