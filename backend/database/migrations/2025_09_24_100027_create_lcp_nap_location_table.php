<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('LCP_NAP_Location', function (Blueprint $table) {
            $table->string('LCPNAP')->primary();
            $table->string('LCP')->nullable();
            $table->string('NAP')->nullable();
            $table->integer('PORT_TOTAL')->nullable();
            $table->string('Coordinates')->nullable();
            $table->string('Image')->nullable();
            $table->string('Modified_By')->nullable();
            $table->datetime('Modified_Date')->nullable();
            $table->string('User_Email')->nullable();
            $table->string('Image_2')->nullable();
            $table->string('Reading_Image')->nullable();
            $table->string('Street')->nullable();
            $table->integer('Barangay')->nullable();
            $table->string('City')->nullable();
            $table->string('Region')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('LCP_NAP_Location');
    }
};
