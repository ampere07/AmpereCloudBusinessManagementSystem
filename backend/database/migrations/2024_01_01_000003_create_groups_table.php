<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('groups', function (Blueprint $table) {
            $table->integer('group_id')->primary();
            $table->string('group_name');
            $table->integer('org_id');
            $table->timestamps();
            
            $table->foreign('org_id')->references('org_id')->on('organizations')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('groups');
    }
};
