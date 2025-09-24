<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Status_Remarks_List', function (Blueprint $table) {
            $table->integer('UID')->primary();
            $table->string('Name')->nullable();
            $table->string('Modified_By')->nullable();
            $table->datetime('Modified_Date')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Status_Remarks_List');
    }
};
