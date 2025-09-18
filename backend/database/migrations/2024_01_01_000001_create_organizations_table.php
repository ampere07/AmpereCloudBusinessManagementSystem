<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->integer('org_id')->primary();
            $table->string('org_name');
            $table->string('org_type');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('organizations');
    }
};
