<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Discounts', function (Blueprint $table) {
            $table->string('Discount_ID')->primary();
            $table->string('Account_No')->nullable();
            $table->string('Full_Name')->nullable();
            $table->string('Contact_Number')->nullable();
            $table->string('Email_Address')->nullable();
            $table->text('Address')->nullable();
            $table->string('Location')->nullable();
            $table->string('Plan')->nullable();
            $table->string('Provider')->nullable();
            $table->decimal('Discount_Amount', 10, 2)->nullable();
            $table->string('Discount_Status')->nullable();
            $table->date('Used_Date')->nullable();
            $table->date('Date_Created')->nullable();
            $table->string('Processed_By')->nullable();
            $table->datetime('Processed_Date')->nullable();
            $table->string('Approved_By')->nullable();
            $table->string('Modified_By')->nullable();
            $table->datetime('Modified_Date')->nullable();
            $table->string('User_Email')->nullable();
            $table->string('Invoice_Used')->nullable();
            $table->text('Remarks')->nullable();
            $table->decimal('Remaining', 10, 2)->nullable();
            $table->integer('Barangay')->nullable();
            $table->string('City')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Discounts');
    }
};
