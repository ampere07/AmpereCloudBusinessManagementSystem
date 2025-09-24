<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('LCP', function (Blueprint $table) {
            $table->string('LCP_Name')->primary();
            $table->datetime('Modified_Date')->nullable();
            $table->string('Modified_By')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('LCP');
    }
};
