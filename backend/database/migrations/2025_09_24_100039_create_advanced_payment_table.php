<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Advanced_Payment', function (Blueprint $table) {
            $table->string('Payment_No')->primary();
            $table->string('Account_No')->nullable();
            $table->datetime('Payment_Date')->nullable();
            $table->string('Full_Name')->nullable();
            $table->string('Contact_Number')->nullable();
            $table->string('Email_Address')->nullable();
            $table->text('Address')->nullable();
            $table->string('Location')->nullable();
            $table->string('Plan')->nullable();
            $table->string('Provider')->nullable();
            $table->string('Payment_for_Month_of')->nullable();
            $table->decimal('Received_Payment', 10, 2)->nullable();
            $table->string('Received_By')->nullable();
            $table->datetime('Received_Date_and_Time')->nullable();
            $table->string('Status')->nullable();
            $table->string('Payment_Method')->nullable();
            $table->string('Reference_No')->nullable();
            $table->string('OR_No')->nullable();
            $table->string('Modified_By')->nullable();
            $table->datetime('Modified_Date')->nullable();
            $table->string('User_Email')->nullable();
            $table->string('Invoice_Used')->nullable();
            $table->integer('Barangay')->nullable();
            $table->string('City')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Advanced_Payment');
    }
};
