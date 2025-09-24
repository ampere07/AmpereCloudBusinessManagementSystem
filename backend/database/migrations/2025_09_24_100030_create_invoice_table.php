<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Invoice', function (Blueprint $table) {
            $table->string('Invoice_No')->primary();
            $table->string('Account_No')->nullable();
            $table->date('Invoice_Date')->nullable();
            $table->string('Full_Name')->nullable();
            $table->string('Contact_Number')->nullable();
            $table->string('Email_Address')->nullable();
            $table->text('Address')->nullable();
            $table->string('Location')->nullable();
            $table->string('Plan')->nullable();
            $table->string('Provider')->nullable();
            $table->text('Remarks')->nullable();
            $table->decimal('Invoice_Balance', 10, 2)->nullable();
            $table->decimal('Others_and_Basic_Charges', 10, 2)->nullable();
            $table->decimal('Total_Amount', 10, 2)->nullable();
            $table->decimal('Received_Payment', 10, 2)->nullable();
            $table->datetime('Date_Processed')->nullable();
            $table->string('Processed_By')->nullable();
            $table->date('Due_Date')->nullable();
            $table->string('Invoice_Status')->nullable();
            $table->string('Email_Status')->nullable();
            $table->string('SMS_Status')->nullable();
            $table->string('Payment_Method')->nullable();
            $table->string('Reference_No')->nullable();
            $table->string('OR_No')->nullable();
            $table->string('Modified_By')->nullable();
            $table->datetime('Modified_Date')->nullable();
            $table->string('User_Email')->nullable();
            $table->string('Transaction_ID')->nullable();
            $table->integer('Barangay')->nullable();
            $table->string('City')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Invoice');
    }
};
