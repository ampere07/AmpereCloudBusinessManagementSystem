<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('user_groups', function (Blueprint $table) {
            $table->integer('user_id');
            $table->integer('group_id');
            $table->timestamps();
            
            $table->primary(['user_id', 'group_id']);
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->foreign('group_id')->references('group_id')->on('groups')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_groups');
    }
};
