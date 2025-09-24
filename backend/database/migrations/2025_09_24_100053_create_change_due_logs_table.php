<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Change_Due_Logs', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('Account_No')->nullable();
            $table->datetime('Date_Installed')->nullable();
            $table->string('Full_Name')->nullable();
            $table->string('Contact_Number')->nullable();
            $table->string('Email_Address')->nullable();
            $table->text('Address')->nullable();
            $table->string('Location')->nullable();
            $table->string('Plan')->nullable();
            $table->string('Provider')->nullable();
            $table->integer('Previous_Date')->nullable();
            $table->integer('Changed_Date')->nullable();
            $table->decimal('Added_Balance', 10, 2)->nullable();
            $table->text('Remarks')->nullable();
            $table->string('Modified_By')->nullable();
            $table->datetime('Modified_Date')->nullable();
            $table->integer('Barangay')->nullable();
            $table->string('City')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Change_Due_Logs');
    }
};
