<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Online_Status', function (Blueprint $table) {
            $table->string('Account_No')->nullable();
            $table->string('Username')->nullable();
            $table->string('Status')->nullable();
            $table->string('Group')->nullable();
            $table->string('SPLYNX_ID')->nullable();
            $table->string('MIKROTIK_ID')->nullable();
            $table->date('Present_Date')->nullable();
            $table->string('Present_Download')->nullable();
            $table->string('Present_Upload')->nullable();
            $table->date('Day_1')->nullable();
            $table->string('Day_1_Download')->nullable();
            $table->string('Day_1_Upload')->nullable();
            $table->date('Day_2')->nullable();
            $table->string('Day_2_Download')->nullable();
            $table->string('Day_2_Upload')->nullable();
            $table->date('Day_3')->nullable();
            $table->string('Day_3_Download')->nullable();
            $table->string('Day_3_Upload')->nullable();
            $table->date('Day_4')->nullable();
            $table->string('Day_4_Download')->nullable();
            $table->string('Day_4_Upload')->nullable();
            $table->date('Day_5')->nullable();
            $table->string('Day_5_Download')->nullable();
            $table->string('Day_5_Upload')->nullable();
            $table->date('Day_6')->nullable();
            $table->string('Day_6_Download')->nullable();
            $table->string('Day_6_Upload')->nullable();
            $table->date('Day_7')->nullable();
            $table->string('Day_7_Download')->nullable();
            $table->string('Day_7_Upload')->nullable();
            $table->string('Total_Download')->nullable();
            $table->string('Total_Upload')->nullable();
            $table->integer('Barangay')->nullable();
            $table->string('IP')->nullable();
            $table->string('City')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Online_Status');
    }
};
