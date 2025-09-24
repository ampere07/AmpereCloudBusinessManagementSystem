<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Adjusted_Account_Logs', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->datetime('Date')->nullable();
            $table->text('Remarks')->nullable();
            $table->decimal('Start_Balance', 10, 2)->nullable();
            $table->decimal('End_Balance', 10, 2)->nullable();
            $table->string('Account_No')->nullable();
            $table->datetime('Date_Installed')->nullable();
            $table->string('Full_Name')->nullable();
            $table->string('Contact_Number')->nullable();
            $table->string('Email_Address')->nullable();
            $table->text('Address')->nullable();
            $table->string('Location')->nullable();
            $table->string('Plan')->nullable();
            $table->string('Provider')->nullable();
            $table->string('Username')->nullable();
            $table->string('Modified_By')->nullable();
            $table->datetime('Modified_Date')->nullable();
            $table->string('Attachment_1')->nullable();
            $table->string('Attachment_2')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Adjusted_Account_Logs');
    }
};
