<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Statement_of_Account', function (Blueprint $table) {
            $table->string('Statement_No')->primary();
            $table->string('Account_No')->nullable();
            $table->datetime('Date_Installed')->nullable();
            $table->string('Full_Name')->nullable();
            $table->string('Contact_Number')->nullable();
            $table->string('Email_Address')->nullable();
            $table->text('Address')->nullable();
            $table->string('Location')->nullable();
            $table->string('Plan')->nullable();
            $table->string('Provider')->nullable();
            $table->decimal('Balance_from_Previous_Bill', 10, 2)->nullable();
            $table->date('Statement_Date')->nullable();
            $table->decimal('Payment_Received_from_Previous_Bill', 10, 2)->nullable();
            $table->decimal('Remaining_Balance_from_Previous_Bill', 10, 2)->nullable();
            $table->decimal('Monthly_Service_Fee', 10, 2)->nullable();
            $table->decimal('Others_and_Basic_Charges', 10, 2)->nullable();
            $table->decimal('VAT', 10, 2)->nullable();
            $table->date('DUE_DATE')->nullable();
            $table->decimal('AMOUNT_DUE', 10, 2)->nullable();
            $table->decimal('TOTAL_AMOUNT_DUE', 10, 2)->nullable();
            $table->string('EMAIL_Status')->nullable();
            $table->string('SMS_Status')->nullable();
            $table->string('Delivery_Status')->nullable();
            $table->datetime('Delivery_Date')->nullable();
            $table->string('Delivered_By')->nullable();
            $table->text('Delivery_Remarks')->nullable();
            $table->string('Delivery_Proof')->nullable();
            $table->string('Modified_By')->nullable();
            $table->datetime('Modified_Date')->nullable();
            $table->string('User_Email')->nullable();
            $table->string('Print_Link')->nullable();
            $table->boolean('Regenerate')->nullable();
            $table->integer('Barangay')->nullable();
            $table->string('City')->nullable();
            $table->string('Region')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Statement_of_Account');
    }
};
