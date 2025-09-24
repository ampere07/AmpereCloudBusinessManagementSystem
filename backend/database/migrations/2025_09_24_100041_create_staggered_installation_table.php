<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Staggered_Installation', function (Blueprint $table) {
            $table->string('Staggered_Install_No')->primary();
            $table->string('Account_No')->nullable();
            $table->string('Full_Name')->nullable();
            $table->string('Contact_Number')->nullable();
            $table->string('Email_Address')->nullable();
            $table->text('Address')->nullable();
            $table->string('Location')->nullable();
            $table->string('Plan')->nullable();
            $table->string('Provider')->nullable();
            $table->date('Staggared_Date')->nullable();
            $table->decimal('Staggered_Balance', 10, 2)->nullable();
            $table->integer('Months_to_Pay')->nullable();
            $table->decimal('Monthly_Payment', 10, 2)->nullable();
            $table->string('Status')->nullable();
            $table->string('1st_Invoice_No')->nullable();
            $table->string('2nd_Invoice_No')->nullable();
            $table->string('3rd_Invoice_No')->nullable();
            $table->string('4th_Invoice_No')->nullable();
            $table->string('5th_Invoice_No')->nullable();
            $table->string('6th_Invoice_No')->nullable();
            $table->string('7th_Invoice_No')->nullable();
            $table->string('8th_Invoice_No')->nullable();
            $table->string('9th_Invoice_No')->nullable();
            $table->string('10th_Invoice_No')->nullable();
            $table->string('11th_Invoice_No')->nullable();
            $table->string('12th_Invoice_No')->nullable();
            $table->string('Account_No_Key')->nullable();
            $table->string('Modified_By')->nullable();
            $table->datetime('Modified_Date')->nullable();
            $table->string('User_Email')->nullable();
            $table->text('Remarks')->nullable();
            $table->integer('Barangay')->nullable();
            $table->string('City')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Staggered_Installation');
    }
};
