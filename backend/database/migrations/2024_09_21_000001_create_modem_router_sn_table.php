<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('modem_router_sn', function (Blueprint $table) {
            $table->string('SN')->primary();
            $table->string('Model')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('modem_router_sn');
    }
};
