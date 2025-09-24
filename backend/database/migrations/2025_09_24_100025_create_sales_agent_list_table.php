<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Sales_Agent_List', function (Blueprint $table) {
            $table->integer('ID')->primary();
            $table->string('NAME')->nullable();
            $table->string('CONTACT_NO')->nullable();
            $table->string('EMAIL')->nullable();
            $table->text('LOCATION')->nullable();
            $table->string('ID_NUMBER')->nullable();
            $table->string('STATUS')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Sales_Agent_List');
    }
};
